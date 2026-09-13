import { useState } from "react";

export default function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waiting, setWaiting] = useState(false);

  function inputDigit(d) {
    if (waiting) {
      setDisplay(d);
      setWaiting(false);
    } else {
      setDisplay(display === "0" ? d : display + d);
    }
  }

  function inputDot() {
    if (waiting) {
      setDisplay("0.");
      setWaiting(false);
      return;
    }
    if (!display.includes(".")) setDisplay(display + ".");
  }

  function compute(a, b, op) {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b === 0 ? 0 : a / b;
      default: return b;
    }
  }

  function chooseOperator(op) {
    const value = parseFloat(display);
    if (stored !== null && operator && !waiting) {
      setDisplay(String(compute(stored, value, operator)));
      setStored(compute(stored, value, operator));
    } else {
      setStored(value);
    }
    setOperator(op);
    setWaiting(true);
  }

  function equals() {
    if (stored === null || !operator) return;
    const value = parseFloat(display);
    setDisplay(String(compute(stored, value, operator)));
    setStored(null);
    setOperator(null);
    setWaiting(true);
  }

  function clear() {
    setDisplay("0");
    setStored(null);
    setOperator(null);
    setWaiting(false);
  }

  const buttons = [
    ["C", "÷", "×"],
    ["7", "8", "9", "-"],
    ["4", "5", "6", "+"],
    ["1", "2", "3", "="],
    ["0", "."]
  ];

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="bg-white/[0.03] rounded-xl px-4 py-4 mb-3 text-right text-2xl text-white font-light truncate">
        {display}
      </div>

      <div className="grid grid-cols-4 gap-2 flex-1">
        {["7", "8", "9", "÷"].map((k) => (
          <CalcKey key={k} label={k} onClick={() => (k === "÷" ? chooseOperator(k) : inputDigit(k))} />
        ))}
        {["4", "5", "6", "×"].map((k) => (
          <CalcKey key={k} label={k} onClick={() => (k === "×" ? chooseOperator(k) : inputDigit(k))} />
        ))}
        {["1", "2", "3", "-"].map((k) => (
          <CalcKey key={k} label={k} onClick={() => (k === "-" ? chooseOperator(k) : inputDigit(k))} />
        ))}
        <CalcKey label="0" onClick={() => inputDigit("0")} />
        <CalcKey label="." onClick={inputDot} />
        <CalcKey label="C" onClick={clear} accent="red" />
        <CalcKey label="+" onClick={() => chooseOperator("+")} />
        <CalcKey label="=" onClick={equals} accent="indigo" wide />
      </div>
    </div>
  );
}

function CalcKey({ label, onClick, accent, wide }) {
  return (
    <button
      onClick={onClick}
      className={`${wide ? "col-span-1" : ""} rounded-xl text-sm font-medium transition ${
        accent === "indigo"
          ? "bg-indigo-500 hover:bg-indigo-400 text-white"
          : accent === "red"
          ? "bg-red-500/70 hover:bg-red-500 text-white"
          : "bg-white/[0.05] hover:bg-white/[0.1] text-gray-200"
      }`}
    >
      {label}
    </button>
  );
}