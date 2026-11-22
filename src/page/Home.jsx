import { useEffect, useState } from "react";
import { fetchTracks } from "../api";
import { useAuth } from "../context/AuthContext";
import TrackRow from "../components/TrackRow";
const GENRES = ["trending", "pop", "rock", "hiphop", "electronic", "jazz", "classical", "reggae", "afrobeat", "lofi", "country", "metal"];
export default function Home() {
  const { user, logout } = useAuth();
  const [tag, setTag] = useState("trending");
  const [q, setQ] = useState("");
  const [tracks, setTracks] = useState([]);
  const [state, setState] = useState("loading");
  useEffect(() => {
    setState("loading");
    const t = setTimeout(() => fetchTracks({ tag: tag === "trending" ? "" : tag, q })
      .then((d) => { setTracks(d); setState(d.length ? "ok" : "empty"); }).catch(() => setState("error")), 300);
    return () => clearTimeout(t);
  }, [tag, q]);
  return (
    <div className="shell">
      <header>
        <div className="logo"><b>T</b> base</div>
        <input className="search" placeholder="Search songs or artists" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="ghost" onClick={logout}>{user.displayName || user.email.split("@")[0]} · Log out</button>
      </header>
      <nav className="chips">{GENRES.map((g) => <button key={g} className={g === tag ? "on" : ""} onClick={() => setTag(g)}>{g}</button>)}</nav>
      <section className="list">
        {state === "loading" && <p className="note">Loading music…</p>}
        {state === "error" && <p className="note">Could not reach the server. Check that it is running.</p>}
        {state === "empty" && <p className="note">Nothing found. Try another genre or search.</p>}
        {state === "ok" && tracks.map((t, i) => <TrackRow key={t.id} t={t} i={i} list={tracks} />)}
      </section>
    </div>
  );
}
