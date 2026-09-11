import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { BURN_LINK_EXPIRY_MS } from "./config.js";

export async function createBurnLink(photo) {
  const docRef = await addDoc(collection(db, "burnLinks"), {
    url: photo.url,
    name: photo.name,
    type: photo.type || "image",
    createdAt: serverTimestamp(),
    expiresAt: Date.now() + BURN_LINK_EXPIRY_MS,
    viewed: false
  });
  return docRef.id;
}

export async function fetchAndConsumeBurnLink(id) {
  const ref = doc(db, "burnLinks", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { status: "not_found" };

  const data = snap.data();

  if (data.viewed) return { status: "already_viewed" };
  if (data.expiresAt && Date.now() > data.expiresAt) return { status: "expired" };

  await updateDoc(ref, { viewed: true });
  return { status: "ok", photo: data };
}