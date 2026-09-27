import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PresenceService } from './presence.service';

interface Session {
  courseId: string;
  instructorId: string;
}

/**
 * Real-time collaboration gateway for instructors working on the same course.
 *
 * Events:
 *  - `join`              -> instructor joins a course room + broadcasts presence
 *  - `course-update`     -> broadcasts an accepted course change (with conflict detection)
 *  - `enrollment-event`  -> broadcasts a new-enrollment notification to the course room
 *  - `leave`             -> instructor leaves + presence cleared
 *  - disconnect          -> presence cleared (graceful handling of network drops)
 */
@WebSocketGateway({ namespace: '/collaboration', cors: { origin: '*' } })
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(CollaborationGateway.name);
  @WebSocketServer() server: Server;

  /** socketId -> session, so we can clear presence on disconnect. */
  private readonly sockets = new Map<string, Session>();

  constructor(private readonly presence: PresenceService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(_client: Socket): void {
    // Session is established via the `join` message.
  }

  @SubscribeMessage('join')
  onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { courseId: string; instructorId: string; editingResource?: string },
  ) {
    const { courseId, instructorId, editingResource } = data;
    this.sockets.set(client.id, { courseId, instructorId });
    this.presence.join(courseId, instructorId, editingResource);
    client.join(courseId);
    this.broadcastPresence(courseId);
    return { event: 'joined', courseId, instructorId };
  }

  @SubscribeMessage('course-update')
  onCourseUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { courseId: string; instructorId: string; baseVersion: number; payload?: unknown },
  ) {
    const result = this.presence.applyCourseUpdate(
      data.courseId,
      data.instructorId,
      data.baseVersion,
    );
    if (result.accepted) {
      this.server.to(data.courseId).emit('course-updated', {
        courseId: data.courseId,
        instructorId: data.instructorId,
        version: result.currentVersion,
        payload: data.payload,
      });
    } else {
      client.emit('update-conflict', {
        courseId: data.courseId,
        currentVersion: result.currentVersion,
      });
    }
    return result;
  }

  @SubscribeMessage('enrollment-event')
  onEnrollment(
    @ConnectedSocket() _client: Socket,
    @MessageBody() data: { courseId: string; studentId: string },
  ) {
    this.server.to(data.courseId).emit('enrollment-notification', {
      courseId: data.courseId,
      studentId: data.studentId,
      at: Date.now(),
    });
    return { broadcast: true };
  }

  @SubscribeMessage('leave')
  onLeave(@ConnectedSocket() client: Socket) {
    const session = this.sockets.get(client.id);
    if (!session) return { left: false };
    this.presence.leave(session.courseId, session.instructorId);
    client.leave(session.courseId);
    this.sockets.delete(client.id);
    this.broadcastPresence(session.courseId);
    return { left: true, courseId: session.courseId };
  }

  handleDisconnect(client: Socket): void {
    const session = this.sockets.get(client.id);
    if (!session) return;
    this.presence.leave(session.courseId, session.instructorId);
    this.sockets.delete(client.id);
    this.broadcastPresence(session.courseId);
    this.logger.log(`socket ${client.id} disconnected; cleared presence for ${session.instructorId}`);
  }

  /** Server-side helper so other modules (e.g. enrollments) can push events. */
  broadcastEnrollment(courseId: string, studentId: string): void {
    this.server.to(courseId).emit('enrollment-notification', {
      courseId,
      studentId,
      at: Date.now(),
    });
  }

  private broadcastPresence(courseId: string): void {
    this.server.to(courseId).emit('presence', this.presence.getActive(courseId));
  }
}
