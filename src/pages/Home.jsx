import { useEffect, useState } from "react";
import { fetchTracks } from "../api";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { usePlayer } from "../context/PlayerContext";
import TrackRow from "../components/TrackRow";
import Icon from "../components/Icons";

const CHIPS = ["All", "Pop", "Hip-hop", "Afrobeat", "Electronic", "Rock", "Jazz", "Lo-fi", "Classical", "Reggae", "Country", "Metal"];
const tagOf = (c) => (c === "All" ? "" : { "Hip-hop": "hiphop", "Lo-fi": "lofi" }[c] || c.toLowerCase());

function useTracks(tag, q, on) {
  const [tracks, setTracks] = useState([]);
  const [state, setState] = useState("loading");
  useEffect(() => {
    if (!on) return;
    setState("loading");
    const t = setTimeout(() => fetchTracks({ tag, q })
      .then((d) => { setTracks(d); setState(d.length ? "ok" : "empty"); }).catch(() => setState("error")), 300);
    return () => clearTimeout(t);
  }, [tag, q, on]);
  return [tracks, state];
}

function Avatar({ user, onClick }) {
  const letter = (user.displayName || user.email || "T")[0].toUpperCase();
  return (
    <button className="avatar" onClick={onClick} aria-label="Open menu">
      {user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : letter}
    </button>
  );
}

export default function Home() {
  const { user, logout } = useAuth();
  const { favs, playlists, createPlaylist, deletePlaylist, removeFromPlaylist } = useLibrary();
  const { track, play } = usePlayer();
  const [view, setView] = useState("home");
  const [chip, setChip] = useState("All");
  const [q, setQ] = useState("");
  const [lib, setLib] = useState(null);
  const [menu, setMenu] = useState(false);
  const [name, setName] = useState("");
  const rkey = `tbase_recents_${user.uid}`;
  const [recents, setRecents] = useState(() => { try { return JSON.parse(localStorage.getItem(rkey) || "[]"); } catch { return []; } });
  const [feed, feedState] = useTracks(tagOf(chip), "", view === "home");
  const [found, foundState] = useTracks("", q.trim(), view === "search" && q.trim().length > 0);

  useEffect(() => {
    if (!track) return;
    setRecents((r) => {
      const n = [track, ...r.filter((x) => x.id !== track.id)].slice(0, 30);
      try { localStorage.setItem(rkey, JSON.stringify(n)); } catch {}
      return n;
    });
  }, [track?.id]);

  const rows = (list, rm) => list.map((t, i) => <TrackRow key={t.id} t={t} i={i} list={list} onRemove={rm && (() => rm(t))} />);
  const status = (s) => s === "loading" ? <p className="note">Loading music…</p>
    : s === "error" ? <p className="note">Could not load music. Check your connection and try again.</p>
    : s === "empty" ? <p className="note">Nothing found here yet.</p> : null;
  const nav = (v) => { setView(v); setLib(null); setMenu(false); };
  const openLib = (l) => { setView("library"); setLib(l); setMenu(false); };
  const pl = playlists.find((p) => p.id === lib);
  const titles = { search: "Search", library: "Your Library", recents: "Recently played" };

  return (
    <div className="app">
      <nav className="nav">
        <div className="logo brand"><b>T</b> base</div>
        {[["home", "Home"], ["search", "Search"], ["library", "Your Library"]].map(([k, l]) => (
          <button key={k} className={view === k ? "on" : ""} onClick={() => nav(k)}>
            <Icon n={k} line={view !== k} /><span>{l}</span>
          </button>
        ))}
      </nav>

      <header className="top">
        <Avatar user={user} onClick={() => setMenu(true)} />
        {view === "home"
          ? <nav className="chips">{CHIPS.map((c) => <button key={c} className={"chip" + (c === chip ? " on" : "")} onClick={() => setChip(c)}>{c}</button>)}</nav>
          : <b className="title">{titles[view]}</b>}
      </header>

      <main className="page">
        {view === "home" && <>
          <div className="tiles">
            <button className="tile" onClick={() => openLib("liked")}><span className="tile-art liked"><Icon n="heart" /></span><b>Liked Songs</b></button>
            {playlists.slice(0, 5).map((p) => (
              <button key={p.id} className="tile" onClick={() => openLib(p.id)}><span className="tile-art">{p.name[0]?.toUpperCase()}</span><b>{p.name}</b></button>
            ))}
          </div>
          {status(feedState)}
          {feedState === "ok" && <>
            <h3>Trending now</h3>
            <div className="cards">
              {feed.slice(0, 10).map((t, i) => (
                <button key={t.id} className="pcard" onClick={() => play(feed, i)}>
                  <img src={t.image} alt="" loading="lazy" /><b>{t.title}</b><span>{t.artist}</span>
                </button>
              ))}
            </div>
            <h3>Popular songs</h3>
            {rows(feed.slice(10))}
          </>}
        </>}

        {view === "search" && <>
          <div className="searchbox">
            <Icon n="search" s={20} />
            <input autoFocus placeholder="What do you want to listen to?" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {q.trim() ? <>{status(foundState)}{foundState === "ok" && rows(found)}</> : <>
            <h3>Browse all</h3>
            <div className="genres">
              {CHIPS.slice(1).map((c, i) => (
                <button key={c} className="gtile" style={{ background: `hsl(${i * 33} 50% 36%)` }} onClick={() => { setChip(c); nav("home"); }}>{c}</button>
              ))}
            </div>
          </>}
        </>}

        {view === "library" && !lib && <>
          <div className="newlist">
            <input placeholder="New playlist name" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="primary" onClick={() => { if (name.trim()) { createPlaylist(name.trim()); setName(""); } }}>Create</button>
          </div>
          <button className="lrow" onClick={() => setLib("liked")}>
            <span className="tile-art liked"><Icon n="heart" /></span><div className="meta"><strong>Liked Songs</strong><span>{favs.length} songs</span></div>
          </button>
          {playlists.map((p) => (
            <div key={p.id} className="lrow">
              <button className="lrow-main" onClick={() => setLib(p.id)}>
                <span className="tile-art">{p.name[0]?.toUpperCase()}</span><div className="meta"><strong>{p.name}</strong><span>{p.tracks.length} songs</span></div>
              </button>
              <button className="ghost" onClick={() => confirm("Delete this playlist?") && deletePlaylist(p.id)}>Delete</button>
            </div>
          ))}
        </>}
        {view === "library" && lib === "liked" && <>
          <button className="ghost" onClick={() => setLib(null)}>Back</button>
          <h3>Liked Songs</h3>
          {favs.length ? rows(favs) : <p className="note">Tap the heart on any song to save it here.</p>}
        </>}
        {view === "library" && pl && <>
          <button className="ghost" onClick={() => setLib(null)}>Back</button>
          <h3>{pl.name}</h3>
          {pl.tracks.length ? rows(pl.tracks, (t) => removeFromPlaylist(pl.id, t)) : <p className="note">Empty. Use the ⋯ menu on any song to add it.</p>}
        </>}

        {view === "recents" && (recents.length ? rows(recents) : <p className="note">Songs you play will show up here.</p>)}
      </main>

      {menu && (
        <div className="backdrop left" onClick={() => setMenu(false)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="who">
              <Avatar user={user} onClick={() => {}} />
              <div className="meta"><strong>{user.displayName || "Your account"}</strong><span>{user.email}</span></div>
            </div>
            <button onClick={() => nav("recents")}>Recently played</button>
            <button onClick={() => openLib("liked")}>Liked songs</button>
            <button onClick={() => { setMenu(false); logout(); }}>Log out</button>
          </aside>
        </div>
      )}
    </div>
  );
}
