import { CircleCheck as CheckCircle2 } from 'lucide-react';
import type { Todo } from '@/types';

export function ProgressBar({ todos }: { todos: Todo[] }) {
  const total = todos.length;
  const done = todos.filter((t) => t.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const complete = total > 0 && done === total;

  if (total === 0) {
    return (
      <div className="mt-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        Todoを追加すると進み具合が表示されます
      </div>
    );
  }

  return (
    <div className="mt-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          完了 <span className="font-semibold text-gray-900 dark:text-white">{done}</span> / {total}件
          <span className="ml-1.5 font-semibold text-gray-900 dark:text-white">({pct}%)</span>
        </span>
        {complete && (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            すべて完了！
          </span>
        )}
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            complete ? 'bg-emerald-500' : 'bg-sky-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
