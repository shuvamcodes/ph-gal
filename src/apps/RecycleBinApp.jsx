import { useEffect, useState } from "react";
import { fetchTrashedItems, restoreItem, deleteForever } from "../firestoreFiles.js";

const TYPE_ICONS = { note: "📝", todo: "✅", event: "📅", file: "📄" };

export default function RecycleBinApp() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const results = await fetchTrashedItems();
    setItems(results);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleRestore(item) {
    await restoreItem(item.collectionName, item.id);
    refresh();
  }

  async function handleDeleteForever(item) {
    if (!confirm(`Permanently delete "${item.label}"? This can't be undone.`)) return;
    await deleteForever(item.collectionName, item.id);
    refresh();
  }

  return (
    <div className="p-4 h-full text-sm">
      {loading ? (
        <p className="text-gray-600 text-xs text-center mt-8">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-600 text-xs text-center mt-8">Recycle Bin is empty</p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={`${item.collectionName}-${item.id}`}
              className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/[0.04]"
            >
              <span className="text-gray-300 text-xs truncate flex items-center gap-2">
                {TYPE_ICONS[item.type]} {item.label}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRestore(item)}
                  className="text-indigo-300 hover:text-indigo-200 text-xs"
                >
                  Restore
                </button>
                <button
                  onClick={() => handleDeleteForever(item)}
                  className="text-gray-600 hover:text-red-400 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}