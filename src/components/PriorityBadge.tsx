import type { Priority } from '@/types';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, { cls: string; dot: string }> = {
    高: { cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800', dot: 'bg-red-500' },
    中: { cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800', dot: 'bg-amber-500' },
    低: { cls: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600', dot: 'bg-gray-400' },
  };
  const m = map[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${m.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {priority}
    </span>
  );
}
