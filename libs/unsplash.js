/**
 * Unsplash API utility – server-side only.
 *
 * Uses UNSPLASH_ACCESS_KEY from env.
 * Docs: https://unsplash.com/documentation#search-photos
 */

const UNSPLASH_BASE = "https://api.unsplash.com";

/**
 * Search Unsplash for a single photo matching a query.
 * Returns the `regular` (1080w) URL or null.
 */
export async function searchPhoto(query, { orientation = "landscape" } = {}) {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) throw new Error("Missing UNSPLASH_ACCESS_KEY env var");

    const url = new URL(`${UNSPLASH_BASE}/search/photos`);
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "1");
    url.searchParams.set("orientation", orientation);

    const res = await fetch(url.toString(), {
        headers: { Authorization: `Client-ID ${accessKey}` },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Unsplash API ${res.status}: ${text}`);
    }

    const data = await res.json();
    const photo = data.results?.[0];
    if (!photo) return null;

    return {
        url: photo.urls.regular,
        thumb: photo.urls.thumb,
        alt: photo.alt_description || query,
        credit: {
            name: photo.user.name,
            link: photo.user.links.html,
        },
    };
}
