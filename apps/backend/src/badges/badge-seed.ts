import { BadgeCriteriaType } from './badge.entity';

export interface BadgeSeed {
  slug: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
  type: BadgeCriteriaType;
  threshold: number;
}

export const BADGE_SEEDS: BadgeSeed[] = [
  { slug: 'first-course-bronze', name: 'First Course', description: 'Complete your first course', icon: 'graduation-cap', tier: 'bronze', type: 'courses_completed', threshold: 1 },
  { slug: 'course-collector-silver', name: 'Course Collector', description: 'Complete 5 courses', icon: 'books', tier: 'silver', type: 'courses_completed', threshold: 5 },
  { slug: 'course-master-gold', name: 'Course Master', description: 'Complete 10 courses', icon: 'trophy', tier: 'gold', type: 'courses_completed', threshold: 10 },
  { slug: 'seven-day-streak-bronze', name: 'Seven Day Streak', description: 'Maintain a 7-day learning streak', icon: 'flame', tier: 'bronze', type: 'streak_days', threshold: 7 },
  { slug: 'thirty-day-streak-silver', name: 'Monthly Momentum', description: 'Maintain a 30-day learning streak', icon: 'flame', tier: 'silver', type: 'streak_days', threshold: 30 },
  { slug: 'hundred-day-streak-gold', name: 'Unstoppable', description: 'Maintain a 100-day learning streak', icon: 'flame', tier: 'gold', type: 'streak_days', threshold: 100 },
  { slug: 'peer-helper-bronze', name: 'Peer Helper', description: 'Help 5 fellow students in the forum', icon: 'heart-handshake', tier: 'bronze', type: 'students_helped', threshold: 5 },
  { slug: 'peer-mentor-silver', name: 'Peer Mentor', description: 'Help 25 fellow students in the forum', icon: 'heart-handshake', tier: 'silver', type: 'students_helped', threshold: 25 },
  { slug: 'community-champion-gold', name: 'Community Champion', description: 'Help 100 fellow students in the forum', icon: 'heart-handshake', tier: 'gold', type: 'students_helped', threshold: 100 },
];
