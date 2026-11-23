import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { useLibrary } from "../context/LibraryContext";
import { downloadTrack } from "../api";
import Icon from "./Icons";
export default function TrackRow({ t, i, list, onRemove }) {
  const { track, play, toggle } = usePlayer();
  const { isFav, toggleFav, playlists, addToPlaylist } = useLibrary();
  const [menu, setMenu] = useState(false);
  const active = track?.id === t.id;
  const go = () => (active ? toggle() : play(list, i));
  const dl = async () => { setMenu(false); try { await downloadTrack(t); } catch (e) { alert(e.message); } };
  const fav = isFav(t);
  return (
    <>
      <div className={"row" + (active ? " active" : "")} onClick={go}>
        <img src={t.image} alt="" loading="lazy" />
        <div className="meta"><strong>{t.title}</strong><span>{t.artist}</span></div>
        <button className={"ic" + (fav ? " on" : "")} aria-label="Like" onClick={(e) => { e.stopPropagation(); toggleFav(t); }}><Icon n="heart" line={!fav} /></button>
        <button className="ic" aria-label="More options" onClick={(e) => { e.stopPropagation(); setMenu(true); }}><Icon n="more" /></button>
      </div>
      {menu && (
        <div className="backdrop" onClick={() => setMenu(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="row"><img src={t.image} alt="" /><div className="meta"><strong>{t.title}</strong><span>{t.artist}</span></div></div>
            {playlists.map((p) => <button key={p.id} onClick={() => { addToPlaylist(p.id, t); setMenu(false); }}>Add to {p.name}</button>)}
            {playlists.length === 0 && <p className="note">Create a playlist in Your Library to add songs.</p>}
            {t.downloadable && <button onClick={dl}>Download</button>}
            {onRemove && <button onClick={() => { onRemove(); setMenu(false); }}>Remove from this playlist</button>}
          </div>
        </div>
      )}
    </>
  );
}
