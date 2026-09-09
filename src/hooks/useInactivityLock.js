import { useEffect, useRef } from "react";

export function useInactivityLock(onTimeout, timeoutMs, enabled) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    function resetTimer() {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(onTimeout, timeoutMs);
    }

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [onTimeout, timeoutMs, enabled]);
}