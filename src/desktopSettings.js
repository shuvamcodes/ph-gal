const KEY = "desktopSettings";
const DEFAULTS = { accent: "#6366f1", iconScale: 1, soundOn: true };

export function getDesktopSettings() {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? Object.assign({}, DEFAULTS, JSON.parse(saved)) : DEFAULTS;
  } catch (err) {
    return DEFAULTS;
  }
}

export function saveDesktopSettings(partial) {
  const current = getDesktopSettings();
  const next = Object.assign({}, current, partial);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("desktopSettingsChanged", { detail: next }));
  return next;
}