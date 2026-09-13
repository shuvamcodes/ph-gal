import { useRef, useState } from "react";

export default function DesktopIcon({ icon, label, x, y, selected, scale, onOpen, onSelect, onMove, onRename }) {
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(label);
  const startRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);

  function handlePointerDown(e) {
    if (editing) return;
    e.stopPropagation();
    onSelect();
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
    onMove(x + dx, y + dy, false);
    startRef.current = { x: e.clientX, y: e.clientY };
  }

  function handlePointerUp() {
    setDragging(false);
    if (movedRef.current) onMove(x, y, true);
  }

  function handleClick(e) {
    e.stopPropagation();
    if (!movedRef.current && !editing) onOpen();
  }

  function handleContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    setNameDraft(label);
    setEditing(true);
  }

  function submitRename(e) {
    e.preventDefault();
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== label) onRename(trimmed);
    setEditing(false);
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={`absolute flex flex-col items-center gap-1.5 rounded-xl transition select-none ${
        selected ? "bg-indigo-500/20 border border-indigo-400/40" : "hover:bg-white/[0.06] border border-transparent"
      }`}
      style={{
        left: x,
        top: y,
        width: 80 * (scale || 1),
        padding: `${8 * (scale || 1)}px 0`,
        touchAction: "none",
        cursor: dragging ? "grabbing" : "grab"
      }}
    >
      <div
        className="rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center"
        style={{ width: 48 * (scale || 1), height: 48 * (scale || 1), fontSize: 20 * (scale || 1) }}
      >
        {icon}
      </div>
      {editing ? (
        <form onSubmit={submitRename} onClick={(e) => e.stopPropagation()}>
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={submitRename}
            className="w-16 text-[10px] bg-white/[0.1] border border-indigo-400/50 rounded px-1 text-white outline-none text-center"
          />
        </form>
      ) : (
        <span className="text-[11px] text-gray-300 text-center leading-tight drop-shadow pointer-events-none">
          {label}
        </span>
      )}
    </div>
  );
}