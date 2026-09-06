import { useEffect, useState } from "react";
import { listenToVaults, createVault, deleteVault } from "../vaults.js";
import { ADMIN_WORD } from "../config.js";

export default function Settings({ onBack }) {
  const [vaults, setVaults] = useState([]);
  const [label, setLabel] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = listenToVaults(setVaults);
    return unsub;
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");

    const trimmedLabel = label.trim();
    const trimmedPassword = password.trim();

    if (!trimmedLabel || !trimmedPassword) return;

    if (trimmedPassword === ADMIN_WORD) {
      setError("That word is reserved for Settings — pick a different one.");
      return;
    }

    if (vaults.some((v) => v.password === trimmedPassword)) {
      setError("That password is already used by another gallery.");
      return;
    }

    await createVault(trimmedLabel, trimmedPassword);
    setLabel("");
    setPassword("");
  }

  async function handleDelete(vault) {
    if (!confirm(`Delete gallery "${vault.label}"? Its photos will stay in the database but become unreachable.`)) return;
    await deleteVault(vault.id);
  }

  return (
    <div className="min-h-full max-w-2xl mx-auto px-6 py-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Settings
        </h1>
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Back
        </button>
      </header>

      <form
        onSubmit={handleCreate}
        className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8"
      >
        <h2 className="text-white text-sm font-medium mb-4">
          Add a new gallery
        </h2>

        {error && (
          <p className="text-red-400 text-sm mb-3">{error}</p>
        )}

        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. Family Photos)"
          className="w-full mb-3 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Secret word for this gallery"
          className="w-full mb-4 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition"
        >
          Create Gallery
        </button>
      </form>

      <h2 className="text-white text-sm font-medium mb-3">
        Existing galleries
      </h2>

      {vaults.length === 0 && (
        <p className="text-gray-600 text-sm">No galleries yet — create one above.</p>
      )}

      <div className="space-y-3">
        {vaults.map((vault) => (
          <div
            key={vault.id}
            className="flex items-center justify-between backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3"
          >
            <div>
              <p className="text-white text-sm">{vault.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">
                word: <span className="text-gray-400">{vault.password}</span>
              </p>
            </div>
            <button
              onClick={() => handleDelete(vault)}
              className="text-gray-500 hover:text-red-400 text-sm transition"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}