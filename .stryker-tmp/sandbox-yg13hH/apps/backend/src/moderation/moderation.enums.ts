export enum ContentType {
  COURSE = 'course',
  POST = 'post',
  REPLY = 'reply',
}
export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  APPEALED = 'appealed',
}
export enum ModerationAction {
  FLAG = 'flag',
  APPROVE = 'approve',
  REJECT = 'reject',
  APPEAL_SUBMITTED = 'appeal_submitted',
  APPEAL_APPROVED = 'appeal_approved',
  APPEAL_REJECTED = 'appeal_rejected',
}