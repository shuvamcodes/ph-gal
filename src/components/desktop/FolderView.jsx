import { createPortal } from "react-dom";

export default function FolderView({ folder, apps, origin, onClose, onOpenApp, onRemoveItem }) {
  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="folder-zoom-in w-full max-w-sm backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-3xl p-6"
        style={{ transformOrigin: origin }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-medium">{folder.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-sm">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {folder.items.map((type) => {
            const app = apps.find((a) => a.type === type);
            if (!app) return null;
            return (
              <div key={type} className="flex flex-col items-center gap-1.5 relative group">
                <button
                  onClick={() => onOpenApp(type)}
                  className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-xl hover:bg-white/[0.1] transition"
                >
                  {app.icon}
                </button>
                <span className="text-[10px] text-gray-300 text-center leading-tight">{app.title}</span>
                <button
                  onClick={() => onRemoveItem(type)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/60 text-gray-400 hover:text-red-400 text-[9px] opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                  title="Remove from folder"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}