import { useEffect, useState } from "react";
import Logo from "./Logo.jsx";

export default function Taskbar({ windows, onRestore, onStartClick, accent }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 backdrop-blur-xl bg-black/40 border-t border-white/10 flex items-center justify-between px-4 z-40">
      <div className="flex items-center gap-2">
        <button
          onClick={onStartClick}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition hover:brightness-110"
        >
          <Logo size={26} />
        </button>

        {windows.map((w) => (
          <button
            key={w.id}
            onClick={() => onRestore(w.id)}
            className={`px-3 py-1.5 rounded-lg text-xs transition ${
              w.minimized
                ? "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]"
                : "bg-indigo-500/20 text-indigo-200 border border-indigo-400/30"
            }`}
          >
            {w.icon} {w.title}
          </button>
        ))}
      </div>

      <div className="text-right leading-tight">
        <div className="text-white text-sm font-medium">
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div className="text-gray-500 text-[10px]">
          {now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
        </div>
      </div>
    </div>
  );
}