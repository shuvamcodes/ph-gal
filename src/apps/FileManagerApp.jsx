import { useEffect, useState } from "react";
import {
  listenToFileFolders,
  createFileFolder,
  deleteFileFolder,
  listenToFiles,
  createFile,
  trashFile
} from "../firestoreFiles.js";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

async function uploadAnyFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  const response = await fetch(
    "https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/auto/upload",
    { method: "POST", body: formData }
  );
  if (!response.ok) throw new Error("Upload failed");
  return response.json();
}

function openFileInNewTab(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function FileManagerApp() {
  const [path, setPath] = useState([]);
  const currentFolderId = path.length ? path[path.length - 1].id : null;

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(function () {
    const unsub = listenToFileFolders(currentFolderId, setFolders);
    return unsub;
  }, [currentFolderId]);

  useEffect(function () {
    const unsub = listenToFiles(currentFolderId, setFiles);
    return unsub;
  }, [currentFolderId]);

  async function handleNewFolder() {
    const name = prompt("Folder name:");
    if (name && name.trim()) {
      await createFileFolder(name.trim(), currentFolderId);
    }
  }

  async function handleUpload(e) {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const result = await uploadAnyFile(file);
        await createFile({
          folderId: currentFolderId,
          name: file.name,
          url: result.secure_url,
          publicId: result.public_id,
          size: file.size
        });
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function goHome() {
    setPath([]);
  }

  function goToCrumb(index) {
    setPath(path.slice(0, index + 1));
  }

  function openFolder(folder) {
    setPath(path.concat([folder]));
  }

  function handleDeleteFolder(e, folderId) {
    e.stopPropagation();
    deleteFileFolder(folderId);
  }

  function handleTrashFile(fileId) {
    trashFile(fileId);
  }

  const isEmpty = folders.length === 0 && files.length === 0;

  return (
    <div className="p-4 h-full flex flex-col text-sm">
      <nav className="flex items-center gap-1 text-xs text-gray-500 mb-3 flex-wrap">
        <button onClick={goHome} className="hover:text-white">
          Home
        </button>
        {path.map(function (f, i) {
          return (
            <span key={f.id} className="flex items-center gap-1">
              <span>/</span>
              <button onClick={function () { goToCrumb(i); }} className="hover:text-white">
                {f.name}
              </button>
            </span>
          );
        })}
      </nav>

      <div className="flex gap-2 mb-3">
        <button
          onClick={handleNewFolder}
          className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-gray-200 text-xs"
        >
          + Folder
        </button>
        <label className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs cursor-pointer">
          {uploading ? "Uploading..." : "+ Upload"}
          <input type="file" multiple hidden onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="flex-1 overflow-auto space-y-1">
        {folders.map(function (folder) {
          return (
            <div
              key={folder.id}
              className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/[0.04] group cursor-pointer"
              onClick={function () { openFolder(folder); }}
            >
              <span className="text-gray-200 text-xs flex items-center gap-2">
                {"\uD83D\uDCC1"} {folder.name}
              </span>
              <button
                onClick={function (e) { handleDeleteFolder(e, folder.id); }}
                className="text-gray-700 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition"
              >
                {"\u2715"}
              </button>
            </div>
          );
        })}

        {files.map(function (file) {
          return (
            <div
              key={file.id}
              className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/[0.04] group"
            >
              <button
                onClick={function () { openFileInNewTab(file.url); }}
                className="text-gray-300 text-xs flex items-center gap-2 truncate hover:text-indigo-300 text-left flex-1"
              >
                {"\uD83D\uDCC4"} {file.name}
              </button>
              <button
                onClick={function () { handleTrashFile(file.id); }}
                className="text-gray-700 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition"
              >
                {"\u2715"}
              </button>
            </div>
          );
        })}

        {isEmpty && (
          <p className="text-gray-600 text-xs text-center mt-8">Empty folder</p>
        )}
      </div>
    </div>
  );
}