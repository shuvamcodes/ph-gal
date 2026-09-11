import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

// Checks a typed password against both real vault passwords and duress
// passwords. Returns { vault, decoy } where decoy=true means it matched
// a duress word, or null if nothing matched at all.
export async function findUnlockTarget(password) {
  const realQ = query(collection(db, "vaults"), where("password", "==", password));
  const realSnap = await getDocs(realQ);
  if (!realSnap.empty) {
    const d = realSnap.docs[0];
    return { vault: { id: d.id, ...d.data() }, decoy: false };
  }

  const duressQ = query(collection(db, "vaults"), where("duressPassword", "==", password));
  const duressSnap = await getDocs(duressQ);
  if (!duressSnap.empty) {
    const d = duressSnap.docs[0];
    return { vault: { id: d.id, ...d.data() }, decoy: true };
  }

  return null;
}

export function listenToVaults(callback) {
  const q = collection(db, "vaults");
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function createVault(label, password, duressPassword) {
  await addDoc(collection(db, "vaults"), {
    label,
    password,
    duressPassword: duressPassword || null,
    createdAt: serverTimestamp()
  });
}

export async function setVaultDuressPassword(vaultId, duressPassword) {
  await updateDoc(doc(db, "vaults", vaultId), {
    duressPassword: duressPassword || null
  });
}

export async function deleteVault(id) {
  await deleteDoc(doc(db, "vaults", id));
}