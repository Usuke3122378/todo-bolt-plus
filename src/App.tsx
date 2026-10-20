import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  ArrowUpDown,
  Loader2,
  ListTodo,
  CalendarClock,
  Flag,
  Inbox,
  Sun,
  Moon,
  List,
  Calendar,
} from 'lucide-react';
import type { Todo, TodoInput, Priority } from '@/types';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '@/api';
import { daysDiff } from '@/utils/date';
import { ToastProvider, useToast } from '@/components/Toast';
import { TodoItem } from '@/components/TodoItem';
import { TodoFormModal, DeleteConfirmModal } from '@/components/TodoFormModal';
import { Summary } from '@/components/Summary';
import { ProgressBar } from '@/components/ProgressBar';
import { Calendar as CalendarView } from '@/components/Calendar';
import { SkeletonList } from '@/components/Skeleton';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type Filter = 'all' | 'incomplete' | 'done';
type Sort = 'due' | 'priority' | 'newest';
type View = 'list' | 'calendar';

const priorityRank: Record<Priority, number> = { 高: 0, 中: 1, 低: 2 };

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('due');
  const [q, setQ] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [delTarget, setDelTarget] = useState<Todo | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [defaultDue, setDefaultDue] = useState('');
  const [view, setView] = useLocalStorage<View>('todo-view', 'list');
  const [theme, toggleTheme] = useDarkMode();
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await fetchTodos();
      setTodos(list);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = todos.filter((t) => {
      if (filter === 'incomplete' && t.done) return false;
      if (filter === 'done' && !t.done) return false;
      if (query) {
        const hay = (t.title + '\n' + t.content).toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'newest') {
        return (b.created_at || '').localeCompare(a.created_at || '');
      }
      if (sort === 'priority') {
        const r = priorityRank[a.priority] - priorityRank[b.priority];
        if (r !== 0) return r;
        return (a.created_at || '').localeCompare(b.created_at || '');
      }
      const da = daysDiff(a.due_date);
      const db = daysDiff(b.due_date);
      if (da === null && db === null) return 0;
      if (da === null) return 1;
      if (db === null) return -1;
      return da - db;
    });
    return sorted;
  }, [todos, filter, sort, q]);

  const handleCreate = async (input: TodoInput) => {
    try {
      const created = await createTodo(input);
      setTodos((prev) => [created, ...prev]);
      setFormOpen(false);
      setEditing(null);
      setDefaultDue('');
      toast.show('Todoを登録しました', 'success');
    } catch (e) {
      toast.show(e instanceof Error ? e.message : '登録に失敗しました', 'error');
      throw e;
    }
  };

  const handleUpdate = async (input: TodoInput) => {
    if (!editing) return;
    const id = editing.id;
    const prev = todos;
    setTodos((cur) => cur.map((t) => (t.id === id ? { ...t, ...input } : t)));
    setBusyId(id);
    try {
      const updated = await updateTodo(id, input);
      setTodos((cur) => cur.map((t) => (t.id === id ? updated : t)));
      setFormOpen(false);
      setEditing(null);
      toast.show('更新しました', 'success');
    } catch (e) {
      setTodos(prev);
      toast.show(e instanceof Error ? e.message : '更新に失敗しました', 'error');
      throw e;
    } finally {
      setBusyId(null);
    }
  };

  const handleToggle = async (todo: Todo) => {
    const id = todo.id;
    const prev = todos;
    setTodos((cur) => cur.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    setBusyId(id);
    try {
      const updated = await updateTodo(id, { done: !todo.done });
      setTodos((cur) => cur.map((t) => (t.id === id ? updated : t)));
    } catch (e) {
      setTodos(prev);
      toast.show(e instanceof Error ? e.message : '更新に失敗しました', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    const id = delTarget.id;
    const prev = todos;
    setTodos((cur) => cur.filter((t) => t.id !== id));
    setBusyId(id);
    try {
      await deleteTodo(id);
      setDelTarget(null);
      toast.show('削除しました', 'success');
    } catch (e) {
      setTodos(prev);
      toast.show(e instanceof Error ? e.message : '削除に失敗しました', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const openNew = () => {
    setEditing(null);
    setDefaultDue('');
    setFormOpen(true);
  };
  const openEdit = (t: Todo) => {
    setEditing(t);
    setDefaultDue('');
    setFormOpen(true);
  };
  const openNewForDate = (date: string) => {
    setEditing(null);
    setDefaultDue(date);
    setFormOpen(true);
  };

  const filterTabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'すべて' },
    { key: 'incomplete', label: '未完了' },
    { key: 'done', label: '完了' },
  ];
  const sortOptions: { key: Sort; label: string; icon: typeof CalendarClock }[] = [
    { key: 'due', label: '期日が近い順', icon: CalendarClock },
    { key: 'priority', label: '重要度順', icon: Flag },
    { key: 'newest', label: '登録が新しい順', icon: ListTodo },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/60 to-gray-50 dark:from-gray-900 dark:to-gray-950 transition-colors">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        <header className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">Todoリスト</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Googleスプレッドシート連携</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">新規追加</span>
              <span className="sm:hidden">追加</span>
            </button>
          </div>
        </header>

        {!loading && !loadError && <Summary todos={todos} />}
        {!loading && !loadError && <ProgressBar todos={todos} />}

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="タイトル・内容で検索"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <ArrowUpDown className="w-4 h-4 text-gray-400 ml-1.5" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="text-sm py-1 pr-2 bg-transparent text-gray-900 dark:text-white outline-none cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 gap-1">
            {filterTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`text-sm px-3 py-1.5 rounded-md transition-all font-medium ${
                  filter === t.key
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="inline-flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 gap-1">
            {(['list', 'calendar'] as View[]).map((v) => {
              const Icon = v === 'list' ? List : Calendar;
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-all font-medium ${
                    view === v
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {v === 'list' ? 'リスト' : 'カレンダー'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <SkeletonList />
          ) : loadError ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">{loadError}</p>
              <button
                onClick={load}
                className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700"
              >
                <Loader2 className="w-4 h-4" /> 再読み込み
              </button>
            </div>
          ) : view === 'calendar' ? (
            <CalendarView
              todos={todos}
              query={q}
              filter={filter}
              busyId={busyId}
              onToggle={handleToggle}
              onEdit={openEdit}
              onDelete={(todo) => setDelTarget(todo)}
              onAddForDate={openNewForDate}
            />
          ) : visible.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                <Inbox className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                {todos.length === 0 ? 'Todoがありません。新規追加してみましょう。' : '条件に一致するTodoがありません。'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((t) => (
                <TodoItem
                  key={t.id}
                  todo={t}
                  busy={busyId === t.id}
                  onToggle={handleToggle}
                  onEdit={openEdit}
                  onDelete={(todo) => setDelTarget(todo)}
                />
              ))}
            </div>
          )}
        </div>

        <footer className="mt-10 text-center text-xs text-gray-400 dark:text-gray-500">
          {todos.length > 0 && <p>合計 {todos.length} 件</p>}
        </footer>
      </div>

      <TodoFormModal
        open={formOpen}
        initial={editing}
        defaultDue={defaultDue}
        onClose={() => {
          if (!busyId) {
            setFormOpen(false);
            setEditing(null);
            setDefaultDue('');
          }
        }}
        onSubmit={editing ? handleUpdate : handleCreate}
      />
      <DeleteConfirmModal
        open={Boolean(delTarget)}
        todo={delTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <TodoApp />
    </ToastProvider>
  );
}
