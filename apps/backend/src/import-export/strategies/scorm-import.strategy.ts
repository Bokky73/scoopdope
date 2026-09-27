import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as yauzl from 'yauzl';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';
import { parseStringPromise } from 'xml2js';
import { Course } from '../../courses/course.entity';
import { CourseModule } from '../../courses/course-module.entity';
import { Lesson } from '../../courses/lesson.entity';
import { CourseJsonExport, CourseJsonModule } from '../import-export.types';
import { ImportStrategy } from './import-strategy.interface';

// Structural type for the Node.js Readable stream returned by yauzl's
// openReadStream. Defined locally so the file compiles before @types/node is
// installed; structurally compatible with the real Readable once it is.
interface ScormEntryStream {
  pipe<T extends { on(event: string, listener: (...args: unknown[]) => void): T }>(
    destination: T,
    options?: { end?: boolean }
  ): T;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: string, listener: (...args: unknown[]) => void): this;
}

@Injectable()
export class ScormImportStrategy implements ImportStrategy {
  constructor(
    private readonly courseRepo: Repository<Course>,
    private readonly moduleRepo: Repository<CourseModule>,
    private readonly lessonRepo: Repository<Lesson>
  ) {}

  canHandle(mimeType: string): boolean {
    return mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed' || mimeType.endsWith('.zip');
  }

  /**
   * Buffer-based entry point (used by bulk import).
   * Spills the buffer to a temp file so the yauzl streaming path reads from
   * disk rather than keeping all decompressed entries in heap simultaneously.
   */
  async import(file: Buffer, userId: string): Promise<{ courseId: string }> {
    const tmpFile = path.join(os.tmpdir(), `scorm-upload-${crypto.randomBytes(8).toString('hex')}.zip`);
    try {
      await fs.promises.writeFile(tmpFile, file);
      return await this.importFromPath(tmpFile, userId);
    } finally {
      await fs.promises.unlink(tmpFile).catch(() => undefined);
    }
  }

  /**
   * Path-based entry point (used by the dedicated SCORM endpoint where multer
   * writes the upload directly to disk — no Buffer ever allocated on the heap).
   */
  async importFromPath(zipPath: string, userId: string): Promise<{ courseId: string }> {
    const extractDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'scorm-extract-'));
    try {
      await this.streamExtract(zipPath, extractDir);
      return await this.processExtracted(extractDir, userId);
    } finally {
      await fs.promises.rm(extractDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  // ─── Streaming extraction ───────────────────────────────────────────────────

  private streamExtract(zipPath: string, destDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      yauzl.open(zipPath, { lazyEntries: true, decodeStrings: true }, (err: Error | null, zipFile: yauzl.ZipFile) => {
        if (err || !zipFile) {
          return reject(new BadRequestException('Invalid ZIP/SCORM package'));
        }

        zipFile.readEntry();

        zipFile.on('entry', (entry: yauzl.Entry) => {
          const destPath = this.resolveSafe(destDir, entry.fileName);

          // Path traversal attempt — skip and advance to next entry
          if (!destPath) {
            zipFile.readEntry();
            return;
          }

          if (/\/$/.test(entry.fileName)) {
            // Directory entry: ensure it exists, then move on
            fs.promises
              .mkdir(destPath, { recursive: true })
              .then(() => zipFile.readEntry())
              .catch(reject);
            return;
          }

          // File entry: open a read stream and pipe directly to disk.
          // Only one entry is ever in flight at a time — nothing is buffered.
          zipFile.openReadStream(entry, (streamErr: Error | null, readStream: NodeJS.ReadableStream) => {
            if (streamErr || !readStream) {
              return reject(streamErr ?? new Error('Failed to open entry read stream'));
            }

            fs.promises
              .mkdir(path.dirname(destPath), { recursive: true })
              .then(
                () =>
                  new Promise<void>((res, rej) => {
                    const writeStream = fs.createWriteStream(destPath);
                    readStream.pipe(writeStream);
                    writeStream.on('finish', res);
                    writeStream.on('error', rej);
                    readStream.on('error', (e: Error) => rej(e));
                  })
              )
              .then(() => zipFile.readEntry())
              .catch(reject);
          });
        });

        zipFile.on('end', resolve);
        zipFile.on('error', reject);
      });
    });
  }

  /**
   * Resolves an in-archive path against destDir and verifies the result stays
   * inside destDir (path traversal guard — see issue #23).
   * Returns null for any entry that must be dropped.
   */
  private resolveSafe(destDir: string, entryName: string): string | null {
    if (!entryName || entryName.includes('\0')) return null;

    const resolved = path.resolve(destDir, entryName);
    const boundary = path.resolve(destDir);

    if (resolved !== boundary && !resolved.startsWith(boundary + path.sep)) return null;

    return resolved;
  }

  // ─── Manifest parsing & DB persistence ─────────────────────────────────────

  private async processExtracted(extractDir: string, userId: string): Promise<{ courseId: string }> {
    const manifestPath = await this.findManifest(extractDir);
    if (!manifestPath) throw new BadRequestException('imsmanifest.xml not found in package');

    const xml = await fs.promises.readFile(manifestPath, 'utf-8');
    const manifest = await parseStringPromise(xml, { explicitArray: false });

    const payload = await this.parseScormManifest(manifest, extractDir);

    const course = await this.courseRepo.save(
      this.courseRepo.create({
        title: payload.course.title,
        description: payload.course.description,
        level: payload.course.level,
        durationHours: payload.course.durationHours,
        requiresKyc: payload.course.requiresKyc ?? false,
        instructorId: userId,
        isPublished: false,
      })
    );

    for (const mod of payload.course.modules ?? []) {
      const savedModule = await this.moduleRepo.save(
        this.moduleRepo.create({ courseId: course.id, title: mod.title, order: mod.order })
      );
      for (const lesson of mod.lessons ?? []) {
        await this.lessonRepo.save(
          this.lessonRepo.create({
            moduleId: savedModule.id,
            title: lesson.title,
            content: lesson.content,
            videoUrl: lesson.videoUrl ?? undefined,
            order: lesson.order,
            durationMinutes: lesson.durationMinutes,
          })
        );
      }
    }

    return { courseId: course.id };
  }

  private async findManifest(dir: string): Promise<string | null> {
    const direct = path.join(dir, 'imsmanifest.xml');
    try {
      await fs.promises.access(direct);
      return direct;
    } catch {
      // Check one level deep — some packages wrap everything in a sub-folder
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const nested = path.join(dir, entry.name, 'imsmanifest.xml');
          try {
            await fs.promises.access(nested);
            return nested;
          } catch {
            // continue searching
          }
        }
      }
    }
    return null;
  }

  private async parseScormManifest(manifest: Record<string, unknown>, extractDir: string): Promise<CourseJsonExport> {
    const root = manifest['manifest'] as Record<string, unknown>;
    const metadata = root?.['metadata'] as Record<string, unknown> | undefined;
    const organizations = root?.['organizations'] as Record<string, unknown> | undefined;
    const resources = root?.['resources'] as Record<string, unknown> | undefined;

    const title =
      (metadata?.['schema'] as string) ??
      this.extractScormTitle(organizations) ??
      'Imported SCORM Course';

    const orgList = organizations?.['organization'];
    const org = Array.isArray(orgList) ? orgList[0] : orgList ?? {};
    const orgTitle = (org as Record<string, unknown>)?.['title'] as string | undefined;

    const items = (org as Record<string, unknown>)?.['item'];
    const itemList: Record<string, unknown>[] = Array.isArray(items)
      ? items
      : items
      ? [items as Record<string, unknown>]
      : [];

    const resourceMap = await this.buildResourceMap(resources, extractDir);

    const modules: CourseJsonModule[] = itemList.map((item, idx) => {
      const itemTitle = (item['title'] as string) ?? `Module ${idx + 1}`;
      const subItems = item['item'];
      const subList: Record<string, unknown>[] = Array.isArray(subItems)
        ? subItems
        : subItems
        ? [subItems as Record<string, unknown>]
        : [];

      const lessons = subList.length
        ? subList.map((sub, li) => ({
            title: (sub['title'] as string) ?? `Lesson ${li + 1}`,
            content: resourceMap[(sub['$'] as Record<string, string>)?.identifierref ?? ''] ?? '',
            order: li,
            durationMinutes: 0,
          }))
        : [
            {
              title: itemTitle,
              content: resourceMap[(item['$'] as Record<string, string>)?.identifierref ?? ''] ?? '',
              order: 0,
              durationMinutes: 0,
            },
          ];

      return { title: itemTitle, order: idx, lessons };
    });

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      course: {
        title: orgTitle ?? title,
        description: 'Imported from SCORM package',
        level: 'beginner',
        durationHours: 0,
        requiresKyc: false,
        modules,
      },
    };
  }

  private extractScormTitle(organizations: Record<string, unknown> | undefined): string | undefined {
    const org = organizations?.['organization'];
    const first = Array.isArray(org) ? org[0] : org;
    return (first as Record<string, unknown>)?.['title'] as string | undefined;
  }

  /**
   * Reads each referenced resource file from the already-extracted directory.
   * Files are read one at a time from disk — no simultaneous in-memory buffering
   * of the full archive content.
   */
  private async buildResourceMap(
    resources: Record<string, unknown> | undefined,
    extractDir: string
  ): Promise<Record<string, string>> {
    const map: Record<string, string> = {};
    if (!resources) return map;

    const resList = resources['resource'];
    const list: Record<string, unknown>[] = Array.isArray(resList)
      ? resList
      : resList
      ? [resList as Record<string, unknown>]
      : [];

    for (const res of list) {
      const attrs = res['$'] as Record<string, string> | undefined;
      const id = attrs?.['identifier'];
      const href = attrs?.['href'];
      if (!id || !href) continue;

      // Second path traversal guard: resource hrefs can also contain `../`
      const resolved = this.resolveSafe(extractDir, href);
      if (!resolved) continue;

      try {
        map[id] = await fs.promises.readFile(resolved, 'utf-8');
      } catch {
        // Resource listed in manifest but absent from package — skip
      }
    }

    return map;
  }
}
