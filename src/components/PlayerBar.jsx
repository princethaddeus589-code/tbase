import { usePlayer } from "../context/PlayerContext";
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
export default function PlayerBar() {
  const { track, playing, time, toggle, next, prev, seek } = usePlayer();
  if (!track) return null;
  return (
    <footer className="player">
      <img src={track.image} alt="" />
      <div className="meta"><strong>{track.title}</strong><span>{track.artist}</span></div>
      <div className="ctrl"><button onClick={prev}>Prev</button><button className="primary" onClick={toggle}>{playing ? "Pause" : "Play"}</button><button onClick={next}>Next</button></div>
      <div className="seek"><span>{fmt(time.cur)}</span>
        <input type="range" min="0" max={time.dur || 0} value={time.cur} onChange={(e) => seek(+e.target.value)} />
        <span>{fmt(time.dur)}</span></div>
    </footer>
  );
}
