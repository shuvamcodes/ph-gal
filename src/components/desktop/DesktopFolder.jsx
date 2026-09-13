import { useRef, useState } from "react";

export default function DesktopFolder({ folder, appIcons, isDropTarget, onOpen, onMove }) {
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);

  function handlePointerDown(e) {
    e.stopPropagation();
    setDragging(true);
    movedRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true;
    onMove(folder.x + dx, folder.y + dy, false);
    startRef.current = { x: e.clientX, y: e.clientY };
  }
  function handlePointerUp() {
    setDragging(false);
    if (movedRef.current) onMove(folder.x, folder.y, true);
  }
  function handleClick(e) {
    e.stopPropagation();
    if (!movedRef.current) onOpen(e);
  }

  const preview = folder.items.slice(0, 4);

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      className={`absolute flex flex-col items-center gap-1.5 w-20 py-2 rounded-xl transition select-none ${
        isDropTarget ? "bg-indigo-500/30 scale-110" : "hover:bg-white/[0.06]"
      }`}
      style={{ left: folder.x, top: folder.y, touchAction: "none", cursor: dragging ? "grabbing" : "grab" }}
    >
      <div className="w-12 h-12 rounded-2xl bg-white/[0.08] border border-white/10 grid grid-cols-2 gap-0.5 p-1.5">
        {preview.map((type) => (
          <div key={type} className="flex items-center justify-center text-[10px] bg-white/[0.06] rounded-sm">
            {appIcons[type] || "📄"}
          </div>
        ))}
      </div>
      <span className="text-[11px] text-gray-300 text-center leading-tight drop-shadow pointer-events-none">
        {folder.name}
      </span>
    </button>
  );
}