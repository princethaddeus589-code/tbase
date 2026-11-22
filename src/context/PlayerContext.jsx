import { createContext, useContext, useEffect, useRef, useState } from "react";
const Ctx = createContext();
export const usePlayer = () => useContext(Ctx);
export function PlayerProvider({ children }) {
  const audio = useRef(new Audio());
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState({ cur: 0, dur: 0 });
  const track = queue[index];
  useEffect(() => {
    const a = audio.current;
    const on = { timeupdate: () => setTime({ cur: a.currentTime, dur: a.duration || 0 }),
      play: () => setPlaying(true), pause: () => setPlaying(false), ended: () => next() };
    Object.entries(on).forEach(([e, f]) => a.addEventListener(e, f));
    return () => Object.entries(on).forEach(([e, f]) => a.removeEventListener(e, f));
  });
  useEffect(() => { if (track) { audio.current.src = track.audio; audio.current.play().catch(() => {}); } }, [track?.id]);
  const play = (list, i) => { setQueue(list); setIndex(i); };
  const toggle = () => (audio.current.paused ? audio.current.play() : audio.current.pause());
  const next = () => setIndex((i) => (i + 1 < queue.length ? i + 1 : i));
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const seek = (s) => { audio.current.currentTime = s; };
  return <Ctx.Provider value={{ track, playing, time, play, toggle, next, prev, seek }}>{children}</Ctx.Provider>;
}
