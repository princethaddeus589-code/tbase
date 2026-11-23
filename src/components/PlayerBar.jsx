import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { useLibrary } from "../context/LibraryContext";
import Icon from "./Icons";
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
export default function PlayerBar() {
  const { track, playing, time, toggle, next, prev, seek } = usePlayer();
  const { isFav, toggleFav } = useLibrary();
  const [open, setOpen] = useState(false);
  if (!track) return null;
  const stop = (f) => (e) => { e.stopPropagation(); f(); };
  const pct = time.dur ? (time.cur / time.dur) * 100 : 0;
  const fav = isFav(track);
  const range = () => (
    <input className="seekr" type="range" min="0" max={time.dur || 0} value={time.cur} aria-label="Seek"
      onChange={(e) => seek(+e.target.value)} onClick={(e) => e.stopPropagation()} />
  );
  return (
    <>
      <div className="mini" onClick={() => setOpen(true)}>
        <img src={track.image} alt="" />
        <div className="meta"><strong>{track.title}</strong><span>{track.artist}</span></div>
        <button className={"ic" + (fav ? " on" : "")} aria-label="Like" onClick={stop(() => toggleFav(track))}><Icon n="heart" line={!fav} /></button>
        <div className="ctrls">
          <button className="ic desk" aria-label="Previous" onClick={stop(prev)}><Icon n="prev" /></button>
          <button className="ic play" aria-label={playing ? "Pause" : "Play"} onClick={stop(toggle)}><Icon n={playing ? "pause" : "play"} s={26} /></button>
          <button className="ic desk" aria-label="Next" onClick={stop(next)}><Icon n="next" /></button>
          <span className="desk time">{fmt(time.cur)}</span>{range()}<span className="desk time">{fmt(time.dur)}</span>
        </div>
        <div className="bar"><i style={{ width: pct + "%" }} /></div>
      </div>
      {open && (
        <div className="full">
          <button className="ic" aria-label="Close player" onClick={() => setOpen(false)}><Icon n="down" /></button>
          <img className="art" src={track.image} alt="" />
          <div className="fmeta">
            <div><h2>{track.title}</h2><span>{track.artist}</span></div>
            <button className={"ic" + (fav ? " on" : "")} aria-label="Like" onClick={() => toggleFav(track)}><Icon n="heart" line={!fav} s={26} /></button>
          </div>
          {range()}
          <div className="times"><span>{fmt(time.cur)}</span><span>{fmt(time.dur)}</span></div>
          <div className="fctrl">
            <button className="ic" aria-label="Previous" onClick={prev}><Icon n="prev" s={32} /></button>
            <button className="ic play big" aria-label={playing ? "Pause" : "Play"} onClick={toggle}><Icon n={playing ? "pause" : "play"} s={34} /></button>
            <button className="ic" aria-label="Next" onClick={next}><Icon n="next" s={32} /></button>
          </div>
        </div>
      )}
    </>
  );
}
