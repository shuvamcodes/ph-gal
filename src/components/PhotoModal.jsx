import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createBurnLink } from "../burnLinks.js";

const SLIDESHOW_INTERVAL_MS = 4000;
const MIN_SCALE = 1;
const MAX_SCALE = 4;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export default function PhotoModal({ photos, index, onClose, onDelete, onNavigate, onRename }) {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [slideshowOn, setSlideshowOn] = useState(false);
  const [shareState, setShareState] = useState("idle");

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const activePointersRef = useRef(new Map());
  const pointerDownPosRef = useRef(null);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const pinchStartDistRef = useRef(null);
  const pinchStartScaleRef = useRef(1);

  const photo = photos[index];
  const isVideo = photo?.type === "video";

  useEffect(() => {
    setEditingName(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [index]);

  useEffect(() => {
    if (!slideshowOn) return;

    const timer = setTimeout(() => {
      if (index < photos.length - 1) {
        onNavigate(index + 1);
      } else {
        setSlideshowOn(false);
      }
    }, SLIDESHOW_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [slideshowOn, index, photos.length, onNavigate]);

  useEffect(() => {
    if (!photo) return;

    function handleKeyDown(e) {
      if (editingName) return;

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
      } else if (e.key === " ") {
        e.preventDefault();
        setSlideshowOn((s) => !s);
      } else if (e.key === "+" || e.key === "=") {
        zoomIn();
      } else if (e.key === "-") {
        zoomOut();
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

  function zoomIn() {
    setScale((s) => clamp(s + 0.5, MIN_SCALE, MAX_SCALE));
  }

  function zoomOut() {
    setScale((s) => {
      const next = clamp(s - 0.5, MIN_SCALE, MAX_SCALE);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }

  function resetZoom() {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }

  function handleWheel(e) {
    if (isVideo) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setScale((s) => {
      const next = clamp(s + delta, MIN_SCALE, MAX_SCALE);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }

  function handlePointerDown(e) {
    if (isVideo) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);

    if (activePointersRef.current.size === 1) {
      pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      if (scale > 1) setIsDragging(true);
    } else if (activePointersRef.current.size === 2) {
      const pts = Array.from(activePointersRef.current.values());
      pinchStartDistRef.current = distanceBetween(pts[0], pts[1]);
      pinchStartScaleRef.current = scale;
      setIsDragging(false);
    }
  }

  function handlePointerMove(e) {
    if (isVideo || !activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 2) {
      const pts = Array.from(activePointersRef.current.values());
      const dist = distanceBetween(pts[0], pts[1]);
      if (pinchStartDistRef.current) {
        const factor = dist / pinchStartDistRef.current;
        const next = clamp(pinchStartScaleRef.current * factor, MIN_SCALE, MAX_SCALE);
        setScale(next);
        if (next === 1) setPosition({ x: 0, y: 0 });
      }
    } else if (activePointersRef.current.size === 1 && isDragging) {
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      setPosition((p) => ({ x: p.x + dx, y: p.y + dy }));
    }
  }

  function handlePointerUp(e) {
    if (isVideo) return;
    activePointersRef.current.delete(e.pointerId);

    if (activePointersRef.current.size < 2) {
      pinchStartDistRef.current = null;
    }

    if (activePointersRef.current.size === 0) {
      setIsDragging(false);

      if (pointerDownPosRef.current) {
        const dx = Math.abs(e.clientX - pointerDownPosRef.current.x);
        const dy = Math.abs(e.clientY - pointerDownPosRef.current.y);
        if (dx < 6 && dy < 6) {
          // Treated as a tap/click, not a drag
          if (scale > 1) {
            resetZoom();
          } else {
            setScale(2);
          }
        }
      }
      pointerDownPosRef.current = null;
    }
  }

  async function handleDownload() {
    const response = await fetch(photo.url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = photo.name || (isVideo ? "video.mp4" : "photo.jpg");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  }

  async function handleShare() {
    setShareState("creating");
    try {
      const id = await createBurnLink(photo);
      const link = `${window.location.origin}${window.location.pathname}?burn=${id}`;
      await navigator.clipboard.writeText(link);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2500);
    } catch {
      setShareState("idle");
    }
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
          {!isVideo && (
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={zoomOut}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white text-sm transition"
                title="Zoom out (-)"
              >
                −
              </button>
              <button
                onClick={resetZoom}
                className="px-2 h-9 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs transition"
                title="Reset zoom"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={zoomIn}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white text-sm transition"
                title="Zoom in (+)"
              >
                +
              </button>
            </div>
          )}

          <button
            onClick={() => setSlideshowOn((s) => !s)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white text-sm transition"
            title={slideshowOn ? "Pause slideshow (space)" : "Play slideshow (space)"}
          >
            {slideshowOn ? "⏸" : "▶"}
          </button>
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
        {isVideo ? (
          <video
            src={photo.url}
            controls
            className="rounded-2xl shadow-[0_0_60px_rgba(99,102,241,0.15)] max-h-[75vh] max-w-full"
          />
        ) : (
          <div
            className="overflow-hidden max-h-[75vh] max-w-full flex items-center justify-center"
            style={{ touchAction: "none" }}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <img
              src={photo.url}
              alt={photo.name}
              draggable={false}
              className="rounded-2xl shadow-[0_0_60px_rgba(99,102,241,0.15)] max-h-[75vh] max-w-full object-contain select-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? "none" : "transform 0.15s ease-out",
                cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in"
              }}
            />
          </div>
        )}

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
                title="Rename"
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
            onClick={handleShare}
            disabled={shareState === "creating"}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-sm transition disabled:opacity-50"
          >
            {shareState === "creating"
              ? "Creating link..."
              : shareState === "copied"
              ? "Link copied!"
              : "Share (one-time)"}
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