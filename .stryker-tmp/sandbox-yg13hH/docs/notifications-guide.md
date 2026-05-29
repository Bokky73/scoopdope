# Notifications Guide

Comprehensive guide to the scoopdope notification system.

---

## Notification Types and Triggers

Notifications are stored in the `notifications` PostgreSQL table and pushed to connected clients in real time via WebSocket.

### Types

| Type | Value | Trigger |
|------|-------|---------|
| Enrollment | `enrollment` | A user is enrolled in a course (`enrollment.created` event) |
| Completion | `completion` | A user completes a course (`progress.completed` event) |
| Credential Issued | `credential_issued` | An on-chain credential is issued (`credential.issued` event) |

### Entity Schema

```typescript
{
  id: string;          // UUID primary key
  userId: string;      // recipient user ID
  type: NotificationType;
  message: string;     // human-readable description
  isRead: boolean;     // default false
  createdAt: Date;
}
```

### Event → Notification Mapping

The `NotificationsEvents` service listens to NestJS `EventEmitter` events and creates notifications automatically:

| Event | Handler | Message template |
|-------|---------|-----------------|
| `enrollment.created` | `handleEnrollmentCreated` | `"You have been enrolled in {courseName}"` |
| `credential.issued` | `handleCredentialIssued` | `"Your credential for {courseName} has been issued!"` |
| `progress.completed` | `handleProgressCompleted` | `"Congratulations! You have completed {courseName}"` |

To trigger a notification from another service, emit the corresponding event:

```typescript
this.eventEmitter.emit('enrollment.created', { userId, courseName });
this.eventEmitter.emit('credential.issued',  { userId, courseName });
this.eventEmitter.emit('progress.completed', { userId, courseName });
```

---

## WebSocket Real-Time Notifications

The `NotificationsGateway` exposes a Socket.IO namespace at `/notifications`.

### Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/notifications', {
  auth: { token: '<JWT_ACCESS_TOKEN>' },
});
```

The gateway verifies the JWT on connection. If the token is missing or invalid, the socket is immediately disconnected. On success, the client is joined to the room `user:<userId>`.

### Receiving Notifications

```javascript
socket.on('notification', (notification) => {
  console.log(notification);
  // {
  //   id: 'uuid',
  //   userId: 'uuid',
  //   type: 'enrollment',
  //   message: 'You have been enrolled in Rust 101',
  //   isRead: false,
  //   createdAt: '2024-06-01T12:00:00.000Z'
  // }
});
```

Every call to `NotificationsService.create()` saves the notification to the database and immediately emits it to the user's room via `emitToUser(userId, 'notification', saved)`.

### Disconnection

The gateway logs disconnections. No explicit client-side teardown is required — Socket.IO handles reconnection automatically.

---

## REST API Endpoints

All endpoints require `Authorization: Bearer <JWT>`.

### Get notifications

```
GET /v1/notifications
```

Returns all notifications for the authenticated user, ordered by unread first, then newest first.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "enrollment",
    "message": "You have been enrolled in Rust 101",
    "isRead": false,
    "createdAt": "2024-06-01T12:00:00.000Z"
  }
]
```

### Mark one notification as read

```
PATCH /v1/notifications/:id/read
```

Returns the updated notification. Returns `404` if the notification does not exist.

### Mark all notifications as read

```
PATCH /v1/notifications/read-all
```

**Response (200):**
```json
{ "success": true }
```

---

## Email Notifications

Email delivery is handled by `MailService` (`apps/backend/src/mail/mail.service.ts`) using Nodemailer. It is invoked directly by services (e.g., `AuthService` for password reset emails) rather than through the event system.

### Configuration

| Variable | Description |
|----------|-------------|
| `MAIL_HOST` | SMTP host (e.g. `smtp.sendgrid.net`) |
| `MAIL_PORT` | SMTP port (e.g. `587`) |
| `MAIL_USER` | SMTP username |
| `MAIL_PASS` | SMTP password / API key |
| `MAIL_FROM` | Sender address |

### Adding a new email template

1. Add a method to `MailService`:
   ```typescript
   async sendCourseCompletionEmail(to: string, courseName: string) {
     await this.transporter.sendMail({
       from: this.configService.get('MAIL_FROM'),
       to,
       subject: `You completed ${courseName}!`,
       html: `<p>Congratulations on completing <strong>${courseName}</strong>.</p>`,
     });
   }
   ```
2. Call it from the relevant service or event handler.

---

## Notification Preferences Management

User-level notification preferences are not yet persisted as a dedicated entity. To implement them:

1. Add a `notificationPreferences` JSONB column to the `users` table via a migration.
2. Check the preference in each `NotificationsEvents` handler before calling `NotificationsService.create()`.

Example preference shape:
```json
{
  "enrollment": true,
  "completion": true,
  "credential_issued": true,
  "email": false
}
```

---

## Delivery Guarantees

| Channel | Guarantee |
|---------|-----------|
| Database (PostgreSQL) | Durable — notifications are persisted before the WebSocket emit. If the emit fails, the notification is still retrievable via `GET /v1/notifications`. |
| WebSocket | At-most-once — if the client is offline at the time of emit, the event is not queued. The client should fetch missed notifications via the REST API on reconnect. |
| Email | Depends on SMTP provider reliability. No retry logic is built in; add a queue (e.g., Bull) for production resilience. |

### Handling missed WebSocket events

On reconnect, fetch unread notifications from the REST API and reconcile with local state:

```javascript
socket.on('connect', async () => {
  const res = await fetch('/v1/notifications', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const notifications = await res.json();
  const unread = notifications.filter((n) => !n.isRead);
  // render unread notifications
});
```
