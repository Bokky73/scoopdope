// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as AdmZip from 'adm-zip';
import { parseStringPromise } from 'xml2js';
import { Course } from '../courses/course.entity';
import { CourseModule } from '../courses/course-module.entity';
import { Lesson } from '../courses/lesson.entity';
import { ImportJob, ImportJobStatus } from './import-job.entity';
import { CourseJsonExport, CourseJsonModule } from './import-export.types';
@Injectable()
export class ImportExportService {
  private readonly logger = new Logger(ImportExportService.name);
  constructor(@InjectRepository(Course)
  private readonly courseRepo: Repository<Course>, @InjectRepository(CourseModule)
  private readonly moduleRepo: Repository<CourseModule>, @InjectRepository(Lesson)
  private readonly lessonRepo: Repository<Lesson>, @InjectRepository(ImportJob)
  private readonly jobRepo: Repository<ImportJob>) {}

  // ─── Export ────────────────────────────────────────────────────────────────

  async exportCourse(courseId: string): Promise<CourseJsonExport> {
    if (stryMutAct_9fa48("3727")) {
      {}
    } else {
      stryCov_9fa48("3727");
      const course = await this.courseRepo.findOne(stryMutAct_9fa48("3728") ? {} : (stryCov_9fa48("3728"), {
        where: stryMutAct_9fa48("3729") ? {} : (stryCov_9fa48("3729"), {
          id: courseId,
          isDeleted: stryMutAct_9fa48("3730") ? true : (stryCov_9fa48("3730"), false)
        }),
        relations: stryMutAct_9fa48("3731") ? [] : (stryCov_9fa48("3731"), [stryMutAct_9fa48("3732") ? "" : (stryCov_9fa48("3732"), 'modules'), stryMutAct_9fa48("3733") ? "" : (stryCov_9fa48("3733"), 'modules.lessons')])
      }));
      if (stryMutAct_9fa48("3736") ? false : stryMutAct_9fa48("3735") ? true : stryMutAct_9fa48("3734") ? course : (stryCov_9fa48("3734", "3735", "3736"), !course)) throw new NotFoundException(stryMutAct_9fa48("3737") ? "" : (stryCov_9fa48("3737"), 'Course not found'));
      return stryMutAct_9fa48("3738") ? {} : (stryCov_9fa48("3738"), {
        version: stryMutAct_9fa48("3739") ? "" : (stryCov_9fa48("3739"), '1.0'),
        exportedAt: new Date().toISOString(),
        course: stryMutAct_9fa48("3740") ? {} : (stryCov_9fa48("3740"), {
          title: course.title,
          description: course.description,
          level: course.level,
          durationHours: course.durationHours,
          requiresKyc: course.requiresKyc,
          modules: stryMutAct_9fa48("3741") ? (course.modules ?? []).map(m => ({
            title: m.title,
            order: m.order,
            lessons: (m.lessons ?? []).sort((a, b) => a.order - b.order).map(l => ({
              title: l.title,
              content: l.content,
              videoUrl: l.videoUrl ?? undefined,
              order: l.order,
              durationMinutes: l.durationMinutes
            }))
          })) : (stryCov_9fa48("3741"), (stryMutAct_9fa48("3742") ? course.modules && [] : (stryCov_9fa48("3742"), course.modules ?? (stryMutAct_9fa48("3743") ? ["Stryker was here"] : (stryCov_9fa48("3743"), [])))).sort(stryMutAct_9fa48("3744") ? () => undefined : (stryCov_9fa48("3744"), (a, b) => stryMutAct_9fa48("3745") ? a.order + b.order : (stryCov_9fa48("3745"), a.order - b.order))).map(stryMutAct_9fa48("3746") ? () => undefined : (stryCov_9fa48("3746"), m => stryMutAct_9fa48("3747") ? {} : (stryCov_9fa48("3747"), {
            title: m.title,
            order: m.order,
            lessons: stryMutAct_9fa48("3748") ? (m.lessons ?? []).map(l => ({
              title: l.title,
              content: l.content,
              videoUrl: l.videoUrl ?? undefined,
              order: l.order,
              durationMinutes: l.durationMinutes
            })) : (stryCov_9fa48("3748"), (stryMutAct_9fa48("3749") ? m.lessons && [] : (stryCov_9fa48("3749"), m.lessons ?? (stryMutAct_9fa48("3750") ? ["Stryker was here"] : (stryCov_9fa48("3750"), [])))).sort(stryMutAct_9fa48("3751") ? () => undefined : (stryCov_9fa48("3751"), (a, b) => stryMutAct_9fa48("3752") ? a.order + b.order : (stryCov_9fa48("3752"), a.order - b.order))).map(stryMutAct_9fa48("3753") ? () => undefined : (stryCov_9fa48("3753"), l => stryMutAct_9fa48("3754") ? {} : (stryCov_9fa48("3754"), {
              title: l.title,
              content: l.content,
              videoUrl: stryMutAct_9fa48("3755") ? l.videoUrl && undefined : (stryCov_9fa48("3755"), l.videoUrl ?? undefined),
              order: l.order,
              durationMinutes: l.durationMinutes
            }))))
          }))))
        })
      });
    }
  }

  // ─── JSON Import ───────────────────────────────────────────────────────────

  async importJson(buffer: Buffer, instructorId: string): Promise<{
    courseId: string;
  }> {
    if (stryMutAct_9fa48("3756")) {
      {}
    } else {
      stryCov_9fa48("3756");
      let payload: CourseJsonExport;
      try {
        if (stryMutAct_9fa48("3757")) {
          {}
        } else {
          stryCov_9fa48("3757");
          payload = JSON.parse(buffer.toString(stryMutAct_9fa48("3758") ? "" : (stryCov_9fa48("3758"), 'utf-8')));
        }
      } catch {
        if (stryMutAct_9fa48("3759")) {
          {}
        } else {
          stryCov_9fa48("3759");
          throw new BadRequestException(stryMutAct_9fa48("3760") ? "" : (stryCov_9fa48("3760"), 'Invalid JSON file'));
        }
      }
      this.validateJsonPayload(payload);
      const courseId = await this.persistCourse(payload.course, instructorId);
      return stryMutAct_9fa48("3761") ? {} : (stryCov_9fa48("3761"), {
        courseId
      });
    }
  }

  // ─── SCORM Import ──────────────────────────────────────────────────────────

  async importScorm(buffer: Buffer, instructorId: string): Promise<{
    courseId: string;
  }> {
    if (stryMutAct_9fa48("3762")) {
      {}
    } else {
      stryCov_9fa48("3762");
      let zip: AdmZip;
      try {
        if (stryMutAct_9fa48("3763")) {
          {}
        } else {
          stryCov_9fa48("3763");
          zip = new AdmZip(buffer);
        }
      } catch {
        if (stryMutAct_9fa48("3764")) {
          {}
        } else {
          stryCov_9fa48("3764");
          throw new BadRequestException(stryMutAct_9fa48("3765") ? "" : (stryCov_9fa48("3765"), 'Invalid ZIP/SCORM package'));
        }
      }
      const manifestEntry = stryMutAct_9fa48("3766") ? zip.getEntry('imsmanifest.xml') && zip.getEntries().find(e => e.entryName.endsWith('imsmanifest.xml')) : (stryCov_9fa48("3766"), zip.getEntry(stryMutAct_9fa48("3767") ? "" : (stryCov_9fa48("3767"), 'imsmanifest.xml')) ?? zip.getEntries().find(stryMutAct_9fa48("3768") ? () => undefined : (stryCov_9fa48("3768"), e => stryMutAct_9fa48("3769") ? e.entryName.startsWith('imsmanifest.xml') : (stryCov_9fa48("3769"), e.entryName.endsWith(stryMutAct_9fa48("3770") ? "" : (stryCov_9fa48("3770"), 'imsmanifest.xml'))))));
      if (stryMutAct_9fa48("3773") ? false : stryMutAct_9fa48("3772") ? true : stryMutAct_9fa48("3771") ? manifestEntry : (stryCov_9fa48("3771", "3772", "3773"), !manifestEntry)) throw new BadRequestException(stryMutAct_9fa48("3774") ? "" : (stryCov_9fa48("3774"), 'imsmanifest.xml not found in package'));
      const xml = manifestEntry.getData().toString(stryMutAct_9fa48("3775") ? "" : (stryCov_9fa48("3775"), 'utf-8'));
      const manifest = await parseStringPromise(xml, stryMutAct_9fa48("3776") ? {} : (stryCov_9fa48("3776"), {
        explicitArray: stryMutAct_9fa48("3777") ? true : (stryCov_9fa48("3777"), false)
      }));
      const courseData = this.parseScormManifest(manifest, zip);
      this.validateJsonPayload(courseData);
      const courseId = await this.persistCourse(courseData.course, instructorId);
      return stryMutAct_9fa48("3778") ? {} : (stryCov_9fa48("3778"), {
        courseId
      });
    }
  }

  // ─── Bulk Migration ────────────────────────────────────────────────────────

  async startBulkImport(buffers: {
    name: string;
    data: Buffer;
  }[], instructorId: string): Promise<ImportJob> {
    if (stryMutAct_9fa48("3779")) {
      {}
    } else {
      stryCov_9fa48("3779");
      const job = await this.jobRepo.save(this.jobRepo.create(stryMutAct_9fa48("3780") ? {} : (stryCov_9fa48("3780"), {
        instructorId,
        status: ImportJobStatus.PENDING,
        total: buffers.length,
        processed: 0
      })));

      // Run async without awaiting — progress tracked via job entity
      this.processBulk(job.id, buffers, instructorId).catch(stryMutAct_9fa48("3781") ? () => undefined : (stryCov_9fa48("3781"), err => this.logger.error(stryMutAct_9fa48("3782") ? `` : (stryCov_9fa48("3782"), `Bulk import job ${job.id} failed: ${err}`))));
      return job;
    }
  }
  async getJobStatus(jobId: string): Promise<ImportJob> {
    if (stryMutAct_9fa48("3783")) {
      {}
    } else {
      stryCov_9fa48("3783");
      const job = await this.jobRepo.findOne(stryMutAct_9fa48("3784") ? {} : (stryCov_9fa48("3784"), {
        where: stryMutAct_9fa48("3785") ? {} : (stryCov_9fa48("3785"), {
          id: jobId
        })
      }));
      if (stryMutAct_9fa48("3788") ? false : stryMutAct_9fa48("3787") ? true : stryMutAct_9fa48("3786") ? job : (stryCov_9fa48("3786", "3787", "3788"), !job)) throw new NotFoundException(stryMutAct_9fa48("3789") ? "" : (stryCov_9fa48("3789"), 'Import job not found'));
      return job;
    }
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private async processBulk(jobId: string, buffers: {
    name: string;
    data: Buffer;
  }[], instructorId: string) {
    if (stryMutAct_9fa48("3790")) {
      {}
    } else {
      stryCov_9fa48("3790");
      await this.jobRepo.update(jobId, stryMutAct_9fa48("3791") ? {} : (stryCov_9fa48("3791"), {
        status: ImportJobStatus.PROCESSING
      }));
      const results: Record<string, unknown> = {};
      let processed = 0;
      for (const {
        name,
        data
      } of buffers) {
        if (stryMutAct_9fa48("3792")) {
          {}
        } else {
          stryCov_9fa48("3792");
          try {
            if (stryMutAct_9fa48("3793")) {
              {}
            } else {
              stryCov_9fa48("3793");
              const isScorm = stryMutAct_9fa48("3794") ? name.startsWith('.zip') : (stryCov_9fa48("3794"), name.endsWith(stryMutAct_9fa48("3795") ? "" : (stryCov_9fa48("3795"), '.zip')));
              const res = isScorm ? await this.importScorm(data, instructorId) : await this.importJson(data, instructorId);
              results[name] = stryMutAct_9fa48("3796") ? {} : (stryCov_9fa48("3796"), {
                success: stryMutAct_9fa48("3797") ? false : (stryCov_9fa48("3797"), true),
                courseId: res.courseId
              });
            }
          } catch (err: unknown) {
            if (stryMutAct_9fa48("3798")) {
              {}
            } else {
              stryCov_9fa48("3798");
              results[name] = stryMutAct_9fa48("3799") ? {} : (stryCov_9fa48("3799"), {
                success: stryMutAct_9fa48("3800") ? true : (stryCov_9fa48("3800"), false),
                error: err instanceof Error ? err.message : String(err)
              });
            }
          }
          stryMutAct_9fa48("3801") ? processed-- : (stryCov_9fa48("3801"), processed++);
          await this.jobRepo.update(jobId, stryMutAct_9fa48("3802") ? {} : (stryCov_9fa48("3802"), {
            processed
          }));
        }
      }

      // Use query builder to set jsonb result — TypeORM update() doesn't handle jsonb well
      await this.jobRepo.createQueryBuilder().update(ImportJob).set(stryMutAct_9fa48("3803") ? {} : (stryCov_9fa48("3803"), {
        status: ImportJobStatus.DONE,
        result: stryMutAct_9fa48("3804") ? () => undefined : (stryCov_9fa48("3804"), () => stryMutAct_9fa48("3805") ? `` : (stryCov_9fa48("3805"), `:result`))
      })).where(stryMutAct_9fa48("3806") ? "" : (stryCov_9fa48("3806"), 'id = :id'), stryMutAct_9fa48("3807") ? {} : (stryCov_9fa48("3807"), {
        id: jobId
      })).setParameter(stryMutAct_9fa48("3808") ? "" : (stryCov_9fa48("3808"), 'result'), JSON.stringify(results)).execute();
    }
  }
  private async persistCourse(data: CourseJsonExport['course'], instructorId: string): Promise<string> {
    if (stryMutAct_9fa48("3809")) {
      {}
    } else {
      stryCov_9fa48("3809");
      const course = await this.courseRepo.save(this.courseRepo.create(stryMutAct_9fa48("3810") ? {} : (stryCov_9fa48("3810"), {
        title: data.title,
        description: data.description,
        level: data.level,
        durationHours: data.durationHours,
        requiresKyc: stryMutAct_9fa48("3811") ? data.requiresKyc && false : (stryCov_9fa48("3811"), data.requiresKyc ?? (stryMutAct_9fa48("3812") ? true : (stryCov_9fa48("3812"), false))),
        instructorId,
        isPublished: stryMutAct_9fa48("3813") ? true : (stryCov_9fa48("3813"), false)
      })));
      for (const mod of stryMutAct_9fa48("3814") ? data.modules && [] : (stryCov_9fa48("3814"), data.modules ?? (stryMutAct_9fa48("3815") ? ["Stryker was here"] : (stryCov_9fa48("3815"), [])))) {
        if (stryMutAct_9fa48("3816")) {
          {}
        } else {
          stryCov_9fa48("3816");
          const savedModule = await this.moduleRepo.save(this.moduleRepo.create(stryMutAct_9fa48("3817") ? {} : (stryCov_9fa48("3817"), {
            courseId: course.id,
            title: mod.title,
            order: mod.order
          })));
          for (const lesson of stryMutAct_9fa48("3818") ? mod.lessons && [] : (stryCov_9fa48("3818"), mod.lessons ?? (stryMutAct_9fa48("3819") ? ["Stryker was here"] : (stryCov_9fa48("3819"), [])))) {
            if (stryMutAct_9fa48("3820")) {
              {}
            } else {
              stryCov_9fa48("3820");
              await this.lessonRepo.save(this.lessonRepo.create(stryMutAct_9fa48("3821") ? {} : (stryCov_9fa48("3821"), {
                moduleId: savedModule.id,
                title: lesson.title,
                content: lesson.content,
                videoUrl: stryMutAct_9fa48("3822") ? lesson.videoUrl && undefined : (stryCov_9fa48("3822"), lesson.videoUrl ?? undefined),
                order: lesson.order,
                durationMinutes: lesson.durationMinutes
              })));
            }
          }
        }
      }
      return course.id;
    }
  }
  private validateJsonPayload(payload: unknown): asserts payload is CourseJsonExport {
    if (stryMutAct_9fa48("3823")) {
      {}
    } else {
      stryCov_9fa48("3823");
      const p = payload as CourseJsonExport;
      if (stryMutAct_9fa48("3826") ? false : stryMutAct_9fa48("3825") ? true : stryMutAct_9fa48("3824") ? p?.course?.title : (stryCov_9fa48("3824", "3825", "3826"), !(stryMutAct_9fa48("3828") ? p.course?.title : stryMutAct_9fa48("3827") ? p?.course.title : (stryCov_9fa48("3827", "3828"), p?.course?.title)))) throw new BadRequestException(stryMutAct_9fa48("3829") ? "" : (stryCov_9fa48("3829"), 'Missing required field: course.title'));
      if (stryMutAct_9fa48("3832") ? false : stryMutAct_9fa48("3831") ? true : stryMutAct_9fa48("3830") ? p.course.description : (stryCov_9fa48("3830", "3831", "3832"), !p.course.description)) throw new BadRequestException(stryMutAct_9fa48("3833") ? "" : (stryCov_9fa48("3833"), 'Missing required field: course.description'));
      if (stryMutAct_9fa48("3836") ? false : stryMutAct_9fa48("3835") ? true : stryMutAct_9fa48("3834") ? Array.isArray(p.course.modules) : (stryCov_9fa48("3834", "3835", "3836"), !Array.isArray(p.course.modules))) throw new BadRequestException(stryMutAct_9fa48("3837") ? "" : (stryCov_9fa48("3837"), 'course.modules must be an array'));
      for (const mod of p.course.modules) {
        if (stryMutAct_9fa48("3838")) {
          {}
        } else {
          stryCov_9fa48("3838");
          if (stryMutAct_9fa48("3841") ? false : stryMutAct_9fa48("3840") ? true : stryMutAct_9fa48("3839") ? mod.title : (stryCov_9fa48("3839", "3840", "3841"), !mod.title)) throw new BadRequestException(stryMutAct_9fa48("3842") ? "" : (stryCov_9fa48("3842"), 'Each module must have a title'));
          if (stryMutAct_9fa48("3845") ? false : stryMutAct_9fa48("3844") ? true : stryMutAct_9fa48("3843") ? Array.isArray(mod.lessons) : (stryCov_9fa48("3843", "3844", "3845"), !Array.isArray(mod.lessons))) throw new BadRequestException(stryMutAct_9fa48("3846") ? "" : (stryCov_9fa48("3846"), 'Each module must have a lessons array'));
          for (const lesson of mod.lessons) {
            if (stryMutAct_9fa48("3847")) {
              {}
            } else {
              stryCov_9fa48("3847");
              if (stryMutAct_9fa48("3850") ? false : stryMutAct_9fa48("3849") ? true : stryMutAct_9fa48("3848") ? lesson.title : (stryCov_9fa48("3848", "3849", "3850"), !lesson.title)) throw new BadRequestException(stryMutAct_9fa48("3851") ? "" : (stryCov_9fa48("3851"), 'Each lesson must have a title'));
              if (stryMutAct_9fa48("3854") ? lesson.content !== undefined : stryMutAct_9fa48("3853") ? false : stryMutAct_9fa48("3852") ? true : (stryCov_9fa48("3852", "3853", "3854"), lesson.content === undefined)) throw new BadRequestException(stryMutAct_9fa48("3855") ? "" : (stryCov_9fa48("3855"), 'Each lesson must have content'));
            }
          }
        }
      }
    }
  }
  private parseScormManifest(manifest: Record<string, unknown>, zip: AdmZip): CourseJsonExport {
    if (stryMutAct_9fa48("3856")) {
      {}
    } else {
      stryCov_9fa48("3856");
      // Support SCORM 1.2 and 2004 — both use imsmanifest.xml with <manifest> root
      const root = manifest['manifest'] as Record<string, unknown>;
      const metadata = root?.['metadata'] as Record<string, unknown> | undefined;
      const organizations = root?.['organizations'] as Record<string, unknown> | undefined;
      const resources = root?.['resources'] as Record<string, unknown> | undefined;
      const title = stryMutAct_9fa48("3857") ? (metadata?.['schema'] as string ?? this.extractScormTitle(organizations)) && 'Imported SCORM Course' : (stryCov_9fa48("3857"), (stryMutAct_9fa48("3858") ? metadata?.['schema'] as string && this.extractScormTitle(organizations) : (stryCov_9fa48("3858"), metadata?.['schema'] as string ?? this.extractScormTitle(organizations))) ?? (stryMutAct_9fa48("3859") ? "" : (stryCov_9fa48("3859"), 'Imported SCORM Course')));
      const orgList = stryMutAct_9fa48("3860") ? organizations['organization'] : (stryCov_9fa48("3860"), organizations?.[stryMutAct_9fa48("3861") ? "" : (stryCov_9fa48("3861"), 'organization')]);
      const org = Array.isArray(orgList) ? orgList[0] : stryMutAct_9fa48("3862") ? orgList && {} : (stryCov_9fa48("3862"), orgList ?? {});
      const orgTitle = (org as Record<string, unknown>)?.['title'] as string | undefined;
      const items = stryMutAct_9fa48("3863") ? (org as Record<string, unknown>)['item'] : (stryCov_9fa48("3863"), (org as Record<string, unknown>)?.[stryMutAct_9fa48("3864") ? "" : (stryCov_9fa48("3864"), 'item')]);
      const itemList: Record<string, unknown>[] = Array.isArray(items) ? items : items ? stryMutAct_9fa48("3865") ? [] : (stryCov_9fa48("3865"), [items as Record<string, unknown>]) : stryMutAct_9fa48("3866") ? ["Stryker was here"] : (stryCov_9fa48("3866"), []);
      const resourceMap = this.buildResourceMap(resources, zip);
      const modules: CourseJsonModule[] = itemList.map((item, idx) => {
        if (stryMutAct_9fa48("3867")) {
          {}
        } else {
          stryCov_9fa48("3867");
          const itemTitle = stryMutAct_9fa48("3868") ? item['title'] as string && `Module ${idx + 1}` : (stryCov_9fa48("3868"), item['title'] as string ?? (stryMutAct_9fa48("3869") ? `` : (stryCov_9fa48("3869"), `Module ${stryMutAct_9fa48("3870") ? idx - 1 : (stryCov_9fa48("3870"), idx + 1)}`)));
          const subItems = item[stryMutAct_9fa48("3871") ? "" : (stryCov_9fa48("3871"), 'item')];
          const subList: Record<string, unknown>[] = Array.isArray(subItems) ? subItems : subItems ? stryMutAct_9fa48("3872") ? [] : (stryCov_9fa48("3872"), [subItems as Record<string, unknown>]) : stryMutAct_9fa48("3873") ? ["Stryker was here"] : (stryCov_9fa48("3873"), []);
          const lessons = subList.length ? subList.map(stryMutAct_9fa48("3874") ? () => undefined : (stryCov_9fa48("3874"), (sub, li) => stryMutAct_9fa48("3875") ? {} : (stryCov_9fa48("3875"), {
            title: stryMutAct_9fa48("3876") ? sub['title'] as string && `Lesson ${li + 1}` : (stryCov_9fa48("3876"), sub['title'] as string ?? (stryMutAct_9fa48("3877") ? `` : (stryCov_9fa48("3877"), `Lesson ${stryMutAct_9fa48("3878") ? li - 1 : (stryCov_9fa48("3878"), li + 1)}`))),
            content: stryMutAct_9fa48("3879") ? resourceMap[(sub['$'] as Record<string, string>)?.identifierref ?? ''] && '' : (stryCov_9fa48("3879"), resourceMap[stryMutAct_9fa48("3880") ? (sub['$'] as Record<string, string>)?.identifierref && '' : (stryCov_9fa48("3880"), (stryMutAct_9fa48("3881") ? (sub['$'] as Record<string, string>).identifierref : (stryCov_9fa48("3881"), (sub['$'] as Record<string, string>)?.identifierref)) ?? (stryMutAct_9fa48("3882") ? "Stryker was here!" : (stryCov_9fa48("3882"), '')))] ?? (stryMutAct_9fa48("3883") ? "Stryker was here!" : (stryCov_9fa48("3883"), ''))),
            order: li,
            durationMinutes: 0
          }))) : stryMutAct_9fa48("3884") ? [] : (stryCov_9fa48("3884"), [stryMutAct_9fa48("3885") ? {} : (stryCov_9fa48("3885"), {
            title: itemTitle,
            content: stryMutAct_9fa48("3886") ? resourceMap[(item['$'] as Record<string, string>)?.identifierref ?? ''] && '' : (stryCov_9fa48("3886"), resourceMap[stryMutAct_9fa48("3887") ? (item['$'] as Record<string, string>)?.identifierref && '' : (stryCov_9fa48("3887"), (stryMutAct_9fa48("3888") ? (item['$'] as Record<string, string>).identifierref : (stryCov_9fa48("3888"), (item['$'] as Record<string, string>)?.identifierref)) ?? (stryMutAct_9fa48("3889") ? "Stryker was here!" : (stryCov_9fa48("3889"), '')))] ?? (stryMutAct_9fa48("3890") ? "Stryker was here!" : (stryCov_9fa48("3890"), ''))),
            order: 0,
            durationMinutes: 0
          })]);
          return stryMutAct_9fa48("3891") ? {} : (stryCov_9fa48("3891"), {
            title: itemTitle,
            order: idx,
            lessons
          });
        }
      });
      return stryMutAct_9fa48("3892") ? {} : (stryCov_9fa48("3892"), {
        version: stryMutAct_9fa48("3893") ? "" : (stryCov_9fa48("3893"), '1.0'),
        exportedAt: new Date().toISOString(),
        course: stryMutAct_9fa48("3894") ? {} : (stryCov_9fa48("3894"), {
          title: stryMutAct_9fa48("3895") ? orgTitle && title : (stryCov_9fa48("3895"), orgTitle ?? title),
          description: stryMutAct_9fa48("3896") ? `` : (stryCov_9fa48("3896"), `Imported from SCORM package`),
          level: stryMutAct_9fa48("3897") ? "" : (stryCov_9fa48("3897"), 'beginner'),
          durationHours: 0,
          requiresKyc: stryMutAct_9fa48("3898") ? true : (stryCov_9fa48("3898"), false),
          modules
        })
      });
    }
  }
  private extractScormTitle(organizations: Record<string, unknown> | undefined): string | undefined {
    if (stryMutAct_9fa48("3899")) {
      {}
    } else {
      stryCov_9fa48("3899");
      const org = stryMutAct_9fa48("3900") ? organizations['organization'] : (stryCov_9fa48("3900"), organizations?.[stryMutAct_9fa48("3901") ? "" : (stryCov_9fa48("3901"), 'organization')]);
      const first = Array.isArray(org) ? org[0] : org;
      return (first as Record<string, unknown>)?.['title'] as string | undefined;
    }
  }
  private buildResourceMap(resources: Record<string, unknown> | undefined, zip: AdmZip): Record<string, string> {
    if (stryMutAct_9fa48("3902")) {
      {}
    } else {
      stryCov_9fa48("3902");
      const map: Record<string, string> = {};
      if (stryMutAct_9fa48("3905") ? false : stryMutAct_9fa48("3904") ? true : stryMutAct_9fa48("3903") ? resources : (stryCov_9fa48("3903", "3904", "3905"), !resources)) return map;
      const resList = resources[stryMutAct_9fa48("3906") ? "" : (stryCov_9fa48("3906"), 'resource')];
      const list: Record<string, unknown>[] = Array.isArray(resList) ? resList : resList ? stryMutAct_9fa48("3907") ? [] : (stryCov_9fa48("3907"), [resList as Record<string, unknown>]) : stryMutAct_9fa48("3908") ? ["Stryker was here"] : (stryCov_9fa48("3908"), []);
      for (const res of list) {
        if (stryMutAct_9fa48("3909")) {
          {}
        } else {
          stryCov_9fa48("3909");
          const attrs = res['$'] as Record<string, string> | undefined;
          const id = stryMutAct_9fa48("3910") ? attrs['identifier'] : (stryCov_9fa48("3910"), attrs?.[stryMutAct_9fa48("3911") ? "" : (stryCov_9fa48("3911"), 'identifier')]);
          const href = stryMutAct_9fa48("3912") ? attrs['href'] : (stryCov_9fa48("3912"), attrs?.[stryMutAct_9fa48("3913") ? "" : (stryCov_9fa48("3913"), 'href')]);
          if (stryMutAct_9fa48("3916") ? !id && !href : stryMutAct_9fa48("3915") ? false : stryMutAct_9fa48("3914") ? true : (stryCov_9fa48("3914", "3915", "3916"), (stryMutAct_9fa48("3917") ? id : (stryCov_9fa48("3917"), !id)) || (stryMutAct_9fa48("3918") ? href : (stryCov_9fa48("3918"), !href)))) continue;
          const entry = stryMutAct_9fa48("3919") ? zip.getEntry(href) && zip.getEntries().find(e => e.entryName.endsWith(href)) : (stryCov_9fa48("3919"), zip.getEntry(href) ?? zip.getEntries().find(stryMutAct_9fa48("3920") ? () => undefined : (stryCov_9fa48("3920"), e => stryMutAct_9fa48("3921") ? e.entryName.startsWith(href) : (stryCov_9fa48("3921"), e.entryName.endsWith(href)))));
          if (stryMutAct_9fa48("3923") ? false : stryMutAct_9fa48("3922") ? true : (stryCov_9fa48("3922", "3923"), entry)) {
            if (stryMutAct_9fa48("3924")) {
              {}
            } else {
              stryCov_9fa48("3924");
              map[id] = entry.getData().toString(stryMutAct_9fa48("3925") ? "" : (stryCov_9fa48("3925"), 'utf-8'));
            }
          }
        }
      }
      return map;
    }
  }
}