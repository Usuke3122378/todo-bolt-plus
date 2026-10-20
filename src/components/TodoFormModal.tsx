import { useEffect, useRef, useState } from 'react';
import { X, Loader as Loader2, Trash2 } from 'lucide-react';
import type { Priority, Todo, TodoInput } from '@/types';

interface Props {
  open: boolean;
  initial?: Todo | null;
  defaultDue?: string;
  onClose: () => void;
  onSubmit: (input: TodoInput) => Promise<void>;
}

const priorities: Priority[] = ['高', '中', '低'];

export function TodoFormModal({ open, initial, defaultDue, onClose, onSubmit }: Props) {
  const isEdit = Boolean(initial);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [due, setDue] = useState('');
  const [priority, setPriority] = useState<Priority>('中');
  const [titleErr, setTitleErr] = useState('');
  const [busy, setBusy] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setContent(initial?.content ?? '');
      setDue(initial?.due_date ?? defaultDue ?? '');
      setPriority(initial?.priority ?? '中');
      setTitleErr('');
      setBusy(false);
      window.setTimeout(() => titleRef.current?.focus(), 80);
    }
  }, [open, initial, defaultDue]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      setTitleErr('タイトルは必須です');
      titleRef.current?.focus();
      return;
    }
    setBusy(true);
    try {
      await onSubmit({ title: t, content: content.trim(), due_date: due, priority });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-pop">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEdit ? 'Todoを編集' : '新規Todo'}</h2>
          <button
            onClick={onClose}
            disabled={busy}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-40"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleErr && e.target.value.trim()) setTitleErr('');
              }}
              disabled={busy}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 dark:bg-gray-700 dark:text-white ${
                titleErr
                  ? 'border-red-300 focus:ring-red-200 bg-red-50/30 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 focus:border-sky-400 focus:ring-sky-200'
              }`}
              placeholder="何をしますか？"
            />
            {titleErr && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{titleErr}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={busy}
              rows={4}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-200 resize-y"
              placeholder="詳細を入力（複数行可）"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">期日</label>
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                disabled={busy}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">重要度</label>
              <div className="flex gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700">
                {priorities.map((p) => (
                  <button
                    key={p}
                    type="button"
                    disabled={busy}
                    onClick={() => setPriority(p)}
                    className={`flex-1 text-sm py-1.5 rounded-md transition-all ${
                      priority === p
                        ? 'bg-white dark:bg-gray-600 shadow-sm font-semibold text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-70 min-w-[96px] justify-center"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isEdit ? '保存' : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteProps {
  open: boolean;
  todo: Todo | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmModal({ open, todo, onClose, onConfirm }: DeleteProps) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) setBusy(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  if (!open || !todo) return null;

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-pop">
        <div className="px-6 pt-6 pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-center text-base font-semibold text-gray-900 dark:text-white">Todoを削除しますか？</h3>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400 break-words">
            「{todo.title}」を削除すると元に戻せません。
          </p>
        </div>
        <div className="flex gap-2 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={confirm}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
