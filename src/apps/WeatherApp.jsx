import { useEffect, useState } from "react";

const WEATHER_LABELS = {
  0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Foggy", 51: "Light drizzle", 61: "Rain",
  63: "Rain", 65: "Heavy rain", 71: "Snow", 80: "Rain showers", 95: "Thunderstorm"
};

export default function WeatherApp() {
  const [current, setCurrent] = useState(null);
  const [daily, setDaily] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    function fetchWeather(lat, lon) {
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
      )
        .then((r) => r.json())
        .then((json) => {
          setCurrent(json.current);
          setDaily(json.daily);
        })
        .catch(() => setError(true));
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(28.6139, 77.209)
      );
    } else {
      fetchWeather(28.6139, 77.209);
    }
  }, []);

  if (error) return <p className="p-6 text-gray-500 text-sm text-center">Weather unavailable</p>;
  if (!current) return <p className="p-6 text-gray-500 text-sm text-center">Loading...</p>;

  return (
    <div className="p-5 text-sm">
      <div className="text-center mb-6">
        <div className="text-5xl font-light text-white">{Math.round(current.temperature_2m)}°C</div>
        <div className="text-gray-400 text-sm mt-1">{WEATHER_LABELS[current.weather_code] || "—"}</div>
        <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
          <span>💧 {current.relative_humidity_2m}%</span>
          <span>💨 {Math.round(current.wind_speed_10m)} km/h</span>
        </div>
      </div>

      {daily && (
        <div className="space-y-1">
          {daily.time.slice(0, 5).map((date, i) => (
            <div key={date} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/[0.03]">
              <span className="text-gray-400 text-xs">
                {new Date(date).toLocaleDateString([], { weekday: "short" })}
              </span>
              <span className="text-gray-500 text-xs flex-1 text-center">
                {WEATHER_LABELS[daily.weather_code[i]] || "—"}
              </span>
              <span className="text-white text-xs">
                {Math.round(daily.temperature_2m_max[i])}° / {Math.round(daily.temperature_2m_min[i])}°
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}