import { CollaborationGateway } from './collaboration.gateway';
import { PresenceService } from './presence.service';

describe('CollaborationGateway', () => {
  let gateway: CollaborationGateway;
  let presence: PresenceService;
  let emits: Array<{ room: string; event: string; payload: any }>;
  let mockServer: any;
  let client: any;

  beforeEach(() => {
    emits = [];
    mockServer = {
      to: (room: string) => ({
        emit: (event: string, payload: any) => emits.push({ room, event, payload }),
      }),
      emit: (event: string, payload: any) => emits.push({ room: '*', event, payload }),
    };
    presence = new PresenceService();
    gateway = new CollaborationGateway(presence);
    (gateway as any).server = mockServer;
    client = { id: 'sock1', join: jest.fn(), leave: jest.fn(), emit: jest.fn() };
  });

  it('onJoin registers presence and broadcasts to the course room', () => {
    gateway.onJoin(client, { courseId: 'c1', instructorId: 'i1' });

    expect(presence.isPresent('c1', 'i1')).toBe(true);
    expect(client.join).toHaveBeenCalledWith('c1');

    const presenceEmit = emits.find((e) => e.event === 'presence' && e.room === 'c1');
    expect(presenceEmit).toBeDefined();
    expect(presenceEmit!.payload.map((p: any) => p.instructorId)).toContain('i1');
  });

  it('course-update broadcasts when accepted', () => {
    gateway.onJoin(client, { courseId: 'c1', instructorId: 'i1' });
    emits.length = 0;

    const res = gateway.onCourseUpdate(client, {
      courseId: 'c1',
      instructorId: 'i1',
      baseVersion: 0,
      payload: { title: 'new' },
    });

    expect(res.accepted).toBe(true);
    const upd = emits.find((e) => e.event === 'course-updated' && e.room === 'c1');
    expect(upd).toBeDefined();
    expect(upd!.payload.version).toBe(1);
  });

  it('course-update emits a conflict to the editor on a stale base version', () => {
    gateway.onJoin(client, { courseId: 'c1', instructorId: 'i1' });
    gateway.onCourseUpdate(client, { courseId: 'c1', instructorId: 'i1', baseVersion: 0 });
    emits.length = 0;

    const res = gateway.onCourseUpdate(client, {
      courseId: 'c1',
      instructorId: 'i2',
      baseVersion: 0,
    });

    expect(res.conflict).toBe(true);
    expect(client.emit).toHaveBeenCalledWith(
      'update-conflict',
      expect.objectContaining({ currentVersion: 1 }),
    );
  });

  it('handleDisconnect clears presence', () => {
    gateway.onJoin(client, { courseId: 'c1', instructorId: 'i1' });
    gateway.handleDisconnect(client);
    expect(presence.isPresent('c1', 'i1')).toBe(false);
  });

  it('enrollment-event broadcasts a notification to the course room', () => {
    gateway.onJoin(client, { courseId: 'c1', instructorId: 'i1' });
    emits.length = 0;

    gateway.onEnrollment(client, { courseId: 'c1', studentId: 's1' });

    const notif = emits.find((e) => e.event === 'enrollment-notification' && e.room === 'c1');
    expect(notif).toBeDefined();
    expect(notif!.payload.studentId).toBe('s1');
  });
});
