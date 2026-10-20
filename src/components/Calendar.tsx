import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import type { Todo } from '@/types';
import { TodoItem } from './TodoItem';
import { todayStr } from '@/utils/date';

interface Props {
  todos: Todo[];
  query: string;
  filter: 'all' | 'incomplete' | 'done';
  busyId: string | null;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onAddForDate: (date: string) => void;
}

const DOW = ['日', '月', '火', '水', '木', '金', '土'];
const MAX_VISIBLE = 3;

function ymKey(y: number, m: number) {
  return `${y}-${String(m).padStart(2, '0')}`;
}

export function Calendar({ todos, query, filter, busyId, onToggle, onEdit, onDelete, onAddForDate }: Props) {
  const today = todayStr();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [selected, setSelected] = useState<string>(today);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return todos.filter((t) => {
      if (filter === 'incomplete' && t.done) return false;
      if (filter === 'done' && !t.done) return false;
      if (q) {
        const hay = (t.title + '\n' + t.content).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [todos, query, filter]);

  const noDue = useMemo(() => filtered.filter((t) => !t.due_date), [filtered]);
  const [noDueOpen, setNoDueOpen] = useState(false);

  const byDate = useMemo(() => {
    const map = new Map<string, Todo[]>();
    for (const t of filtered) {
      if (!t.due_date) continue;
      const arr = map.get(t.due_date);
      if (arr) arr.push(t);
      else map.set(t.due_date, [t]);
    }
    return map;
  }, [filtered]);

  const weeks = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(ymKey(year, month) + '-' + String(d).padStart(2, '0'));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    const w: (string | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) w.push(cells.slice(i, i + 7));
    return w;
  }, [year, month]);

  const shift = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setYear(y);
    setMonth(m);
  };

  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setSelected(today);
  };

  const selectedTodos = selected ? (byDate.get(selected) ?? []) : [];

  return (
    <div className="mt-4">
      {/* calendar header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            {year}年 {month}月
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={goToday}
              className="text-xs sm:text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              今月
            </button>
            <button
              onClick={() => shift(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="前の月"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => shift(1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="次の月"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* dow */}
        <div className="grid grid-cols-7 mb-1">
          {DOW.map((d, i) => (
            <div
              key={d}
              className={`text-center text-xs font-semibold py-1 ${
                i === 0
                  ? 'text-red-500 dark:text-red-400'
                  : i === 6
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* grid */}
        <div className="grid grid-cols-7 gap-1">
          {weeks.flat().map((date, idx) => {
            if (!date) return <div key={idx} className="min-h-[68px] sm:min-h-[96px]" />;
            const day = Number(date.split('-')[2]);
            const dow = idx % 7;
            const isToday = date === today;
            const isSelected = date === selected;
            const dayTodos = byDate.get(date) ?? [];
            const extra = dayTodos.length - MAX_VISIBLE;
            return (
              <button
                key={date}
                onClick={() => setSelected(date)}
                className={`min-h-[68px] sm:min-h-[96px] rounded-lg p-1 sm:p-1.5 text-left flex flex-col gap-0.5 border transition-colors ${
                  isSelected
                    ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/30'
                    : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                } ${dayTodos.length > 0 ? 'bg-gray-50/60 dark:bg-gray-700/40' : ''}`}
              >
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                    isToday
                      ? 'bg-sky-600 text-white'
                      : dow === 0
                        ? 'text-red-600 dark:text-red-400'
                        : dow === 6
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {day}
                </span>
                {/* desktop: titles */}
                <div className="hidden sm:flex flex-col gap-0.5 overflow-hidden">
                  {dayTodos.slice(0, MAX_VISIBLE).map((t) => (
                    <span
                      key={t.id}
                      className={`flex items-center gap-1 text-[10px] leading-tight truncate ${
                        t.done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <PriorityDot priority={t.priority} />
                      {t.title}
                    </span>
                  ))}
                  {extra > 0 && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">他{extra}件</span>
                  )}
                </div>
                {/* mobile: dots */}
                <div className="flex sm:hidden flex-wrap gap-0.5 mt-auto">
                  {dayTodos.slice(0, 5).map((t) => (
                    <PriorityDot key={t.id} priority={t.priority} done={t.done} />
                  ))}
                  {extra > 0 && <span className="text-[9px] text-gray-400">+{extra}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* selected day */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {selected ? `${selected.replace(/-/g, '/')} のTodo（${selectedTodos.length}件）` : ''}
          </h3>
          <button
            onClick={() => onAddForDate(selected)}
            className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 px-2.5 py-1.5 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            この日に追加
          </button>
        </div>
        {selectedTodos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            この日のTodoはありません
          </div>
        ) : (
          <div className="space-y-3">
            {selectedTodos.map((t) => (
              <TodoItem
                key={t.id}
                todo={t}
                busy={busyId === t.id}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* no due date */}
      {noDue.length > 0 && (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setNoDueOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            <span>期日なし（{noDue.length}件）</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${noDueOpen ? 'rotate-90' : ''}`} />
          </button>
          {noDueOpen && (
            <div className="px-3 pb-3 space-y-3">
              {noDue.map((t) => (
                <TodoItem
                  key={t.id}
                  todo={t}
                  busy={busyId === t.id}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PriorityDot({ priority, done }: { priority: Todo['priority']; done?: boolean }) {
  const colors: Record<string, string> = {
    高: 'bg-red-500',
    中: 'bg-amber-500',
    低: 'bg-gray-400',
  };
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${colors[priority]} ${done ? 'opacity-40' : ''}`}
    />
  );
}
