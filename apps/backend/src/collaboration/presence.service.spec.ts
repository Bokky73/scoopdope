import { PresenceService } from './presence.service';

describe('PresenceService', () => {
  let svc: PresenceService;

  beforeEach(() => {
    svc = new PresenceService();
  });

  it('join marks an instructor present and getActive lists them', () => {
    svc.join('c1', 'i1');
    expect(svc.isPresent('c1', 'i1')).toBe(true);
    expect(svc.getActive('c1').map((p) => p.instructorId)).toContain('i1');
  });

  it('leave removes presence and empties the course map', () => {
    svc.join('c1', 'i1');
    svc.leave('c1', 'i1');
    expect(svc.isPresent('c1', 'i1')).toBe(false);
    expect(svc.getActive('c1')).toHaveLength(0);
  });

  it('tracks multiple instructors per course', () => {
    svc.join('c1', 'i1');
    svc.join('c1', 'i2');
    expect(svc.getActive('c1')).toHaveLength(2);
  });

  it('increments the course version and accepts an edit at the current base', () => {
    const r1 = svc.applyCourseUpdate('c1', 'i1', 0);
    expect(r1.accepted).toBe(true);
    expect(r1.currentVersion).toBe(1);

    const r2 = svc.applyCourseUpdate('c1', 'i2', 1);
    expect(r2.accepted).toBe(true);
    expect(r2.currentVersion).toBe(2);
  });

  it('flags a conflict when the base version is stale', () => {
    svc.applyCourseUpdate('c1', 'i1', 0); // -> v1
    const stale = svc.applyCourseUpdate('c1', 'i2', 0); // base 0 < 1
    expect(stale.accepted).toBe(false);
    expect(stale.conflict).toBe(true);
    expect(stale.currentVersion).toBe(1);
  });
});
