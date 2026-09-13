import { useEffect, useRef, useState } from "react";

export default function BatteryWidget({ x, y, onMove }) {
  const [level, setLevel] = useState(null);
  const [charging, setCharging] = useState(false);
  const [supported, setSupported] = useState(true);
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!navigator.getBattery) {
      setSupported(false);
      return;
    }
    let batteryRef;
    navigator.getBattery().then((battery) => {
      batteryRef = battery;
      const update = () => {
        setLevel(battery.level);
        setCharging(battery.charging);
      };
      update();
      battery.addEventListener("levelchange", update);
      battery.addEventListener("chargingchange", update);
    });
    return () => {
      if (batteryRef) {
        batteryRef.removeEventListener("levelchange", () => {});
        batteryRef.removeEventListener("chargingchange", () => {});
      }
    };
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
      className="absolute z-10 select-none backdrop-blur-xl bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3 text-center w-32"
      style={{ left: x, top: y, cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
    >
      {!supported ? (
        <p className="text-gray-500 text-[10px]">Battery info not available in this browser</p>
      ) : level === null ? (
        <p className="text-gray-500 text-[10px]">Loading...</p>
      ) : (
        <>
          <div className="text-lg font-light text-white">
            {Math.round(level * 100)}%
          </div>
          <div className="text-gray-500 text-[10px]">
            {charging ? "⚡ Charging" : "Battery"}
          </div>
        </>
      )}
    </div>
  );
}