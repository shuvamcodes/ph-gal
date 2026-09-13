import { useEffect, useState } from "react";
import { listenToEvents, addEvent, deleteEvent } from "../firestoreApps.js";

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarApp() {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    const unsub = listenToEvents(setEvents);
    return unsub;
  }, []);

  const firstDay = new Date(cursor.year, cursor.month, 1).getDay();
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const monthLabel = new Date(cursor.year, cursor.month).toLocaleDateString([], {
    month: "long",
    year: "numeric"
  });

  function changeMonth(delta) {
    let month = cursor.month + delta;
    let year = cursor.year;
    if (month < 0) { month = 11; year -= 1; }
    if (month > 11) { month = 0; year += 1; }
    setCursor({ year, month });
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function eventsFor(dateStr) {
    return events.filter((e) => e.date === dateStr);
  }

  async function handleAddEvent(e) {
    e.preventDefault();
    if (!newTitle.trim() || !selectedDate) return;
    await addEvent(selectedDate, newTitle.trim());
    setNewTitle("");
  }

  return (
    <div className="p-4 text-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => changeMonth(-1)} className="text-gray-400 hover:text-white">‹</button>
        <span className="text-white text-xs font-medium">{monthLabel}</span>
        <button onClick={() => changeMonth(1)} className="text-gray-400 hover:text-white">›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[10px] text-gray-500 mb-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-3">
        {cells.map((day, i) => {
          const dateStr = day ? toDateStr(cursor.year, cursor.month, day) : null;
          const hasEvents = dateStr && eventsFor(dateStr).length > 0;
          const isSelected = dateStr === selectedDate;
          return (
            <button
              key={i}
              disabled={!day}
              onClick={() => setSelectedDate(dateStr)}
              className={`aspect-square rounded-lg text-xs flex flex-col items-center justify-center transition ${
                !day ? "" : isSelected ? "bg-indigo-500 text-white" : "hover:bg-white/[0.06] text-gray-300"
              }`}
            >
              {day}
              {hasEvents && <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5" />}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="flex-1 overflow-auto">
          <form onSubmit={handleAddEvent} className="flex gap-2 mb-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add event..."
              className="flex-1 px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white text-xs outline-none"
            />
            <button type="submit" className="px-2 py-1.5 rounded-lg bg-indigo-500 text-white text-xs">
              +
            </button>
          </form>
          {eventsFor(selectedDate).map((ev) => (
            <div key={ev.id} className="flex items-center justify-between text-xs text-gray-300 px-2 py-1">
              <span>{ev.title}</span>
              <button onClick={() => deleteEvent(ev.id)} className="text-gray-700 hover:text-red-400">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}