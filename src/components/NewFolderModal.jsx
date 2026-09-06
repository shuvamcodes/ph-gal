import { useState } from "react";
import { createPortal } from "react-dom";

export default function NewFolderModal({ onCreate, onClose }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="scale-in backdrop-blur-xl bg-white/[0.05] rounded-2xl p-6 w-full max-w-sm border border-white/10 shadow-[0_0_40px_rgba(99,102,241,0.1)]"
      >
        <h2 className="text-white text-lg font-medium mb-4">New Folder</h2>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Folder name"
          className="w-full mb-4 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-300 hover:bg-white/[0.05] transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white transition"
          >
            Create
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}