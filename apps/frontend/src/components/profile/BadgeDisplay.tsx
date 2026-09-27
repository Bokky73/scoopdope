'use client';

export interface BadgeProgress {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
  threshold: number;
  progress: number;
  earned: boolean;
  earnedAt: string | null;
}

const tierStyles = {
  bronze: 'border-amber-700 bg-amber-50 dark:bg-amber-950/30',
  silver: 'border-slate-400 bg-slate-50 dark:bg-slate-800/50',
  gold: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
};

export default function BadgeDisplay({ badges, loading = false }: { badges: BadgeProgress[]; loading?: boolean }) {
  if (loading) return <p role="status">Loading badges...</p>;
  return (
    <section aria-label="Achievement badges" className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            title={`${badge.description}. Progress: ${badge.progress}/${badge.threshold}`}
            className={`rounded-lg border p-4 ${tierStyles[badge.tier]} ${badge.earned ? '' : 'opacity-60 grayscale'}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-2xl" aria-hidden="true">{badge.icon === 'flame' ? '🔥' : badge.icon === 'trophy' ? '🏆' : badge.icon === 'heart-handshake' ? '🤝' : badge.icon === 'books' ? '📚' : '🎓'}</span>
              <span className="text-xs font-semibold uppercase">{badge.tier}</span>
            </div>
            <h3 className="mt-2 font-semibold">{badge.name}</h3>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{badge.earned ? badge.description : `${badge.progress}/${badge.threshold}`}</p>
            <progress className="mt-3 h-2 w-full" value={badge.progress} max={badge.threshold} aria-label={`${badge.name} progress`} />
          </div>
        ))}
      </div>
    </section>
  );
}
