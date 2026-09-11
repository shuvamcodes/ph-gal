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
    recognition.interimResults = true; // catch the phrase while still speaking, not just after a pause
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      // Check every result in this batch, interim or final - whichever
      // hits the trigger phrase first wins, so it fires faster and
      // doesn't need you to finish the sentence clearly.
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        if (transcript.includes(triggerPhrase.toLowerCase())) {
          onTrigger();
          return;
        }
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