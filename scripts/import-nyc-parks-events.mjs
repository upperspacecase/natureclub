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
// Skip indoor/irrelevant programming even when a category matches.
// NYC Parks tags events by VENUE as well as content — a jazz concert in a
// garden carries the "Nature" category. Nature Club is nature experiences
// (walks, hikes, birding, forest bathing, foraging, outdoor yoga,
// meditation), not anything-outdoors, so exclude by substance too.
const EXCLUDE_CATEGORIES = [
    "recreation center",
    "summer sports",
    "swimming",
    "arts & crafts",
    "arts, culture & fun",
    "performance",
    "music",
    "film",
    "dance",
    "theater",
    "festival",
];
// Word-boundary regexes — plain substring matching excluded events at the
// "Bandshell" (band) and descriptions saying "book your spot" (book)
const EXCLUDE_PATTERNS = [
    /\bmusic\b/,
    /\bjazz\b/,
    /\bconcert\b/,
    /\bfilm\b/,
    /\bmovies?\b/,
    /\bweaving\b/,
    /\bcrafts?\b/,
    /\bdance\b/,
    /\bvirtual\b/,
    /\bpilates\b/,
    /\bzumba\b/,
    /\bcorrespondence\b/,
    /\bexhibit/,
    /\bmeeting\b/,
    /\bfood demos?\b/,
    /\breading series\b/,
    /\bbook club\b/,
    /\brest & read\b/,
];

function classify(categoriesRaw, title, description) {
    const cats = (categoriesRaw || "").toLowerCase();
    if (EXCLUDE_CATEGORIES.some((x) => cats.includes(x))) return null;
    const text = `${title} ${description}`.toLowerCase();
    if (EXCLUDE_PATTERNS.some((re) => re.test(text))) return null;
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
    const cls = classify(r.categories, r.title, r.description || "");
    if (!cls) continue;
    // The feed's starttime/endtime carry the correct TIME OF DAY but their
    // date portion is stamped with the feed refresh date — the real event
    // date lives in startdate/enddate.
    const startDay = (r.startdate || "").slice(0, 10);
    const startClock = (r.starttime || "").slice(11, 19);
    if (!startDay || !startClock) continue;
    const start = toUtc(`${startDay} ${startClock}`);
    if (!start || start <= now) continue;
    const [lat, lng] = (r.coordinates || "").split(",").map((x) => parseFloat(x));
    if (!isFinite(lat) || !isFinite(lng)) continue;
    const endDay = (r.enddate || "").slice(0, 10) || startDay;
    const endClock = (r.endtime || "").slice(11, 19);
    const end = endClock ? toUtc(`${endDay} ${endClock}`) : null;
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

// Recurring programs get up to 3 dates SPREAD across the window (first,
// middle, last occurrence) rather than clustering on the earliest days.
const byTitle = new Map();
for (const c of candidates) {
    if (!byTitle.has(c.doc.title)) byTitle.set(c.doc.title, []);
    byTitle.get(c.doc.title).push(c);
}
const picked = [];
for (const occurrences of byTitle.values()) {
    occurrences.sort((a, b) => a.start - b.start);
    const n = occurrences.length;
    const idxs =
        n <= 3
            ? occurrences.map((_, i) => i)
            : [0, Math.floor(n / 2), n - 1];
    for (const i of idxs) picked.push(occurrences[i]);
}
// Balance the feed: keep all birding/hiking, cap the big buckets so
// nature-walks don't crowd out yoga entirely
const RANK_CAPS = { 0: 99, 1: 99, 2: 18, 3: 18, 4: 10, 5: 4 };
picked.sort((a, b) => a.rank - b.rank || a.start - b.start);
const rankCounts = {};
const finalDocs = [];
for (const c of picked) {
    const n = rankCounts[c.rank] || 0;
    if (n >= (RANK_CAPS[c.rank] ?? 10)) continue;
    rankCounts[c.rank] = n + 1;
    finalDocs.push(c.doc);
    if (finalDocs.length >= MAX_EVENTS) break;
}
console.log("Selected for import:", finalDocs.length);

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
for (const doc of finalDocs) {
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
