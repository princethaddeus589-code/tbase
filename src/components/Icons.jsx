const P = {
  home: "M12 3 3 10.5V21h6.5v-6h5v6H21V10.5z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM16.5 16.5 21 21",
  library: "M5 4v16M10 4v16M15 5.5l4.5 14.5",
  play: "M7 4v16l13-8z",
  pause: "M6 4h4v16H6zM14 4h4v16h-4z",
  next: "M6 4l10 8-10 8zM17 4h2.5v16H17z",
  prev: "M18 4 8 12l10 8zM4.5 4H7v16H4.5z",
  heart: "M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z",
  more: "M5 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM19 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z",
  down: "M6 9l6 6 6-6",
  plus: "M12 5v14M5 12h14",
};
const ALWAYS_LINE = ["search", "library", "down", "plus"];
export default function Icon({ n, s = 24, line }) {
  const ln = line || ALWAYS_LINE.includes(n);
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={ln ? "none" : "currentColor"} stroke={ln ? "currentColor" : "none"}
      strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true"><path d={P[n]} /></svg>
  );
}
