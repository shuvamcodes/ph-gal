import { useEffect, useRef, useState } from "react";
import Gallery from "./pages/Gallery.jsx";
import Settings from "./pages/Settings.jsx";
import { ADMIN_WORD, TRIGGER_SEQUENCE } from "./config.js";
import { findVaultByPassword } from "./vaults.js";

export default function App() {
  const [view, setView] = useState("welcome");
  const [activeVault, setActiveVault] = useState(null);
  const [promptVisible, setPromptVisible] = useState(false);
  const [value, setValue] = useState("");

  const inputRef = useRef(null);

  // Keep the invisible/visible input focused whenever we're on the
  // Welcome screen - this is what makes mobile keyboards appear at all.
  useEffect(() => {
    if (view === "welcome") {
      inputRef.current?.focus();
    }
  }, [view, promptVisible]);

  async function tryUnlock(typed) {
    if (typed === ADMIN_WORD) {
      setView("settings");
      return true;
    }
    const vault = await findVaultByPassword(typed);
    if (vault) {
      setActiveVault(vault);
      setView("gallery");
      return true;
    }
    return false;
  }

  function handleChange(e) {
    const newValue = e.target.value;
    setValue(newValue);

    // Watch for the trigger sequence while typing blind (box not shown yet)
    if (!promptVisible && newValue.endsWith(TRIGGER_SEQUENCE)) {
      setPromptVisible(true);
      setValue("");
    }
  }

  async function handleKeyDown(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const typed = value.trim();
    setValue("");
    if (!typed) return;

    const success = await tryUnlock(typed);
    if (!success) {
      // wrong word: silently clear, stay focused, no error shown
      inputRef.current?.focus();
    }
  }

  function handleBlur() {
    // Keep the invisible catcher focused on the blank Welcome screen so
    // typing/tapping keeps working even if focus slips for a moment.
    if (view === "welcome") {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function goToWelcome() {
    setActiveVault(null);
    setPromptVisible(false);
    setValue("");
    setView("welcome");
  }

  return (
    <div className="relative min-h-full">
      <div className="aurora-bg" />
      <div className="relative z-10 h-full">
        {view === "welcome" && (
          <div
            className="h-full flex items-center justify-center"
            onClick={() => inputRef.current?.focus()}
          >
            <h1 className="text-5xl font-light tracking-tight text-gray-500 select-none">
              Welcome<span className="cursor-blink text-indigo-400">_</span>
            </h1>

            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              enterKeyHint="done"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className={
                promptVisible
                  ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 text-center px-5 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white text-lg tracking-wide outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-xl z-20 scale-in"
                  : "fixed inset-0 opacity-0 z-20"
              }
              style={{ fontSize: "16px" }} // prevents iOS Safari auto-zoom on focus
            />
          </div>
        )}

        {view === "settings" && (
          <div className="fade-up h-full">
            <Settings onBack={goToWelcome} />
          </div>
        )}

        {view === "gallery" && activeVault && (
          <div className="fade-up h-full">
            <Gallery
              vaultId={activeVault.id}
              label={activeVault.label}
              onLock={goToWelcome}
            />
          </div>
        )}
      </div>
    </div>
  );
}