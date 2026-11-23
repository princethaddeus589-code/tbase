import { createContext, useContext, useEffect, useRef, useState } from "react";
const Ctx = createContext();
export const usePlayer = () => useContext(Ctx);
const ms = () => ("mediaSession" in navigator ? navigator.mediaSession : null);

export function PlayerProvider({ children }) {
  const audio = useRef(new Audio());
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState({ cur: 0, dur: 0 });
  const track = queue[index];

  const next = () => setIndex((i) => (i + 1 < queue.length ? i + 1 : i));
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const toggle = () => (audio.current.paused ? audio.current.play() : audio.current.pause());
  const seek = (s) => { audio.current.currentTime = s; };
  const play = (list, i) => { setQueue(list); setIndex(i); };

  useEffect(() => {
    const a = audio.current;
    const on = {
      timeupdate: () => {
        setTime({ cur: a.currentTime, dur: a.duration || 0 });
        try { if (ms() && isFinite(a.duration)) ms().setPositionState({ duration: a.duration, position: a.currentTime, playbackRate: 1 }); } catch {}
      },
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      ended: () => next(),
    };
    Object.entries(on).forEach(([e, f]) => a.addEventListener(e, f));
    return () => Object.entries(on).forEach(([e, f]) => a.removeEventListener(e, f));
  });

  useEffect(() => {
    if (!track) return;
    audio.current.src = track.audio;
    audio.current.play().catch(() => {});
    if (ms()) {
      ms().metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: "T base",
        artwork: track.image
          ? [96, 256, 512].map((s) => ({ src: track.image, sizes: `${s}x${s}` }))
          : [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
      });
    }
  }, [track?.id]);

  useEffect(() => {
    if (!ms()) return;
    const set = (a, f) => { try { ms().setActionHandler(a, f); } catch {} };
    set("play", () => audio.current.play());
    set("pause", () => audio.current.pause());
    set("previoustrack", prev);
    set("nexttrack", next);
    set("seekto", (d) => { audio.current.currentTime = d.seekTime; });
  });

  useEffect(() => { if (ms()) ms().playbackState = playing ? "playing" : "paused"; }, [playing]);

  return <Ctx.Provider value={{ track, playing, time, play, toggle, next, prev, seek }}>{children}</Ctx.Provider>;
}
