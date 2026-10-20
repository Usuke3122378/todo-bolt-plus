import { dueBadge, formatDate } from '@/utils/date';

export function DueBadge({ due }: { due: string }) {
  if (!due) return null;
  const badge = dueBadge(due);
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${badge?.className ?? 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${badge?.dot ?? 'bg-gray-400'}`} />
      {badge?.text ?? formatDate(due)}
    </span>
  );
}
