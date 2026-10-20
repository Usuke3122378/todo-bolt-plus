import { Loader as Loader2 } from 'lucide-react';

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-md bg-gray-200 dark:bg-gray-600 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3" />
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
              <div className="flex gap-2 pt-1">
                <div className="h-5 w-12 bg-gray-100 dark:bg-gray-700 rounded-full" />
                <div className="h-5 w-16 bg-gray-100 dark:bg-gray-700 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FullPageLoader({ label = '読み込み中...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}
