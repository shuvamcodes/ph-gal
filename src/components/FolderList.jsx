import { useState } from "react";

function FolderCard({ folder, onOpen, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(folder.name);

  function startRename(e) {
    e.stopPropagation();
    setName(folder.name);
    setEditing(true);
  }

  function submitRename(e) {
    e.preventDefault();
    e.stopPropagation();
    const trimmed = name.trim();
    if (trimmed && trimmed !== folder.name) {
      onRename(folder, trimmed);
    }
    setEditing(false);
  }

  return (
    <div
      className="group relative backdrop-blur-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-indigo-400/40 rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-0.5"
      onClick={() => !editing && onOpen(folder)}
    >
      <div className="text-3xl mb-2">📁</div>

      {editing ? (
        <form onSubmit={submitRename} onClick={(e) => e.stopPropagation()}>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={submitRename}
            className="w-full text-sm bg-white/[0.08] border border-indigo-400/50 rounded-lg px-2 py-1 text-white outline-none"
          />
        </form>
      ) : (
        <p className="text-sm text-gray-200 truncate">{folder.name}</p>
      )}

      {!editing && (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={startRename}
            className="text-gray-500 hover:text-indigo-300 text-xs"
            title="Rename folder"
          >
            ✎
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(folder);
            }}
            className="text-gray-500 hover:text-red-400 text-xs"
            title="Delete folder"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default function FolderList({ folders, onOpen, onDelete, onRename }) {
  if (folders.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
      {folders.map((folder) => (
        <FolderCard
          key={folder.id}
          folder={folder}
          onOpen={onOpen}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  );
}