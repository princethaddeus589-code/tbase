import express from "express";
import cors from "cors";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
}
const app = express();
app.use(cors({
  origin: (o, cb) => cb(null, !o || o === process.env.CLIENT_ORIGIN || /^https:\/\/tbase-[a-z0-9-]+\.vercel\.app$/.test(o)),
}));

const J = "https://api.jamendo.com/v3.0";
const A = "https://api.audius.co/v1";
const id = process.env.JAMENDO_CLIENT_ID;
const clean = (s = "") => s.replaceAll("&amp;", "&");
const GENRES = { hiphop: "Hip-Hop/Rap", electronic: "Electronic", pop: "Pop", rock: "Rock", jazz: "Jazz", classical: "Classical", country: "Country", metal: "Metal", lofi: "Lo-Fi" };

const requireAuth = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch { res.status(401).json({ error: "Please log in" }); }
};

async function jamendo(tag, q) {
  const p = new URLSearchParams({ client_id: id, format: "json", limit: "40", imagesize: "200", order: "popularity_week" });
  if (tag) p.set("tags", tag);
  if (q) p.set("search", q);
  const d = await (await fetch(`${J}/tracks/?${p}`)).json();
  return (d.results || []).map((t) => ({
    id: String(t.id), title: clean(t.name), artist: clean(t.artist_name), image: t.image, audio: t.audio,
    downloadable: !!t.audiodownload_allowed, source: "jamendo",
  }));
}

async function audius(tag, q) {
  const g = GENRES[tag];
  const url = q || (tag && !g)
    ? `${A}/tracks/search?query=${encodeURIComponent(q || tag)}&app_name=TBASE`
    : `${A}/tracks/trending?time=week&limit=40&app_name=TBASE${g ? `&genre=${encodeURIComponent(g)}` : ""}`;
  const d = await (await fetch(url)).json();
  return (d.data || []).slice(0, 40).map((t) => ({
    id: "a" + t.id, title: clean(t.title), artist: clean(t.user?.name),
    image: t.artwork?.["480x480"] || t.artwork?.["150x150"] || "",
    audio: `${A}/tracks/${t.id}/stream?app_name=TBASE`, downloadable: false, source: "audius",
  }));
}

app.get("/api/tracks", async (req, res) => {
  const { source = "all", tag = "", q = "" } = req.query;
  try {
    if (source === "jamendo") return res.json(await jamendo(tag, q));
    if (source === "audius") return res.json(await audius(tag, q));
    const [a, b] = await Promise.allSettled([audius(tag, q), jamendo(tag, q)]);
    const x = a.value || [], y = b.value || [], out = [];
    for (let i = 0; i < Math.max(x.length, y.length); i++) { if (x[i]) out.push(x[i]); if (y[i]) out.push(y[i]); }
    res.json(out);
  } catch { res.json([]); }
});

app.get("/api/download/:trackId", requireAuth, async (req, res) => {
  const r = await fetch(`${J}/tracks/?client_id=${id}&format=json&id=${encodeURIComponent(req.params.trackId)}&audiodlformat=mp32`);
  const t = (await r.json()).results?.[0];
  if (!t?.audiodownload_allowed) return res.status(403).json({ error: "Download not allowed" });
  res.json({ url: t.audiodownload });
});

if (!process.env.VERCEL) app.listen(process.env.PORT || 5000, () => console.log("T base server running"));
export default app;
