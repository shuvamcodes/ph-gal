import { useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { stripExifFromImage } from "../utils/stripExif.js";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(file, resourceType) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) throw new Error("Cloudinary upload failed");
  return response.json();
}

export default function UploadForm({ vaultId, folderId, onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function uploadFiles(fileList) {
    const files = Array.from(fileList).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const isVideo = file.type.startsWith("video/");
        let fileToUpload = file;

        if (!isVideo) {
          try {
            fileToUpload = await stripExifFromImage(file);
          } catch {
            fileToUpload = file; // fall back rather than block the upload
          }
        }

        const result = await uploadToCloudinary(
          fileToUpload,
          isVideo ? "video" : "image"
        );

        const docRef = await addDoc(collection(db, "photos"), {
          vaultId,
          folderId: folderId || null,
          name: file.name,
          url: result.secure_url,
          publicId: result.public_id,
          type: isVideo ? "video" : "image",
          createdAt: serverTimestamp()
        });
        onUploaded?.(docRef.id);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        uploadFiles(e.dataTransfer.files);
      }}
      className={`border border-dashed rounded-2xl p-8 text-center mb-8 backdrop-blur-xl transition-all ${
        dragOver
          ? "border-indigo-400 bg-indigo-500/10 scale-[1.01]"
          : "border-white/15 bg-white/[0.02]"
      }`}
    >
      <p className="text-gray-500 text-sm mb-3">
        Drag & drop photos or videos here, or
      </p>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white text-sm font-medium transition shadow-[0_0_20px_rgba(99,102,241,0.35)]"
      >
        {uploading ? "Uploading..." : "Choose Files"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => uploadFiles(e.target.files)}
      />
    </div>
  );
}