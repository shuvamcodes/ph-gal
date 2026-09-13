export default function DesktopContextMenu({ x, y, onNewFolder, onChangeBackground, onSortIcons, onClose }) {
  return (
    <div className="fixed inset-0 z-50" onClick={onClose} onContextMenu={(e) => e.preventDefault()}>
      <div
        className="absolute folder-zoom-in backdrop-blur-xl bg-[#0d0d16]/95 border border-white/10 rounded-xl py-1.5 w-48 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
        style={{ left: x, top: y }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => { onNewFolder(); onClose(); }}
          className="w-full text-left px-4 py-2 text-xs text-gray-200 hover:bg-white/[0.08] transition"
        >
          📁 New Folder
        </button>
        <button
          onClick={() => { onChangeBackground(); onClose(); }}
          className="w-full text-left px-4 py-2 text-xs text-gray-200 hover:bg-white/[0.08] transition"
        >
          🖼 Change Background
        </button>
        <button
          onClick={() => { onSortIcons(); onClose(); }}
          className="w-full text-left px-4 py-2 text-xs text-gray-200 hover:bg-white/[0.08] transition"
        >
          🔠 Sort Icons
        </button>
      </div>
    </div>
  );
}