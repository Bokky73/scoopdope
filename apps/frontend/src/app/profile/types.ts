export interface ProgressRecord {
  id: string;
  courseId: string;
  progressPct: number;
  updatedAt: string;
}

export interface CredentialRecord {
  id: string;
  courseId: string;
  /** May be null when the credential has not been anchored on-chain yet */
  txHash: string | null;
  stellarPublicKey: string | null;
  issuedAt: string;
  course?: { id: string; title: string };
  /** @deprecated use course.title instead */
  courseTitle?: string;
}

export interface StellarBalance {
  /** Undefined for the native XLM asset */
  asset_code?: string;
  asset_type: string;
  balance: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string | null;
  email: string;
  stellarPublicKey: string;
  balance: string;
}

export interface BadgeState {
  id: string;
  name: string;
  description: string;
  earned: boolean;
}

export interface AchievementInput {
  credentialCount: number;
  /** Parsed BST balance; 0 when no wallet is linked */
  bstBalance: number;
  progressRecords: ProgressRecord[];
}
