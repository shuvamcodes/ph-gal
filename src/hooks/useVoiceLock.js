import { useEffect, useRef } from "react";

const SpeechRecognitionClass =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export function useVoiceLock(triggerPhrase, onTrigger, enabled) {
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript.toLowerCase().trim();
      if (transcript.includes(triggerPhrase.toLowerCase())) {
        onTrigger();
      }
    };

    recognition.onend = () => {
      if (enabledRef.current) {
        try {
          recognition.start();
        } catch {
          // already running - ignore
        }
      }
    };

    recognition.onerror = () => {
      // swallow errors (no-speech, network) - onend restarts it
    };

    try {
      recognition.start();
    } catch {
      // ignore
    }

    return () => {
      enabledRef.current = false;
      recognition.onend = null;
      recognition.stop();
    };
  }, [enabled, triggerPhrase, onTrigger]);

  return { supported: !!SpeechRecognitionClass };
}