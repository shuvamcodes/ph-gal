import { useRef, useState } from "react";
import { KNOCK_PATTERN } from "../config.js";

const ORBS = [
  { id: 1, top: "18%", left: "12%", color: "#6366f1" },
  { id: 2, top: "22%", right: "15%", color: "#22d3ee" },
  { id: 3, bottom: "20%", left: "18%", color: "#a78bfa" },
  { id: 4, bottom: "16%", right: "12%", color: "#38bdf8" }
];

export default function KnockOrbs({ onMatch }) {
  const [pulsing, setPulsing] = useState({});
  const bufferRef = useRef([]);
  const lastTapRef = useRef(0);

  function handleTap(orbId) {
    const now = Date.now();

    // A pause longer than this resets the pattern, same feel as a
    // real knock rhythm rather than an unlimited-time code entry.
    if (now - lastTapRef.current > 2500) {
      bufferRef.current = [];
    }
    lastTapRef.current = now;

    bufferRef.current = [...bufferRef.current, orbId].slice(-KNOCK_PATTERN.length);

    setPulsing((p) => ({ ...p, [orbId]: true }));
    setTimeout(() => {
      setPulsing((p) => ({ ...p, [orbId]: false }));
    }, 350);

    const matched =
      bufferRef.current.length === KNOCK_PATTERN.length &&
      bufferRef.current.every((v, i) => v === KNOCK_PATTERN[i]);

    if (matched) {
      bufferRef.current = [];
      onMatch();
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {ORBS.map((orb) => (
        <button
          key={orb.id}
          onClick={(e) => {
            e.stopPropagation();
            handleTap(orb.id);
          }}
          className="absolute w-4 h-4 rounded-full pointer-events-auto transition-transform duration-300"
          style={{
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
            background: orb.color,
            opacity: 0.28,
            filter: "blur(1px)",
            boxShadow: pulsing[orb.id]
              ? `0 0 24px 8px ${orb.color}`
              : `0 0 10px 2px ${orb.color}`,
            transform: pulsing[orb.id] ? "scale(1.6)" : "scale(1)"
          }}
          aria-hidden="true"
          tabIndex={-1}
        />
      ))}
    </div>
  );
}