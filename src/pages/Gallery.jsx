import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { useOnlineStatus } from "../hooks/useOnlineStatus.js";
import FolderList from "../components/FolderList.jsx";
import PhotoGrid from "../components/PhotoGrid.jsx";
import PhotoModal from "../components/PhotoModal.jsx";
import UploadForm from "../components/UploadForm.jsx";
import NewFolderModal from "../components/NewFolderModal.jsx";
import Toast from "../components/Toast.jsx";

export default function Gallery({ vaultId, label, onLock }) {
  const isOnline = useOnlineStatus();

  const [path, setPath] = useState([]);
  const currentFolderId = path.length ? path[path.length - 1].id : null;

  const [folders, setFolders] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showNewFolder, setShowNewFolder] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [toasts, setToasts] = useState([]);
  const knownPhotoIdsRef = useRef(null);
  const myUploadIdsRef = useRef(new Set());

  useEffect(() => {
    const q = query(
      collection(db, "folders"),
      where("vaultId", "==", vaultId),
      where("parentId", "==", currentFolderId)
    );
    const unsub = onSnapshot(q, (snap) => {
      setFolders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [vaultId, currentFolderId]);

  useEffect(() => {
    knownPhotoIdsRef.current = null;

    const q = query(
      collection(db, "photos"),
      where("vaultId", "==", vaultId),
      where("folderId", "==", currentFolderId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const incoming = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const incomingIds = new Set(incoming.map((p) => p.id));

      if (knownPhotoIdsRef.current !== null) {
        const newIds = [...incomingIds].filter(
          (id) => !knownPhotoIdsRef.current.has(id) && !myUploadIdsRef.current.has(id)
        );
        if (newIds.length > 0) {
          const message =
            newIds.length === 1
              ? "1 new photo synced from another device"
              : `${newIds.length} new photos synced from another device`;
          const toastId = Date.now();
          setToasts((prev) => [...prev, { id: toastId, message }]);
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toastId));
          }, 6000);
        }
      }

      knownPhotoIdsRef.current = incomingIds;
      setPhotos(incoming);
    });
    return unsub;
  }, [vaultId, currentFolderId]);

  useEffect(() => {
    setSearchQuery("");
    setSelectMode(false);
    setSelectedIds(new Set());
  }, [currentFolderId]);

  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) return photos;
    const q = searchQuery.trim().toLowerCase();
    return photos.filter((p) => p.name.toLowerCase().includes(q));
  }, [photos, searchQuery]);

  function handleUploaded(photoId) {
    myUploadIdsRef.current.add(photoId);
  }

  async function handleCreateFolder(name) {
    await addDoc(collection(db, "folders"), {
      vaultId,
      name,
      parentId: currentFolderId,
      createdAt: serverTimestamp()
    });
  }

  async function handleRenameFolder(folder, newName) {
    await updateDoc(doc(db, "folders", folder.id), { name: newName });
  }

  async function handleDeleteFolder(folder) {
    if (!confirm(`Delete folder "${folder.name}"? Photos inside won't be deleted automatically.`)) return;
    await deleteDoc(doc(db, "folders", folder.id));
  }

  async function handleRenamePhoto(photo, newName) {
    await updateDoc(doc(db, "photos", photo.id), { name: newName });
  }

  async function handleDeletePhoto(photo) {
    if (!confirm("Remove this photo from your gallery?")) return;
    await deleteDoc(doc(db, "photos", photo.id));
    setSelectedIndex(null);
  }

  function toggleSelect(photoId) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  async function handleBulkDelete() {
    if (!confirm(`Remove ${selectedIds.size} photo(s) from your gallery?`)) return;
    await Promise.all(
      Array.from(selectedIds).map((id) => deleteDoc(doc(db, "photos", id)))
    );
    exitSelectMode();
  }

  async function handleBulkDownload() {
    const toDownload = photos.filter((p) => selectedIds.has(p.id));
    for (const photo of toDownload) {
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
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  function dismissToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="min-h-full max-w-6xl mx-auto px-6 py-8">
      <header className="flex items-center justify-between mb-8 backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          {label || "My Gallery"}
        </h1>
        <div className="flex items-center gap-4">
          {!isOnline && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Offline mode
            </span>
          )}
          <button
            onClick={onLock}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Lock
          </button>
        </div>
      </header>

      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
        <button onClick={() => setPath([])} className="hover:text-white transition">
          Home
        </button>
        {path.map((folder, i) => (
          <span key={folder.id} className="flex items-center gap-1.5">
            <span className="text-gray-700">/</span>
            <button
              onClick={() => setPath(path.slice(0, i + 1))}
              className="hover:text-white transition"
            >
              {folder.name}
            </button>
          </span>
        ))}
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <button
          onClick={() => setShowNewFolder(true)}
          className="text-sm px-4 py-2 rounded-xl backdrop-blur-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-200 transition"
        >
          + New Folder
        </button>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search photos..."
            className="w-48 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
          <button
            onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
            className={`text-sm px-4 py-2 rounded-xl border transition ${
              selectMode
                ? "bg-indigo-500/20 border-indigo-400/40 text-indigo-300"
                : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-gray-200"
            }`}
          >
            {selectMode ? "Cancel" : "Select"}
          </button>
        </div>
      </div>

      {selectMode && selectedIds.size > 0 && (
        <div className="flex items-center justify-between mb-5 px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-400/30">
          <span className="text-sm text-indigo-200">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDownload}
              className="text-sm px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white transition"
            >
              Download
            </button>
            <button
              onClick={handleBulkDelete}
              className="text-sm px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <UploadForm vaultId={vaultId} folderId={currentFolderId} onUploaded={handleUploaded} />

      <FolderList
        folders={folders}
        onOpen={(folder) => setPath([...path, folder])}
        onDelete={handleDeleteFolder}
        onRename={handleRenameFolder}
      />

      <PhotoGrid
        photos={filteredPhotos}
        onOpen={(photo) => setSelectedIndex(filteredPhotos.indexOf(photo))}
        selectMode={selectMode}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />

      {selectedIndex !== null && (
        <PhotoModal
          photos={filteredPhotos}
          index={selectedIndex}
          onNavigate={setSelectedIndex}
          onClose={() => setSelectedIndex(null)}
          onDelete={handleDeletePhoto}
          onRename={handleRenamePhoto}
        />
      )}

      {showNewFolder && (
        <NewFolderModal
          onCreate={handleCreateFolder}
          onClose={() => setShowNewFolder(false)}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}