import { useEffect, useRef, useState, useCallback } from "react";
import Gallery from "./pages/Gallery.jsx";
import Settings from "./pages/Settings.jsx";
import { ADMIN_WORD, TRIGGER_SEQUENCE, VOICE_LOCK_PHRASE, INACTIVITY_LOCK_MS } from "./config.js";
import { findVaultByPassword } from "./vaults.js";
import { useInactivityLock } from "./hooks/useInactivityLock.js";
import { useVoiceLock } from "./hooks/useVoiceLock.js";

export default function App() {
  const [view, setView] = useState("welcome");
  const [activeVault, setActiveVault] = useState(null);
  const [promptVisible, setPromptVisible] = useState(false);
  const [value, setValue] = useState("");
  const [voiceLockEnabled, setVoiceLockEnabled] = useState(
    () => localStorage.getItem("voiceLockEnabled") === "true"
  );

  const inputRef = useRef(null);

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
      inputRef.current?.focus();
    }
  }

  function handleBlur() {
    if (view === "welcome") {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  const goToWelcome = useCallback(() => {
    setActiveVault(null);
    setPromptVisible(false);
    setValue("");
    setView("welcome");
  }, []);

  function toggleVoiceLock(next) {
    setVoiceLockEnabled(next);
    localStorage.setItem("voiceLockEnabled", String(next));
  }

  useInactivityLock(goToWelcome, INACTIVITY_LOCK_MS, view !== "welcome");

  const { supported: voiceSupported } = useVoiceLock(
    VOICE_LOCK_PHRASE,
    goToWelcome,
    voiceLockEnabled
  );

  const lastEscapeRef = useRef(0);
  useEffect(() => {
    function handleGlobalEscape(e) {
      if (e.key !== "Escape" || view === "welcome") return;
      const now = Date.now();
      if (now - lastEscapeRef.current < 600) {
        goToWelcome();
      }
      lastEscapeRef.current = now;
    }
    window.addEventListener("keydown", handleGlobalEscape);
    return () => window.removeEventListener("keydown", handleGlobalEscape);
  }, [view, goToWelcome]);

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
              style={{ fontSize: "16px" }}
            />
          </div>
        )}

        {view === "settings" && (
          <div className="fade-up h-full">
            <Settings
              onBack={goToWelcome}
              voiceLockEnabled={voiceLockEnabled}
              onToggleVoiceLock={toggleVoiceLock}
              voiceSupported={voiceSupported}
            />
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