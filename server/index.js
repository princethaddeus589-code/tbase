import "dotenv/config";
import express from "express";
import cors from "cors";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
}
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
const J = "https://api.jamendo.com/v3.0";
const id = process.env.JAMENDO_CLIENT_ID;

const requireAuth = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch { res.status(401).json({ error: "Please log in" }); }
};

app.get("/api/tracks", async (req, res) => {
  const { tag = "", q = "" } = req.query;
  const p = new URLSearchParams({ client_id: id, format: "json", limit: "40", audioformat: "mp32", order: "popularity_week", include: "musicinfo" });
  if (tag) p.set("tags", tag);
  if (q) p.set("search", q);
  const r = await fetch(`${J}/tracks/?${p}`);
  const data = await r.json();
  res.json((data.results || []).map((t) => ({
    id: t.id, title: t.name, artist: t.artist_name, image: t.image, audio: t.audio,
    downloadable: t.audiodownload_allowed,
  })));
});

app.get("/api/download/:trackId", requireAuth, async (req, res) => {
  const r = await fetch(`${J}/tracks/?client_id=${id}&format=json&id=${encodeURIComponent(req.params.trackId)}&audiodlformat=mp32`);
  const t = (await r.json()).results?.[0];
  if (!t?.audiodownload_allowed) return res.status(403).json({ error: "Download not allowed" });
  res.json({ url: t.audiodownload });
});
app.get("/api/debug", async (req, res) => {
  const r = await fetch(`${J}/tracks/?client_id=${id}&format=json&limit=1`);
  const d = await r.json();
  res.json({
    hasJamendoId: !!id,
    idLength: id ? id.length : 0,
    hasFirebaseKey: !!process.env.FIREBASE_SERVICE_ACCOUNT,
    origin: process.env.CLIENT_ORIGIN,
    jamendo: d.headers,
  });
});

if (!process.env.VERCEL) app.listen(process.env.PORT || 5000, () => console.log("T base server running"));
export default app;
