import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

// ---- File Manager folders ----
export function listenToFileFolders(parentId, callback) {
  const q = query(collection(db, "fileFolders"), where("parentId", "==", parentId));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}
export async function createFileFolder(name, parentId) {
  await addDoc(collection(db, "fileFolders"), { name, parentId, createdAt: serverTimestamp() });
}
export async function deleteFileFolder(id) {
  await deleteDoc(doc(db, "fileFolders", id));
}

// ---- File Manager files ----
export function listenToFiles(folderId, callback) {
  const q = query(collection(db, "files"), where("folderId", "==", folderId));
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(all.filter((f) => !f.trashed));
  });
}
export async function createFile(fields) {
  await addDoc(collection(db, "files"), { ...fields, trashed: false, createdAt: serverTimestamp() });
}
export async function trashFile(id) {
  await updateDoc(doc(db, "files", id), { trashed: true, trashedAt: serverTimestamp() });
}

// ---- Shared Recycle Bin (Notes, To-Do, Calendar, Files) ----
export async function fetchTrashedItems() {
  const collections = [
    { name: "notes", type: "note", labelField: "title" },
    { name: "todos", type: "todo", labelField: "text" },
    { name: "calendarEvents", type: "event", labelField: "title" },
    { name: "files", type: "file", labelField: "name" }
  ];

  const results = [];
  for (const c of collections) {
    const q = query(collection(db, c.name), where("trashed", "==", true));
    const snap = await getDocs(q);
    snap.docs.forEach((d) => {
      const data = d.data();
      results.push({
        id: d.id,
        collectionName: c.name,
        type: c.type,
        label: data[c.labelField] || "Untitled"
      });
    });
  }
  return results;
}

export async function restoreItem(collectionName, id) {
  await updateDoc(doc(db, collectionName, id), { trashed: false });
}

export async function deleteForever(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id));
}