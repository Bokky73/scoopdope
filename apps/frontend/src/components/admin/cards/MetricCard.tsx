export function MetricCard({
  label,
  value,
  sub,
  color = 'blue',
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
}) {
  const accent: Record<string, string> = {
    blue: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
    green: 'border-green-500 bg-green-50 dark:bg-green-950/30',
    purple: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30',
    orange: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30',
    indigo: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30',
  };
  const text: Record<string, string> = {
    blue: 'text-blue-700 dark:text-blue-300',
    green: 'text-green-700 dark:text-green-300',
    purple: 'text-purple-700 dark:text-purple-300',
    orange: 'text-orange-700 dark:text-orange-300',
    indigo: 'text-indigo-700 dark:text-indigo-300',
  };
  return (
    <div className={`rounded-lg border-l-4 p-5 ${accent[color]}`}>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${text[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export function SkeletonMetricCard() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 animate-pulse space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
    </div>
  );
}
