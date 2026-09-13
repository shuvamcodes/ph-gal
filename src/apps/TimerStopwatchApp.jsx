import { useEffect, useRef, useState } from "react";

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs transition ${
        active ? "bg-indigo-500 text-white" : "text-gray-400 hover:bg-white/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}

function TimerTab() {
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [minInput, setMinInput] = useState("5");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { setRunning(false); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function start() {
    if (remaining === 0) setRemaining(Math.max(1, parseInt(minInput || "0", 10) * 60));
    setRunning(true);
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="text-center py-6">
      {remaining === 0 && !running ? (
        <div className="flex items-center justify-center gap-2 mb-4">
          <input
            type="number"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            className="w-16 px-2 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-white text-sm text-center outline-none"
          />
          <span className="text-gray-500 text-xs">minutes</span>
        </div>
      ) : (
        <div className="text-4xl font-light text-white mb-4">{mm}:{ss}</div>
      )}
      <div className="flex justify-center gap-2">
        <button onClick={running ? () => setRunning(false) : start} className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs">
          {running ? "Pause" : "Start"}
        </button>
        <button onClick={() => { setRunning(false); setRemaining(0); }} className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 text-xs">
          Reset
        </button>
      </div>
    </div>
  );
}

function StopwatchTab() {
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    const start = Date.now() - ms;
    intervalRef.current = setInterval(() => setMs(Date.now() - start), 47);
    return () => clearInterval(intervalRef.current);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, "0");

  return (
    <div className="text-center py-6">
      <div className="text-4xl font-light text-white mb-4">
        {mm}:{ss}<span className="text-lg text-gray-500">.{cs}</span>
      </div>
      <div className="flex justify-center gap-2">
        <button onClick={() => setRunning((r) => !r)} className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs">
          {running ? "Pause" : "Start"}
        </button>
        <button onClick={() => { setRunning(false); setMs(0); }} className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 text-xs">
          Reset
        </button>
      </div>
    </div>
  );
}

export default function TimerStopwatchApp() {
  const [tab, setTab] = useState("timer");
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-center gap-1 mb-2">
        <TabButton active={tab === "timer"} onClick={() => setTab("timer")}>Timer</TabButton>
        <TabButton active={tab === "stopwatch"} onClick={() => setTab("stopwatch")}>Stopwatch</TabButton>
      </div>
      {tab === "timer" ? <TimerTab /> : <StopwatchTab />}
    </div>
  );
}