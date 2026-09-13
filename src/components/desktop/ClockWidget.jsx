import { useEffect, useRef, useState } from "react";

export default function ClockWidget({ x, y, onMove }) {
  const [now, setNow] = useState(new Date());
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  function handlePointerDown(e) {
    e.stopPropagation();
    setDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    startRef.current = { x: e.clientX, y: e.clientY };
    onMove(x + dx, y + dy, false);
  }

  function handlePointerUp() {
    setDragging(false);
    onMove(x, y, true);
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="absolute z-10 select-none backdrop-blur-xl bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-4 text-center"
      style={{ left: x, top: y, cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
    >
      <div className="text-2xl font-light text-white tabular-nums">
        {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="text-gray-500 text-[11px] mt-0.5">
        {now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
      </div>
    </div>
  );
}