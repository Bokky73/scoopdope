import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

/** Maximum concurrent sessions per user */
const MAX_SESSIONS_PER_USER = 5;

interface SyncProgressPayload {
  courseId: string;
  lessonId?: string;
  progressPct: number;
  updatedAt: string; // ISO timestamp for conflict resolution
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/progress-sync' })
export class ProgressSyncGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ProgressSyncGateway.name);

  /** Map userId -> Set of socket IDs for this server instance */
  private userSessions = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    const redisUrl = this.configService.get<string>('redis.url');
    if (!redisUrl) {
      this.logger.warn('No Redis URL configured — using in-memory adapter for progress sync');
      return;
    }
    const pubClient = new Redis(redisUrl);
    const subClient = pubClient.duplicate();
    server.adapter(createAdapter(pubClient, subClient));
    this.logger.log('Redis adapter attached to progress-sync namespace');
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      const userId = payload.sub;

      // Enforce max session limit per user
      if (!this.userSessions.has(userId)) {
        this.userSessions.set(userId, new Set());
      }
      const sessions = this.userSessions.get(userId)!;

      if (sessions.size >= MAX_SESSIONS_PER_USER) {
        this.logger.warn(
          `User ${userId} exceeded max sessions (${MAX_SESSIONS_PER_USER}). Rejecting.`,
        );
        client.emit('error', { message: 'Maximum session limit reached. Please close another session.' });
        client.disconnect();
        return;
      }

      sessions.add(client.id);
      // Store userId on the socket for disconnect cleanup
      (client as any).userId = userId;

      client.join(`progress:${userId}`);
      this.logger.debug(
        `Progress sync connected: socket ${client.id}, user ${userId} (${sessions.size}/${MAX_SESSIONS_PER_USER} sessions)`,
      );

      // Acknowledge connection with session info
      client.emit('sync:connected', {
        sessionId: client.id,
        activeSessions: sessions.size,
        maxSessions: MAX_SESSIONS_PER_USER,
      });
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId as string | undefined;
    if (userId) {
      const sessions = this.userSessions.get(userId);
      if (sessions) {
        sessions.delete(client.id);
        if (sessions.size === 0) {
          this.userSessions.delete(userId);
        }
      }
    }
    this.logger.debug(`Progress sync disconnected: socket ${client.id}`);
  }

  /**
   * Client sends a progress update; server broadcasts to all other sessions of the same user.
   * Conflict resolution: the payload includes updatedAt; recipients compare timestamps.
   */
  @SubscribeMessage('progress:update')
  async handleProgressUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SyncProgressPayload,
  ): Promise<void> {
    const userId = (client as any).userId as string | undefined;
    if (!userId) return;

    // Validate payload
    if (!payload?.courseId || typeof payload.progressPct !== 'number') {
      client.emit('sync:error', { message: 'Invalid progress payload' });
      return;
    }

    // Ensure updatedAt is set for conflict resolution
    if (!payload.updatedAt) {
      payload.updatedAt = new Date().toISOString();
    }

    this.logger.debug(
      `Progress update from user ${userId}: course=${payload.courseId}, pct=${payload.progressPct}`,
    );

    // Broadcast to all other sessions of the same user (exclude sender)
    client.to(`progress:${userId}`).emit('sync:progress', {
      ...payload,
      sourceSocketId: client.id,
      serverTimestamp: new Date().toISOString(),
    });

    // Acknowledge sender
    client.emit('sync:ack', { courseId: payload.courseId, updatedAt: payload.updatedAt });
  }

  /**
   * Called by ProgressService when a progress record is saved on the server.
   * Broadcasts the authoritative server update to all sessions for the user.
   */
  broadcastProgressUpdate(userId: string, data: SyncProgressPayload) {
    this.server.to(`progress:${userId}`).emit('sync:progress', {
      ...data,
      authoritative: true,
      serverTimestamp: new Date().toISOString(),
    });
  }

  /**
   * Listen for progress.updated events emitted by ProgressService and broadcast
   * to all of the user's WebSocket sessions so other devices stay in sync.
   */
  @OnEvent('progress.updated')
  handleProgressUpdatedEvent(payload: {
    userId: string;
    courseId: string;
    lessonId?: string;
    progressPct: number;
    updatedAt: string;
  }) {
    this.broadcastProgressUpdate(payload.userId, {
      courseId: payload.courseId,
      lessonId: payload.lessonId,
      progressPct: payload.progressPct,
      updatedAt: payload.updatedAt,
    });
  }

  /**
   * Called on user logout — disconnects all sessions for that user.
   */
  disconnectUser(userId: string) {
    const sessions = this.userSessions.get(userId);
    if (sessions) {
      for (const socketId of sessions) {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit('sync:session-ended', { reason: 'logout' });
          socket.disconnect(true);
        }
      }
      this.userSessions.delete(userId);
    }
  }

  /**
   * Get active session count for a user (local instance only).
   */
  getSessionCount(userId: string): number {
    return this.userSessions.get(userId)?.size ?? 0;
  }
}
