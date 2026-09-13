import { useEffect, useRef, useState } from "react";

export default function TimerStopwatchWidget({ x, y, onMove }) {
  const [mode, setMode] = useState("stopwatch");
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    const start = Date.now() - ms;
    intervalRef.current = setInterval(() => setMs(Date.now() - start), 200);
    return () => clearInterval(intervalRef.current);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");

  function handlePointerDown(e) {
    if (e.target.tagName === "BUTTON") return;
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
      className="absolute z-10 select-none backdrop-blur-xl bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3 text-center w-36"
      style={{ left: x, top: y, cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
    >
      <div className="text-xl font-light text-white tabular-nums mb-1">
        {mm}:{ss}
      </div>
      <div className="flex justify-center gap-1">
        <button
          onClick={() => setRunning((r) => !r)}
          className="px-2 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-[10px]"
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => { setRunning(false); setMs(0); }}
          className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 text-[10px]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}