import { Injectable, Logger } from '@nestjs/common';

export interface InstructorPresence {
  instructorId: string;
  courseId: string;
  joinedAt: number;
  lastSeenAt: number;
  /** Resource the instructor is currently editing, if known. */
  editingResource?: string;
}

export interface CourseUpdateResult {
  accepted: boolean;
  currentVersion: number;
  conflict: boolean;
}

/**
 * In-memory tracker of instructor presence per course plus a per-course
 * version counter used for last-write-wins conflict detection on edits.
 *
 * Presence is intentionally kept in memory (per backend instance); for a
 * multi-instance deployment this would be backed by Redis, but the API stays
 * the same so the gateway does not change.
 */
@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private readonly presence = new Map<string, Map<string, InstructorPresence>>();
  private readonly courseVersions = new Map<string, number>();

  join(courseId: string, instructorId: string, editingResource?: string): InstructorPresence {
    let courseMap = this.presence.get(courseId);
    if (!courseMap) {
      courseMap = new Map();
      this.presence.set(courseId, courseMap);
    }
    const now = Date.now();
    const entry: InstructorPresence = {
      instructorId,
      courseId,
      joinedAt: now,
      lastSeenAt: now,
      editingResource,
    };
    courseMap.set(instructorId, entry);
    this.logger.log(`instructor ${instructorId} joined course ${courseId}`);
    return entry;
  }

  leave(courseId: string, instructorId: string): void {
    const courseMap = this.presence.get(courseId);
    if (courseMap) {
      courseMap.delete(instructorId);
      if (courseMap.size === 0) this.presence.delete(courseId);
    }
    this.logger.log(`instructor ${instructorId} left course ${courseId}`);
  }

  /** Refresh the last-seen heartbeat for an instructor. */
  touch(courseId: string, instructorId: string): void {
    const entry = this.presence.get(courseId)?.get(instructorId);
    if (entry) entry.lastSeenAt = Date.now();
  }

  getActive(courseId: string): InstructorPresence[] {
    const courseMap = this.presence.get(courseId);
    return courseMap ? Array.from(courseMap.values()) : [];
  }

  isPresent(courseId: string, instructorId: string): boolean {
    return this.presence.get(courseId)?.has(instructorId) ?? false;
  }

  /**
   * Apply a course edit with optimistic-concurrency conflict detection.
   * Returns conflict=true when the client's baseVersion is behind the current
   * server version (another instructor already advanced it). Otherwise the
   * version is incremented and the update is accepted.
   */
  applyCourseUpdate(courseId: string, _instructorId: string, baseVersion: number): CourseUpdateResult {
    const current = this.courseVersions.get(courseId) ?? 0;
    if (baseVersion < current) {
      return { accepted: false, currentVersion: current, conflict: true };
    }
    const next = current + 1;
    this.courseVersions.set(courseId, next);
    this.logger.log(`course ${courseId} advanced to v${next}`);
    return { accepted: true, currentVersion: next, conflict: false };
  }

  getCourseVersion(courseId: string): number {
    return this.courseVersions.get(courseId) ?? 0;
  }
}
