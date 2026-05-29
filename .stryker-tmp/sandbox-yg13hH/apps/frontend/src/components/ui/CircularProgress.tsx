interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function CircularProgress({ value, size = 80, strokeWidth = 8, label }: CircularProgressProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={strokeWidth} className="stroke-gray-200 dark:stroke-gray-700" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="stroke-blue-500 transition-all duration-500"
        />
      </svg>
      <div className="absolute" style={{ marginTop: size / 2 - 10 }}>
        {/* value overlay — use wrapper div for centering */}
      </div>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 -mt-1">{value}%</span>
      {label && <span className="text-xs text-gray-500 dark:text-gray-400 text-center">{label}</span>}
    </div>
  );
}
