import { useEffect, useRef, useState } from "react";
import Gallery from "./pages/Gallery.jsx";
import Settings from "./pages/Settings.jsx";
import PasswordPrompt from "./components/PasswordPrompt.jsx";
import { ADMIN_WORD, TRIGGER_SEQUENCE } from "./config.js";
import { findVaultByPassword } from "./vaults.js";

export default function App() {
  const [view, setView] = useState("welcome");
  const [activeVault, setActiveVault] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const triggerBufferRef = useRef("");
  const directBufferRef = useRef("");

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

  // Runs on the blank Welcome screen at all times - handles BOTH
  // the trigger sequence (for the popup) and blind direct typing + Enter.
  useEffect(() => {
    if (view !== "welcome" || showPrompt) return;

    function handleKeyDown(e) {
      if (e.key === "Enter") {
        const typed = directBufferRef.current;
        directBufferRef.current = "";
        if (typed) tryUnlock(typed);
        return;
      }

      if (e.key.length !== 1) return;

      // Track the direct-typing buffer (uncapped-ish, generous window)
      directBufferRef.current = (directBufferRef.current + e.key).slice(-64);

      // Track the trigger-sequence buffer separately, in parallel
      triggerBufferRef.current = (
        triggerBufferRef.current + e.key
      ).slice(-TRIGGER_SEQUENCE.length);

      if (triggerBufferRef.current === TRIGGER_SEQUENCE) {
        triggerBufferRef.current = "";
        directBufferRef.current = "";
        e.preventDefault();
        setShowPrompt(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view, showPrompt]);

  async function handleSubmitPassword(typed) {
    const success = await tryUnlock(typed);
    if (success) setShowPrompt(false);
    return success;
  }

  function goToWelcome() {
    setActiveVault(null);
    setView("welcome");
  }

  return (
    <div className="relative min-h-full">
      <div className="aurora-bg" />
      <div className="relative z-10 h-full">
        {view === "welcome" && (
          <div className="h-full flex items-center justify-center">
            <h1 className="text-5xl font-light tracking-tight text-gray-500 select-none">
              Welcome<span className="cursor-blink text-indigo-400">_</span>
            </h1>
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

      {showPrompt && (
        <PasswordPrompt
          onSubmit={handleSubmitPassword}
          onCancel={() => setShowPrompt(false)}
        />
      )}
    </div>
  );
}