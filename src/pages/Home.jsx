import { useEffect, useState } from "react";
import { fetchTracks } from "../api";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import TrackRow from "../components/TrackRow";
const GENRES = ["trending", "pop", "rock", "hiphop", "electronic", "jazz", "classical", "reggae", "afrobeat", "lofi", "country", "metal"];
export default function Home() {
  const { user, logout } = useAuth();
  const { favs, playlists, createPlaylist, deletePlaylist, removeFromPlaylist } = useLibrary();
  const [view, setView] = useState("discover");
  const [source, setSource] = useState("jamendo");
  const [tag, setTag] = useState("trending");
  const [q, setQ] = useState("");
  const [tracks, setTracks] = useState([]);
  const [state, setState] = useState("loading");
  const [open, setOpen] = useState(null);
  const [name, setName] = useState("");
  useEffect(() => {
    if (view !== "discover") return;
    setState("loading");
    const t = setTimeout(() => fetchTracks({ source, tag: tag === "trending" ? "" : tag, q })
      .then((d) => { setTracks(d); setState(d.length ? "ok" : "empty"); }).catch(() => setState("error")), 300);
    return () => clearTimeout(t);
  }, [view, source, tag, q]);
  const pl = playlists.find((p) => p.id === open);
  const rows = (list, rm) => list.map((t, i) => <TrackRow key={t.id} t={t} i={i} list={list} onRemove={rm && (() => rm(t))} />);
  return (
    <div className="shell">
      <header>
        <div className="logo"><b>T</b> base</div>
        {view === "discover" && <input className="search" placeholder="Search songs or artists" value={q} onChange={(e) => setQ(e.target.value)} />}
        <button className="ghost" onClick={logout}>{user.displayName || user.email.split("@")[0]} · Log out</button>
      </header>
      <nav className="tabs">
        {[["discover", "Discover"], ["favs", "Favorites"], ["lists", "Playlists"]].map(([k, l]) =>
          <button key={k} className={view === k ? "on" : ""} onClick={() => setView(k)}>{l}</button>)}
      </nav>
      {view === "discover" && <>
        <nav className="tabs">
          <button className={source === "jamendo" ? "on" : ""} onClick={() => setSource("jamendo")}>Jamendo (downloads)</button>
          <button className={source === "audius" ? "on" : ""} onClick={() => setSource("audius")}>Audius (new artists)</button>
        </nav>
        <nav className="chips">{GENRES.map((g) => <button key={g} className={g === tag ? "on" : ""} onClick={() => setTag(g)}>{g}</button>)}</nav>
        <section className="list">
          {state === "loading" && <p className="note">Loading music…</p>}
          {state === "error" && <p className="note">Could not reach the server. Check that it is running.</p>}
          {state === "empty" && <p className="note">Nothing found. Try another genre or search.</p>}
          {state === "ok" && rows(tracks)}
        </section>
      </>}
      {view === "favs" && <section className="list">
        {favs.length ? rows(favs) : <p className="note">No favorites yet. Tap Save on any song.</p>}
      </section>}
      {view === "lists" && <section className="list">
        {!pl && <>
          <div className="newlist"><input placeholder="New playlist name" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="primary" onClick={() => { if (name.trim()) { createPlaylist(name.trim()); setName(""); } }}>Create</button></div>
          {playlists.length === 0 && <p className="note">Create your first playlist above.</p>}
          {playlists.map((p) => <div key={p.id} className="row"><div className="meta"><strong>{p.name}</strong><span>{p.tracks.length} songs</span></div>
            <button className="ghost" onClick={() => setOpen(p.id)}>Open</button>
            <button className="ghost" onClick={() => confirm("Delete this playlist?") && deletePlaylist(p.id)}>Delete</button></div>)}
        </>}
        {pl && <>
          <button className="ghost" onClick={() => setOpen(null)}>Back to playlists</button>
          <h2 className="plname">{pl.name}</h2>
          {pl.tracks.length ? rows(pl.tracks, (t) => removeFromPlaylist(pl.id, t)) : <p className="note">Empty. Use Add to playlist on any song.</p>}
        </>}
      </section>}
    </div>
  );
}
