import { cn } from "@/lib/utils";

interface MetricBarProps {
  label: string;
  value: number;
  max?: number;
  colorScheme?: 'primary' | 'warning' | 'danger';
  className?: string;
}

export default function MetricBar({
  label,
  value,
  max = 100,
  colorScheme = 'primary',
  className
}: MetricBarProps) {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  const getColorClass = (scheme: string) => {
    switch (scheme) {
      case 'primary':
        return 'bg-primary-500 text-primary-600 dark:text-primary-400';
      case 'warning':
        return 'bg-amber-500 text-amber-600 dark:text-amber-400';
      case 'danger':
        return 'bg-red-500 text-red-600 dark:text-red-400';
      default:
        return 'bg-primary-500 text-primary-600 dark:text-primary-400';
    }
  };

  const colorClass = getColorClass(colorScheme);
  
  return (
    <div className={cn("metric", className)}>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-sm font-medium ${colorClass.split(' ').pop()}`}>{value}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
        <div className={`${colorClass.split(' ')[0]} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
