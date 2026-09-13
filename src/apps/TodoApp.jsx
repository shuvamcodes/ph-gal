import { useEffect, useState } from "react";
import { listenToTodos, addTodo, toggleTodo, deleteTodo } from "../firestoreApps.js";

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    const unsub = listenToTodos(setTodos);
    return unsub;
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    addTodo(trimmed);
    setValue("");
  }

  return (
    <div className="p-4 text-sm h-full flex flex-col">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white text-xs outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs"
        >
          Add
        </button>
      </form>

      <div className="flex-1 overflow-auto space-y-1">
        {todos.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] group"
          >
            <input
              type="checkbox"
              checked={t.done}
              onChange={(e) => toggleTodo(t.id, e.target.checked)}
              className="accent-indigo-500"
            />
            <span
              className={`flex-1 text-xs ${t.done ? "line-through text-gray-600" : "text-gray-200"}`}
            >
              {t.text}
            </span>
            <button
              onClick={() => deleteTodo(t.id)}
              className="text-gray-700 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ))}
        {todos.length === 0 && (
          <p className="text-gray-600 text-xs text-center mt-6">No tasks yet</p>
        )}
      </div>
    </div>
  );
}