import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { useLibrary } from "../context/LibraryContext";
import { downloadTrack } from "../api";
export default function TrackRow({ t, i, list, onRemove }) {
  const { track, playing, play, toggle } = usePlayer();
  const { isFav, toggleFav, playlists, addToPlaylist } = useLibrary();
  const [busy, setBusy] = useState(false);
  const active = track?.id === t.id;
  const go = () => (active ? toggle() : play(list, i));
  const dl = async () => { setBusy(true); try { await downloadTrack(t); } catch (e) { alert(e.message); } setBusy(false); };
  return (
    <div className={"row" + (active ? " active" : "")}>
      <img src={t.image} alt="" onClick={go} />
      <div className="meta"><strong>{t.title}</strong><span>{t.artist}</span></div>
      <button className="ghost" onClick={go}>{active && playing ? "Pause" : "Play"}</button>
      <button className="ghost" onClick={() => toggleFav(t)}>{isFav(t) ? "Saved" : "Save"}</button>
      {playlists.length > 0 && (
        <select className="pick" value="" onChange={(e) => e.target.value && addToPlaylist(e.target.value, t)}>
          <option value="">Add to playlist</option>
          {playlists.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      )}
      {t.downloadable && <button className="ghost" disabled={busy} onClick={dl}>{busy ? "Saving…" : "Download"}</button>}
      {onRemove && <button className="ghost" onClick={onRemove}>Remove</button>}
    </div>
  );
}
