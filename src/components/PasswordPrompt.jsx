import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function PasswordPrompt({ onSubmit, onCancel }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    const success = await onSubmit(trimmed);
    if (!success) {
      // wrong word: just clear it silently, no error message
      setValue("");
      inputRef.current?.focus();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <form
        onSubmit={handleSubmit}
        className="scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          className="w-72 text-center px-5 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white text-lg tracking-wide outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-xl"
        />
      </form>
    </div>,
    document.body
  );
}