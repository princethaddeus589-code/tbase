import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { downloadTrack } from "../api";
export default function TrackRow({ t, i, list }) {
  const { track, playing, play, toggle } = usePlayer();
  const [busy, setBusy] = useState(false);
  const active = track?.id === t.id;
  const dl = async () => { setBusy(true); try { await downloadTrack(t); } catch (e) { alert(e.message); } setBusy(false); };
  return (
    <div className={"row" + (active ? " active" : "")}>
      <img src={t.image} alt="" onClick={() => (active ? toggle() : play(list, i))} />
      <div className="meta"><strong>{t.title}</strong><span>{t.artist}</span></div>
      <button className="ghost" onClick={() => (active ? toggle() : play(list, i))}>{active && playing ? "Pause" : "Play"}</button>
      <button className="ghost" disabled={!t.downloadable || busy} onClick={dl}>{busy ? "Saving…" : "Download"}</button>
    </div>
  );
}
