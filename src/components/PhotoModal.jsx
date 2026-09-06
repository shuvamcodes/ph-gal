import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function PhotoModal({ photos, index, onClose, onDelete, onNavigate, onRename }) {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  const photo = photos[index];

  useEffect(() => {
    setZoomed(false);
    setEditingName(false);
  }, [index]);

  useEffect(() => {
    if (!photo) return;

    function handleKeyDown(e) {
      if (editingName) return; // let typing in the rename box work normally

      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          onClose();
        }
      } else if (e.key === "ArrowRight") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      } else if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photo, index, editingName]);

  useEffect(() => {
    function handleFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  if (!photo) return null;

  function goNext() {
    if (index < photos.length - 1) onNavigate(index + 1);
  }

  function goPrev() {
    if (index > 0) onNavigate(index - 1);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  }

  async function handleDownload() {
    const response = await fetch(photo.url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = photo.name || "photo.jpg";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  }

  function startRename() {
    setNameDraft(photo.name);
    setEditingName(true);
  }

  function submitRename(e) {
    e.preventDefault();
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== photo.name) {
      onRename(photo, trimmed);
    }
    setEditingName(false);
  }

  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-sm text-gray-400">
          {index + 1} / {photos.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white text-sm transition"
            title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
          >
            {isFullscreen ? "⤡" : "⤢"}
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white text-lg transition"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-white text-xl transition z-10"
          title="Previous (←)"
        >
          ‹
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-white text-xl transition z-10"
          title="Next (→)"
        >
          ›
        </button>
      )}

      <div
        className="scale-in max-w-full max-h-full flex flex-col items-center px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.url}
          alt={photo.name}
          onClick={() => setZoomed(!zoomed)}
          className={`rounded-2xl shadow-[0_0_60px_rgba(99,102,241,0.15)] transition-transform duration-300 cursor-zoom-in ${
            zoomed
              ? "max-w-none max-h-none scale-150 cursor-zoom-out"
              : "max-h-[75vh] max-w-full object-contain"
          }`}
        />

        <div className="flex items-center gap-2 mt-4">
          {editingName ? (
            <form onSubmit={submitRename} className="flex items-center gap-2">
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={submitRename}
                className="text-sm bg-white/[0.08] border border-indigo-400/50 rounded-lg px-3 py-1 text-white outline-none"
              />
            </form>
          ) : (
            <>
              <span className="text-sm text-gray-400">{photo.name}</span>
              <button
                onClick={startRename}
                className="text-gray-500 hover:text-indigo-300 text-xs"
                title="Rename photo"
              >
                ✎
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition"
          >
            Download
          </button>
          <button
            onClick={() => onDelete(photo)}
            className="px-4 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}