import { useEffect, useState } from "react";

const WEATHER_LABELS = {
  0: "☀️ Clear", 1: "🌤 Mostly clear", 2: "⛅ Partly cloudy", 3: "☁️ Cloudy",
  45: "🌫 Foggy", 48: "🌫 Foggy", 51: "🌦 Drizzle", 61: "🌧 Rain",
  63: "🌧 Rain", 65: "🌧 Heavy rain", 71: "🌨 Snow", 80: "🌦 Showers",
  95: "⛈ Storm"
};

export default function WeatherWidget({ x, y, onMove }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startRef = useState({ x: 0, y: 0 })[0];

  useEffect(() => {
    function fetchWeather(lat, lon) {
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
      )
        .then((r) => r.json())
        .then((json) => setData(json.current))
        .catch(() => setError(true));
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(28.6139, 77.209) // fallback: New Delhi
      );
    } else {
      fetchWeather(28.6139, 77.209);
    }
  }, []);

  function handlePointerDown(e) {
    e.stopPropagation();
    setDragging(true);
    startRef.x = e.clientX;
    startRef.y = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - startRef.x;
    const dy = e.clientY - startRef.y;
    startRef.x = e.clientX;
    startRef.y = e.clientY;
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
      className="absolute z-10 select-none backdrop-blur-xl bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-4 text-center min-w-[140px]"
      style={{ left: x, top: y, cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
    >
      {error ? (
        <p className="text-gray-500 text-xs">Weather unavailable</p>
      ) : !data ? (
        <p className="text-gray-500 text-xs">Loading...</p>
      ) : (
        <>
          <div className="text-2xl font-light text-white">
            {Math.round(data.temperature_2m)}°C
          </div>
          <div className="text-gray-400 text-xs mt-0.5">
            {WEATHER_LABELS[data.weather_code] || "—"}
          </div>
        </>
      )}
    </div>
  );
}