export default function StartMenu({ apps, folders, onOpenApp, onOpenFolder, onClose }) {
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="absolute bottom-16 left-4 folder-zoom-in backdrop-blur-xl bg-[#0d0d16]/95 border border-white/10 rounded-2xl p-4 w-72 max-h-[70vh] overflow-auto shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
        style={{ transformOrigin: "bottom left" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-2 px-1">Folders</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => { onOpenFolder(f); onClose(); }}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/[0.06] transition"
            >
              <div className="w-9 h-9 rounded-lg bg-white/[0.08] flex items-center justify-center text-sm">📁</div>
              <span className="text-[9px] text-gray-400 truncate w-full text-center">{f.name}</span>
            </button>
          ))}
          {folders.length === 0 && <p className="text-gray-600 text-[10px] col-span-4">No folders</p>}
        </div>

        <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-2 px-1">Apps</p>
        <div className="grid grid-cols-4 gap-2">
          {apps.map((app) => (
            <button
              key={app.type}
              onClick={() => { onOpenApp(app.type); onClose(); }}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/[0.06] transition"
            >
              <div className="w-9 h-9 rounded-lg bg-white/[0.08] flex items-center justify-center text-sm">{app.icon}</div>
              <span className="text-[9px] text-gray-400 truncate w-full text-center">{app.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}