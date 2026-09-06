import { createPortal } from "react-dom";

export default function Toast({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="scale-in flex items-center gap-3 backdrop-blur-xl bg-white/[0.06] border border-indigo-400/30 rounded-xl px-4 py-3 shadow-[0_8px_30px_rgba(99,102,241,0.2)]"
        >
          <span className="text-sm text-gray-200">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-gray-500 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}