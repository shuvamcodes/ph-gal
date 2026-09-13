import { useState } from "react";
import { getDesktopSettings, saveDesktopSettings } from "../desktopSettings.js";

const ACCENTS = ["#6366f1", "#22d3ee", "#f43f5e", "#22c55e", "#f59e0b", "#a855f7"];

export default function PreferencesApp() {
  const [settings, setSettings] = useState(getDesktopSettings());

  function update(partial) {
    const next = saveDesktopSettings(partial);
    setSettings(next);
  }

  return (
    <div className="p-5 text-sm space-y-6">
      <div>
        <p className="text-gray-300 text-xs mb-2">Accent color</p>
        <div className="flex gap-2">
          {ACCENTS.map((c) => (
            <button
              key={c}
              onClick={() => update({ accent: c })}
              className="w-7 h-7 rounded-full border-2 transition"
              style={{
                background: c,
                borderColor: settings.accent === c ? "white" : "transparent"
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-gray-300 text-xs mb-2">Icon size</p>
        <div className="flex gap-2">
          {[
            { label: "Small", value: 0.8 },
            { label: "Medium", value: 1 },
            { label: "Large", value: 1.25 }
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => update({ iconScale: opt.value })}
              className={`px-3 py-1.5 rounded-lg text-xs transition ${
                settings.iconScale === opt.value
                  ? "bg-indigo-500 text-white"
                  : "bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-gray-300 text-xs">Sound effects</p>
        <button
          onClick={() => update({ soundOn: !settings.soundOn })}
          className={`w-11 h-6 rounded-full transition relative ${
            settings.soundOn ? "bg-indigo-500" : "bg-white/10"
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
              settings.soundOn ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </div>

      <p className="text-gray-600 text-[10px] leading-relaxed">
        Note: accent color currently applies to a handful of key controls
        (Start button, active window highlights) rather than every element
        across every app.
      </p>
    </div>
  );
}