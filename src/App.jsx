import { useEffect, useRef, useState, useCallback } from "react";
import Gallery from "./pages/Gallery.jsx";
import Settings from "./pages/Settings.jsx";
import Welcome from "./pages/Welcome.jsx";
import BurnView from "./components/BurnView.jsx";
import { ADMIN_WORD, INACTIVITY_LOCK_MS } from "./config.js";
import { findUnlockTarget } from "./vaults.js";
import { useInactivityLock } from "./hooks/useInactivityLock.js";
import { vaultSignatureColors } from "./utils/vaultSignature.js";

export default function App() {
  const burnId = new URLSearchParams(window.location.search).get("burn");

  const [view, setView] = useState("welcome");
  const [activeVault, setActiveVault] = useState(null);

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

  const goToWelcome = useCallback(() => {
    setActiveVault(null);
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
        {view === "welcome" && <Welcome onUnlock={tryUnlock} />}

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