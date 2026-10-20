import { Clock, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2 } from 'lucide-react';
import type { Todo } from '@/types';
import { daysDiff, todayStr } from '@/utils/date';

export function Summary({ todos }: { todos: Todo[] }) {
  const incomplete = todos.filter((t) => !t.done).length;
  const today = todayStr();
  const todayDue = todos.filter((t) => !t.done && t.due_date === today).length;
  const overdue = todos.filter((t) => {
    if (t.done) return false;
    const d = daysDiff(t.due_date);
    return d !== null && d < 0;
  }).length;

  const cards = [
    { label: '未完了', value: incomplete, icon: Clock, cls: 'text-sky-600 bg-sky-50 dark:bg-sky-900/40 dark:text-sky-400' },
    { label: '今日まで', value: todayDue, icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 dark:text-emerald-400' },
    { label: '期限切れ', value: overdue, icon: AlertTriangle, cls: 'text-red-600 bg-red-50 dark:bg-red-900/40 dark:text-red-400' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3"
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${c.cls}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-none">{c.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{c.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
