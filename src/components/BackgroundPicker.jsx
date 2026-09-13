import { useRef } from "react";

const PRESETS = [
  { id: "skyline", label: "Skyline", preview: "linear-gradient(180deg, #0a0a18, #1e1a3a)" },
  { id: "aurora", label: "Aurora", preview: "radial-gradient(circle at 30% 30%, #6366f1, #05050a 70%)" },
  { id: "sunset", label: "Sunset", preview: "linear-gradient(180deg, #2d1b4e, #c2410c, #1a0f2e)" },
  { id: "ocean", label: "Ocean", preview: "linear-gradient(180deg, #0c2d48, #145374, #05050a)" }
];

export default function BackgroundPicker({ current, onSelectPreset, onUploadImage, onClose }) {
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUploadImage(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="scale-in w-full max-w-sm backdrop-blur-xl bg-white/[0.05] border border-white/10 rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-white text-sm font-medium mb-4">Background</h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p.id)}
              className={`h-16 rounded-xl border-2 transition ${
                current?.type === "preset" && current.value === p.id
                  ? "border-indigo-400"
                  : "border-white/10 hover:border-white/25"
              }`}
              style={{ background: p.preview }}
              title={p.label}
            />
          ))}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-gray-200 text-sm transition"
        >
          Upload your own image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-gray-500 hover:text-white text-xs transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}