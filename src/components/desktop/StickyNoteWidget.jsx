import { useEffect, useRef, useState } from "react";
import { listenToSticky, saveSticky } from "../../firestoreApps.js";

export default function StickyNoteWidget({ x, y, onMove }) {
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });
  const saveTimer = useRef(null);

  useEffect(() => {
    const unsub = listenToSticky(setText);
    return unsub;
  }, []);

  function handleChange(e) {
    const value = e.target.value;
    setText(value);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveSticky(value), 500);
  }

  function handlePointerDown(e) {
    if (e.target.tagName === "TEXTAREA") return;
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
      className="absolute z-10 backdrop-blur-xl bg-yellow-400/10 border border-yellow-300/20 rounded-2xl p-3 w-40"
      style={{ left: x, top: y, cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
    >
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Quick note..."
        className="w-full h-24 bg-transparent text-yellow-100 text-xs outline-none resize-none placeholder-yellow-200/40"
      />
    </div>
  );
}