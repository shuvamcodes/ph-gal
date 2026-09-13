import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

// ---- Notes ----
export function listenToNotes(callback) {
  const q = query(collection(db, "notes"), orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((n) => !n.trashed));
  });
}

export async function createNote() {
  const docRef = await addDoc(collection(db, "notes"), {
    title: "Untitled note",
    content: "",
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}
export async function updateNote(id, fields) {
  await updateDoc(doc(db, "notes", id), { ...fields, updatedAt: serverTimestamp() });
}
export async function deleteNote(id) {
  await updateDoc(doc(db, "notes", id), { trashed: true, trashedAt: serverTimestamp() });
}

// ---- To-do ----
export function listenToTodos(callback) {
  const q = query(collection(db, "todos"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((t) => !t.trashed));
  });
}

export async function addTodo(text) {
  await addDoc(collection(db, "todos"), {
    text,
    done: false,
    createdAt: serverTimestamp()
  });
}
export async function toggleTodo(id, done) {
  await updateDoc(doc(db, "todos", id), { done });
}
export async function deleteTodo(id) {
  await updateDoc(doc(db, "todos", id), { trashed: true, trashedAt: serverTimestamp() });
}

// ---- Calendar events ----
export function listenToEvents(callback) {
  const q = collection(db, "calendarEvents");
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((e) => !e.trashed));
  });
}

export async function addEvent(dateStr, title) {
  await addDoc(collection(db, "calendarEvents"), {
    date: dateStr,
    title,
    createdAt: serverTimestamp()
  });
}
export async function deleteEvent(id) {
  await updateDoc(doc(db, "calendarEvents", id), { trashed: true, trashedAt: serverTimestamp() });
}

// ---- Sticky note widget (single shared note) ----
export function listenToSticky(callback) {
  return onSnapshot(doc(db, "widgetSticky", "main"), (snap) => {
    callback(snap.exists() ? snap.data().text || "" : "");
  });
}
export async function saveSticky(text) {
  await setDoc(doc(db, "widgetSticky", "main"), { text });
}