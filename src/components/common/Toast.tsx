import { useEffect } from 'react';
import { Info } from 'lucide-react';

type ToastProps = {
  message: string;
  onDismiss: () => void;
};

const AUTO_DISMISS_MS = 3000;

export default function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white shadow-lift animate-sheet-up lg:bottom-8"
    >
      <Info className="h-5 w-5 shrink-0 text-pitch-400" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
