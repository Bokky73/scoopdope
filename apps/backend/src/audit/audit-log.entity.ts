import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AuditAction {
  LOGIN_SUCCESS = 'auth.login.success',
  LOGIN_FAILURE = 'auth.login.failure',
  LOGOUT = 'auth.logout',
  REGISTER = 'auth.register',
  PASSWORD_RESET_REQUEST = 'auth.password_reset.request',
  PASSWORD_RESET_COMPLETE = 'auth.password_reset.complete',
  MFA_ENABLED = 'auth.mfa.enabled',
  MFA_DISABLED = 'auth.mfa.disabled',
  API_KEY_CREATED = 'apikey.created',
  API_KEY_REVOKED = 'apikey.revoked',
  API_KEY_ROTATED = 'apikey.rotated',
  API_KEY_USED = 'apikey.used',
  ADMIN_ACTION = 'admin.action',
  ROLE_CHANGED = 'admin.role_changed',
  USER_BANNED = 'admin.user_banned',
  USER_SUSPENDED = 'admin.user_suspended',
  USER_DEACTIVATED = 'admin.user_deactivated',
  USER_DELETED = 'admin.user_deleted',
  USER_BULK_DELETED = 'admin.user_bulk_deleted',
  COURSE_APPROVED = 'admin.course_approved',
  COURSE_ARCHIVED = 'admin.course_archived',
  COURSE_UNARCHIVED = 'admin.course_unarchived',
  COURSE_DELETED = 'admin.course_deleted',
  SECRET_ROTATED = 'secret.rotated',
  GDPR_DATA_EXPORT = 'gdpr.data_export',
  GDPR_ACCOUNT_DELETION = 'gdpr.account_deletion',
}

@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
@Index(['createdAt'])
@Index(['resourceType', 'resourceId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string | null;

  @Column()
  action: string;

  /** The type of resource this action was performed on (e.g. "user", "course"). */
  @Column({ nullable: true, type: 'varchar', length: 64 })
  resourceType: string | null;

  /** The UUID of the specific resource this action targeted. */
  @Column({ nullable: true, type: 'uuid' })
  resourceId: string | null;

  /**
   * Field-level change tracking: { field: { from: oldValue, to: newValue } }.
   * Only populated for update actions.
   */
  @Column({ type: 'jsonb', nullable: true })
  changes: Record<string, { from: unknown; to: unknown }> | null;

  @Column({ nullable: true })
  ipAddress: string | null;

  @Column({ nullable: true })
  userAgent: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ default: true })
  success: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
