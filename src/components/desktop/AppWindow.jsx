import { useRef, useState } from "react";

export default function AppWindow({
  title,
  icon,
  x,
  y,
  zIndex,
  width = 420,
  height = 480,
  onClose,
  onMinimize,
  onFocus,
  onDragDelta,
  onSnap,
  snapped,
  children
}) {
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [edgeHint, setEdgeHint] = useState(null);

  function handlePointerDown(e) {
    if (e.target.closest("button")) return;
    onFocus();
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    onDragDelta(dx, dy);

    if (e.clientX < 24) setEdgeHint("left");
    else if (e.clientX > window.innerWidth - 24) setEdgeHint("right");
    else setEdgeHint(null);
  }

  function handlePointerUp() {
    setDragging(false);
    if (edgeHint) onSnap(edgeHint);
    setEdgeHint(null);
  }

  const finalWidth = snapped ? "50vw" : width;
  const finalHeight = snapped ? "calc(100vh - 56px)" : height;
  const finalLeft = snapped === "left" ? 0 : snapped === "right" ? "50vw" : x;
  const finalTop = snapped ? 0 : y;

  return (
    <>
      {dragging && edgeHint && (
        <div
          className="fixed top-0 bottom-14 bg-indigo-400/20 border-2 border-indigo-400/50 z-40 pointer-events-none"
          style={{
            width: "50vw",
            left: edgeHint === "left" ? 0 : "50vw"
          }}
        />
      )}
      <div
        className="fixed rounded-2xl overflow-hidden backdrop-blur-xl bg-[#0d0d16]/90 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col transition-all"
        style={{ left: finalLeft, top: finalTop, width: finalWidth, height: finalHeight, zIndex }}
        onMouseDown={onFocus}
      >
        <div
          className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border-b border-white/10 cursor-grab active:cursor-grabbing select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={() => onSnap(snapped ? null : "left")}
        >
          <span className="text-sm text-gray-200 flex items-center gap-2">
            <span>{icon}</span> {title}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onMinimize(); }}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-gray-400 text-xs transition"
              title="Minimize"
            >
              ─
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-500/30 text-gray-400 hover:text-red-300 text-xs transition"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </>
  );
}