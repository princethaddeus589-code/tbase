import { auth } from "./firebase";
const BASE = import.meta.env.VITE_API_URL || "";
export async function fetchTracks({ tag = "", q = "" } = {}) {
  const p = new URLSearchParams({ tag, q });
  const r = await fetch(`${BASE}/api/tracks?${p}`);
  if (!r.ok) throw new Error("Could not load music");
  return r.json();
}
export async function downloadTrack(track) {
  const token = await auth.currentUser.getIdToken();
  const r = await fetch(`${BASE}/api/download/${track.id}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error("This track cannot be downloaded");
  const url = URL.createObjectURL(await r.blob());
  const a = Object.assign(document.createElement("a"), { href: url, download: `${track.artist} - ${track.title}.mp3` });
  a.click(); URL.revokeObjectURL(url);
}
