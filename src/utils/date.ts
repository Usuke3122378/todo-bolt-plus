export function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysDiff(due: string): number | null {
  if (!due) return null;
  const parts = due.split('-').map((n) => Number(n));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  const dueDate = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  const ms = dueDate.getTime() - today.getTime();
  return Math.round(ms / 86400000);
}

export interface DueBadge {
  text: string;
  className: string;
  dot: string;
}

export function dueBadge(due: string): DueBadge | null {
  const diff = daysDiff(due);
  if (diff === null) return null;
  if (diff < 0) {
    const over = Math.abs(diff);
    return {
      text: `${over}日超過`,
      className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800',
      dot: 'bg-red-500',
    };
  }
  if (diff === 0) {
    return {
      text: '今日',
      className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800',
      dot: 'bg-orange-500',
    };
  }
  return {
    text: `あと${diff}日`,
    className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800',
    dot: 'bg-sky-500',
  };
}

export function formatDate(due: string): string {
  if (!due) return '';
  const parts = due.split('-');
  if (parts.length !== 3) return due;
  const [y, m, d] = parts;
  return `${y}年${Number(m)}月${Number(d)}日`;
}
