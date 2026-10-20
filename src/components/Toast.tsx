import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastCtx {
  show: (message: string, kind?: ToastKind) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function useToast(): ToastCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('ToastProvider missing');
  return c;
}

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[calc(100vw-2rem)]">
        {toasts.map((t) => {
          const Icon = t.kind === 'success' ? CheckCircle2 : t.kind === 'error' ? AlertCircle : Info;
          const accent =
            t.kind === 'success'
              ? 'text-emerald-600 dark:text-emerald-400'
              : t.kind === 'error'
                ? 'text-red-600 dark:text-red-400'
                : 'text-sky-600 dark:text-sky-400';
          return (
            <div
              key={t.id}
              className="flex items-start gap-2 bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 rounded-lg px-4 py-3 min-w-[260px] animate-in"
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${accent}`} />
              <p className="text-sm text-gray-800 dark:text-gray-100 flex-1 leading-snug">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
