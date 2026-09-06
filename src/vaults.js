import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

export async function findVaultByPassword(password) {
  const q = query(
    collection(db, "vaults"),
    where("password", "==", password)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export function listenToVaults(callback) {
  const q = collection(db, "vaults");
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function createVault(label, password) {
  await addDoc(collection(db, "vaults"), {
    label,
    password,
    createdAt: serverTimestamp()
  });
}

export async function deleteVault(id) {
  await deleteDoc(doc(db, "vaults", id));
}