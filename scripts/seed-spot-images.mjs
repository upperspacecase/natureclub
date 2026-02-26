#!/usr/bin/env node
/**
 * One-time script: fetch Unsplash photos for every Bali spot and write the
 * image URLs back into data/events.js.
 *
 * Usage:
 *   node scripts/seed-spot-images.mjs
 *
 * Requires UNSPLASH_ACCESS_KEY in .env.local (loaded via dotenv).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ── Load .env.local ──
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const envPath = path.join(ROOT, ".env.local");

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = value;
    }
}

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!ACCESS_KEY) {
    console.error("❌ UNSPLASH_ACCESS_KEY not found in .env.local");
    process.exit(1);
}

// ── Unsplash search helper ──
async function searchPhoto(query) {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "1");
    url.searchParams.set("orientation", "landscape");

    const res = await fetch(url.toString(), {
        headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Unsplash ${res.status}: ${text}`);
    }

    const data = await res.json();
    return data.results?.[0]?.urls?.regular || "";
}

// ── Build search queries for each spot category ──
function buildQuery(spot) {
    const categoryMap = {
        beach: "beach",
        waterfall: "waterfall",
        viewpoint: "scenic viewpoint",
        trail: "hiking trail",
        lake: "lake",
        "hot-spring": "hot spring",
        "rice-terrace": "rice terrace",
    };
    const category = categoryMap[spot.categoryTag] || spot.categoryTag;
    return `${spot.title} ${category} bali`;
}

// ── Main ──
const eventsFile = path.join(ROOT, "data", "events.js");
let source = fs.readFileSync(eventsFile, "utf-8");

// Find all spots: lines with  type: "spot"  preceded by  id: "..."
// We match on `id: "xxx"` followed eventually by `image: ""`
const spotIdRegex = /id:\s*"([^"]+)",\s*\n\s*type:\s*"spot"/g;

const spotIds = [];
let match;
while ((match = spotIdRegex.exec(source)) !== null) {
    spotIds.push(match[1]);
}

console.log(`Found ${spotIds.length} spots to seed.\n`);

let updated = 0;

for (const id of spotIds) {
    // Find the spot block and its image field
    // Pattern: id: "xxx", ... image: "", (within a few lines)
    const blockRegex = new RegExp(
        `(id:\\s*"${id}"[\\s\\S]*?)(image:\\s*")(")`
    );
    const blockMatch = source.match(blockRegex);

    if (!blockMatch) {
        console.log(`⏭️  ${id} — could not locate image field, skipping`);
        continue;
    }

    // Already has an image?
    const existingImage = blockMatch[2].replace('image: "', '');
    if (blockMatch[3] !== '"') {
        // There's content between the quotes — not empty
        console.log(`⏭️  ${id} — already has an image, skipping`);
        continue;
    }

    // Build a search query from the spot title + category
    // We need to find the title — grab it from the block
    const titleMatch = source.match(
        new RegExp(`id:\\s*"${id}"[\\s\\S]*?title:\\s*"([^"]+)"`)
    );
    const categoryMatch = source.match(
        new RegExp(`id:\\s*"${id}"[\\s\\S]*?categoryTag:\\s*"([^"]+)"`)
    );

    const title = titleMatch?.[1] || id;
    const categoryTag = categoryMatch?.[1] || "";

    const query = buildQuery({ title, categoryTag });
    console.log(`🔍  ${id} → "${query}"`);

    try {
        const imageUrl = await searchPhoto(query);
        if (!imageUrl) {
            console.log(`   ⚠️  No results, skipping`);
            continue;
        }

        // Replace image: "" with image: "url"
        source = source.replace(
            blockRegex,
            `$1image: "${imageUrl}$3`
        );
        console.log(`   ✅  ${imageUrl.slice(0, 60)}…`);
        updated++;

        // Rate limit: Unsplash free tier = 50 req/hr, be gentle
        await new Promise((r) => setTimeout(r, 1200));
    } catch (err) {
        console.error(`   ❌  ${err.message}`);
    }
}

// Write back
fs.writeFileSync(eventsFile, source, "utf-8");
console.log(`\n✅ Done! Updated ${updated}/${spotIds.length} spots.`);
