/**
 * Seed Bali nature spots from xlsx into MongoDB.
 *
 * Usage:  node scripts/seed-spots.mjs
 *
 * Reads bali_nature_spots.xlsx from the project root (or ~/Downloads),
 * transforms each row into an Event document with type "spot",
 * and upserts to MongoDB via bulkWrite.
 *
 * Requires: xlsx  (npm i xlsx --save-dev)
 */

import { readFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load xlsx dynamically ──
let XLSX;
try {
    XLSX = await import("xlsx");
} catch {
    console.error("xlsx package not found. Run: npm i xlsx --save-dev");
    process.exit(1);
}

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

// ── Category mapping ──
const CATEGORY_MAP = {
    beach: "beach",
    "cliff/viewpoint": "viewpoint",
    "hiking trail": "trail",
    "hot spring": "hot-spring",
    lake: "lake",
    "rice terrace": "rice-terrace",
    viewpoint: "viewpoint",
    waterfall: "waterfall",
};

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

// ── Read xlsx ──
const xlsxPaths = [
    resolve(__dirname, "../bali_nature_spots.xlsx"),
    resolve(process.env.HOME || "~", "Downloads/bali_nature_spots.xlsx"),
];

let workbook;
for (const p of xlsxPaths) {
    try {
        workbook = XLSX.readFile(p);
        console.log(`📄 Loaded: ${p}\n`);
        break;
    } catch {
        /* try next */
    }
}

if (!workbook) {
    console.error(
        "Could not find bali_nature_spots.xlsx in project root or ~/Downloads."
    );
    process.exit(1);
}

const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

console.log(`Found ${rows.length} rows.\n`);

// ── Transform to Event docs ──
const docs = rows.map((row) => {
    const name = (row.Name || "").trim();
    const slug = slugify(name);
    const rawCategory = (row.Category || "").trim().toLowerCase();
    const categoryTag = CATEGORY_MAP[rawCategory] || rawCategory;
    const area = (row.Area || "").trim();
    const notes = (row.Notes || "").trim();
    const lat = parseFloat(row.Latitude) || null;
    const lng = parseFloat(row.Longitude) || null;

    return {
        eventId: slug,
        title: name,
        type: "spot",
        image: "",
        categoryTag,
        attributeTags: [],
        themes: ["adventure"],
        region: area,
        regionKey: "bali",
        description: notes,
        location: { lat, lng },
    };
});

// ── Connect & upsert ──
await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ Connected to MongoDB.\n");

const Event =
    mongoose.models.Event ||
    mongoose.model(
        "Event",
        new mongoose.Schema({}, { strict: false, timestamps: true })
    );

const ops = docs.map((doc) => ({
    updateOne: {
        filter: { eventId: doc.eventId },
        update: { $set: doc },
        upsert: true,
    },
}));

const result = await Event.bulkWrite(ops);

console.log(`✅ Seeded ${docs.length} spots.`);
console.log(
    `   Inserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}\n`
);

await mongoose.disconnect();
console.log("Done.");
