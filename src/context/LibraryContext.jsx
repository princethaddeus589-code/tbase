import { createContext, useContext, useEffect, useState } from "react";
import { collection, doc, setDoc, deleteDoc, onSnapshot, addDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
const Ctx = createContext();
export const useLibrary = () => useContext(Ctx);
const slim = (t) => ({ id: t.id, title: t.title, artist: t.artist, image: t.image || "", audio: t.audio, downloadable: !!t.downloadable, source: t.source || "jamendo" });

export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const [favs, setFavs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  useEffect(() => {
    if (!user) { setFavs([]); setPlaylists([]); return; }
    const base = `users/${user.uid}`;
    const a = onSnapshot(collection(db, base, "favorites"), (s) => setFavs(s.docs.map((d) => d.data())));
    const b = onSnapshot(collection(db, base, "playlists"), (s) => setPlaylists(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => { a(); b(); };
  }, [user]);
  const base = `users/${user?.uid}`;
  const isFav = (t) => favs.some((f) => f.id === t.id);
  const value = {
    favs, playlists, isFav,
    toggleFav: (t) => (isFav(t) ? deleteDoc(doc(db, `${base}/favorites/${t.id}`)) : setDoc(doc(db, `${base}/favorites/${t.id}`), slim(t))),
    createPlaylist: (name) => addDoc(collection(db, `${base}/playlists`), { name, tracks: [] }),
    deletePlaylist: (pid) => deleteDoc(doc(db, `${base}/playlists/${pid}`)),
    addToPlaylist: (pid, t) => updateDoc(doc(db, `${base}/playlists/${pid}`), { tracks: arrayUnion(slim(t)) }),
    removeFromPlaylist: (pid, t) => updateDoc(doc(db, `${base}/playlists/${pid}`), { tracks: arrayRemove(slim(t)) }),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
