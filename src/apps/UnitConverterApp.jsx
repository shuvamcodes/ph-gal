import { useState } from "react";

const CATEGORIES = {
  length: { units: { m: 1, km: 1000, cm: 0.01, mi: 1609.34, ft: 0.3048, in: 0.0254 }, label: "Length" },
  weight: { units: { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495 }, label: "Weight" },
  temperature: { label: "Temperature" }
};

function convertTemp(value, from, to) {
  let celsius = value;
  if (from === "F") celsius = (value - 32) * (5 / 9);
  if (from === "K") celsius = value - 273.15;
  if (to === "F") return celsius * (9 / 5) + 32;
  if (to === "K") return celsius + 273.15;
  return celsius;
}

export default function UnitConverterApp() {
  const [category, setCategory] = useState("length");
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("km");

  let result = "";
  if (category === "temperature") {
    result = convertTemp(parseFloat(value) || 0, from, to).toFixed(2);
  } else {
    const units = CATEGORIES[category].units;
    const base = (parseFloat(value) || 0) * units[from];
    result = (base / units[to]).toFixed(4);
  }

  const unitOptions =
    category === "temperature" ? ["C", "F", "K"] : Object.keys(CATEGORIES[category].units);

  function handleCategoryChange(cat) {
    setCategory(cat);
    const opts = cat === "temperature" ? ["C", "F", "K"] : Object.keys(CATEGORIES[cat].units);
    setFrom(opts[0]);
    setTo(opts[1]);
  }

  return (
    <div className="p-4 h-full">
      <div className="flex gap-1 mb-4">
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => handleCategoryChange(key)}
            className={`px-3 py-1.5 rounded-lg text-xs transition ${
              category === key ? "bg-indigo-500 text-white" : "text-gray-400 hover:bg-white/[0.05]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white text-sm outline-none"
      />

      <div className="flex items-center gap-2 mb-3">
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="flex-1 px-2 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white text-xs outline-none"
        >
          {unitOptions.map((u) => <option key={u} value={u} className="bg-[#0d0d16]">{u}</option>)}
        </select>
        <span className="text-gray-500 text-xs">to</span>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="flex-1 px-2 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white text-xs outline-none"
        >
          {unitOptions.map((u) => <option key={u} value={u} className="bg-[#0d0d16]">{u}</option>)}
        </select>
      </div>

      <div className="text-center py-4 bg-white/[0.03] rounded-xl">
        <span className="text-2xl font-light text-white">{result}</span>
        <span className="text-gray-500 text-sm ml-2">{to}</span>
      </div>
    </div>
  );
}