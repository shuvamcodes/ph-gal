import { useEffect, useRef, useState, useCallback } from "react";
import Gallery from "./pages/Gallery.jsx";
import Settings from "./pages/Settings.jsx";
import BurnView from "./components/BurnView.jsx";
import KnockOrbs from "./components/KnockOrbs.jsx";
import { ADMIN_WORD, TRIGGER_SEQUENCE, INACTIVITY_LOCK_MS, KNOCK_TARGET_WORD } from "./config.js";
import { findUnlockTarget } from "./vaults.js";
import { useInactivityLock } from "./hooks/useInactivityLock.js";
import { vaultSignatureColors } from "./utils/vaultSignature.js";

export default function App() {
  const burnId = new URLSearchParams(window.location.search).get("burn");

  const [view, setView] = useState("welcome");
  const [activeVault, setActiveVault] = useState(null);
  const [promptVisible, setPromptVisible] = useState(false);
  const [value, setValue] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    if (view === "welcome" && !burnId) {
      inputRef.current?.focus();
    }
  }, [view, promptVisible, burnId]);

  async function tryUnlock(typed) {
    if (typed === ADMIN_WORD) {
      setView("settings");
      return true;
    }

    const result = await findUnlockTarget(typed);
    if (result) {
      const { vault, decoy } = result;
      setActiveVault({
        id: decoy ? `${vault.id}__decoy` : vault.id,
        label: vault.label
      });
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
    if (view === "welcome" && !burnId) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  const goToWelcome = useCallback(() => {
    setActiveVault(null);
    setPromptVisible(false);
    setValue("");
    setView("welcome");
  }, []);

  useInactivityLock(goToWelcome, INACTIVITY_LOCK_MS, view !== "welcome");

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

  function handleKnockMatch() {
    tryUnlock(KNOCK_TARGET_WORD);
  }

  // Burn links bypass the entire vault system entirely - reachable by
  // anyone with the link, no password required, on purpose.
  if (burnId) {
    return (
      <div className="relative min-h-full">
        <div className="aurora-bg" />
        <div className="relative z-10 h-full">
          <BurnView id={burnId} />
        </div>
      </div>
    );
  }

  const signature =
    view === "gallery" && activeVault ? vaultSignatureColors(activeVault.id) : null;

  return (
    <div
      className="relative min-h-full"
      style={
        signature
          ? { "--vault-color-a": signature.colorA, "--vault-color-b": signature.colorB }
          : undefined
      }
    >
      <div className="aurora-bg" />
      <div className="relative z-10 h-full">
        {view === "welcome" && (
          <div
            className="h-full flex items-center justify-center relative"
            onClick={() => inputRef.current?.focus()}
          >
            <KnockOrbs onMatch={handleKnockMatch} />

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
                  ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 text-center px-5 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white text-lg tracking-wide outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-xl z-30 scale-in"
                  : "fixed inset-0 opacity-0 z-10"
              }
              style={{ fontSize: "16px" }}
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