/**
 * Import real upcoming NYC Parks events (via NYC Open Data) as published
 * Nature Club events.
 *
 * Source: "NYC Parks Public Events – Upcoming 14 Days" (dataset w3wp-dpdi),
 * refreshed daily by the Department of Parks and Recreation.
 *
 * Usage:  node scripts/import-nyc-parks-events.mjs
 *
 * Safe to re-run — upserts by slug derived from the Parks event guid, so
 * re-imports update rather than duplicate. Only future events with
 * coordinates and a Nature Club-aligned category are imported, capped at
 * MAX_EVENTS. Every description carries NYC Parks attribution + source link.
 */

import { readFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load env ──
const envPath = resolve(__dirname, "../.env.local");
try {
    const envContent = await readFile(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const idx = trimmed.indexOf("=");
        if (idx === -1) return;
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
    });
} catch {
    console.log("No .env.local found, using existing env vars.\n");
}

if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not set.");
    process.exit(1);
}

const MAX_EVENTS = 45;
const DATASET = "https://data.cityofnewyork.us/resource/w3wp-dpdi.json";
// Categories that fit Nature Club, in priority order (first match wins for
// both inclusion ranking and activityType mapping)
const CATEGORY_MAP = [
    { match: "birding", activityType: "bird-walk", rank: 0 },
    { match: "hiking", activityType: "hike", rank: 1 },
    { match: "nature", activityType: "nature-walk", rank: 2 },
    { match: "wildlife", activityType: "nature-walk", rank: 3 },
    { match: "yoga", activityType: "outdoor-yoga", rank: 4 },
    { match: "astronomy", activityType: "other", rank: 5 },
];
// Skip indoor/irrelevant programming even when a category matches
const EXCLUDE = ["recreation center", "summer sports", "swimming"];

function classify(categoriesRaw) {
    const cats = (categoriesRaw || "").toLowerCase();
    if (EXCLUDE.some((x) => cats.includes(x))) return null;
    for (const c of CATEGORY_MAP) {
        if (cats.includes(c.match)) return c;
    }
    return null;
}

// Keyword overrides for finer taxonomy fit
function refineType(base, title, description) {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes("foraging")) return "foraging";
    if (text.includes("forest bathing")) return "forest-bathing";
    if (text.includes("meditation")) return "meditation";
    return base;
}

// Parks feed text contains HTML entities (&#8211;, &amp;, &#8217;, ...)
function decodeEntities(s) {
    return (s || "")
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ");
}

function kebab(s) {
    return s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
}

// starttime is local New York time with no offset, e.g. "2026-08-15 08:00:00".
// August–October is EDT (UTC-4).
function toUtc(nyLocal) {
    if (!nyLocal) return null;
    const iso = nyLocal.replace(" ", "T") + "-04:00";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
}

const url = `${DATASET}?$limit=2000&$where=coordinates IS NOT NULL`;
const res = await fetch(url.replace(/ /g, "%20"));
if (!res.ok) {
    console.error("Dataset fetch failed:", res.status);
    process.exit(1);
}
const rows = await res.json();
console.log("Dataset rows fetched:", rows.length);

const now = new Date();
const candidates = [];
for (const r of rows) {
    r.title = decodeEntities(r.title);
    r.description = decodeEntities(r.description);
    r.location = decodeEntities(r.location);
    r.parknames = decodeEntities(r.parknames);
    const cls = classify(r.categories);
    if (!cls) continue;
    const start = toUtc(r.starttime);
    if (!start || start <= now) continue;
    const [lat, lng] = (r.coordinates || "").split(",").map((x) => parseFloat(x));
    if (!isFinite(lat) || !isFinite(lng)) continue;
    const end = toUtc(r.endtime);
    const durationMinutes =
        end && end > start
            ? Math.min(480, Math.round((end - start) / 60000))
            : 90;
    const sourceUrl = r.link?.url || "";
    const regNote = r.registration_url?.url
        ? `\n\nRegistration required: ${r.registration_url.url}`
        : "";
    candidates.push({
        rank: cls.rank,
        start,
        doc: {
            title: r.title,
            slug: `${kebab(r.title)}-nycparks-${r.guid}`,
            status: "published",
            isPublic: true,
            activityType: refineType(cls.activityType, r.title, r.description || ""),
            dateTime: start,
            durationMinutes,
            groupSize: 30,
            price: 0,
            currency: "USD",
            description: `${(r.description || "").trim()}\n\nA free public event by NYC Parks. Source: ${sourceUrl}${regNote}`,
            meetingPoint: {
                description: r.location
                    ? `${r.location}`
                    : r.parknames || "See source listing",
                lat,
                lng,
            },
        },
    });
}
console.log("Nature Club-aligned future events:", candidates.length);

// Prefer category diversity and earlier dates; avoid many copies of the same
// recurring program: keep at most 3 dates per title.
candidates.sort((a, b) => a.rank - b.rank || a.start - b.start);
const perTitle = new Map();
const picked = [];
for (const c of candidates) {
    const k = c.doc.title;
    const n = perTitle.get(k) || 0;
    if (n >= 3) continue;
    perTitle.set(k, n + 1);
    picked.push(c.doc);
    if (picked.length >= MAX_EVENTS) break;
}
console.log("Selected for import:", picked.length);

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

// Find or create the curator host user
const users = db.collection("users");
let curator = await users.findOne({ username: "natureclub" });
if (!curator) {
    const ins = await users.insertOne({
        email: "hello@nature-club.co",
        name: "Nature Club",
        username: "natureclub",
        bio: "Curated free outdoor events from around New York City.",
        photoUrl: "",
        hasAccess: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    curator = { _id: ins.insertedId };
    console.log("Created curator user natureclub");
}

const events = db.collection("bookingevents");
let created = 0;
let updated = 0;
for (const doc of picked) {
    const r = await events.updateOne(
        { slug: doc.slug },
        {
            $set: { ...doc, updatedAt: new Date() },
            $setOnInsert: { createdBy: curator._id, createdAt: new Date() },
        },
        { upsert: true }
    );
    if (r.upsertedCount) created += 1;
    else if (r.modifiedCount) updated += 1;
}
console.log(`Import done: ${created} created, ${updated} updated.`);

const byType = await events
    .aggregate([
        { $match: { slug: /-nycparks-/ } },
        { $group: { _id: "$activityType", n: { $sum: 1 } } },
    ])
    .toArray();
console.log(
    "Imported events by type:",
    byType.map((t) => `${t._id}:${t.n}`).join(", ")
);

await mongoose.disconnect();
