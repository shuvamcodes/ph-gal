import { useEffect, useState } from "react";
import { listenToNotes, createNote, updateNote, deleteNote } from "../firestoreApps.js";

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  useEffect(() => {
    const unsub = listenToNotes(setNotes);
    return unsub;
  }, []);

  const active = notes.find((n) => n.id === activeId);

  useEffect(() => {
    if (active) {
      setDraftTitle(active.title);
      setDraftContent(active.content);
    }
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleNew() {
    const id = await createNote();
    setActiveId(id);
  }

  function saveSoon(title, content) {
    if (!activeId) return;
    updateNote(activeId, { title, content });
  }

  return (
    <div className="flex h-full text-sm">
      <div className="w-32 border-r border-white/10 flex flex-col">
        <button
          onClick={handleNew}
          className="m-2 px-2 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs"
        >
          + New
        </button>
        <div className="flex-1 overflow-auto">
          {notes.map((n) => (
            <button
              key={n.id}
              onClick={() => setActiveId(n.id)}
              className={`w-full text-left px-2.5 py-2 text-xs truncate transition ${
                n.id === activeId ? "bg-indigo-500/20 text-indigo-200" : "text-gray-400 hover:bg-white/[0.05]"
              }`}
            >
              {n.title || "Untitled"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-3">
        {active ? (
          <>
            <input
              value={draftTitle}
              onChange={(e) => {
                setDraftTitle(e.target.value);
                saveSoon(e.target.value, draftContent);
              }}
              className="bg-transparent text-white text-sm font-medium mb-2 outline-none"
            />
            <textarea
              value={draftContent}
              onChange={(e) => {
                setDraftContent(e.target.value);
                saveSoon(draftTitle, e.target.value);
              }}
              className="flex-1 bg-transparent text-gray-300 text-sm outline-none resize-none"
              placeholder="Start writing..."
            />
            <button
              onClick={() => {
                deleteNote(activeId);
                setActiveId(null);
              }}
              className="self-start text-xs text-gray-600 hover:text-red-400 mt-2 transition"
            >
              Delete note
            </button>
          </>
        ) : (
          <p className="text-gray-600 text-xs m-auto">Select or create a note</p>
        )}
      </div>
    </div>
  );
}