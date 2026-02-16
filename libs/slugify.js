/**
 * Generate a URL-safe slug from a title with a short random suffix.
 * "Saturday morning bird walk" → "saturday-morning-bird-walk-a3x9"
 */
export function slugify(title) {
    const base = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // strip non-word chars (except spaces and hyphens)
        .replace(/[\s_]+/g, "-") // spaces/underscores → hyphens
        .replace(/-+/g, "-") // collapse multiple hyphens
        .replace(/^-|-$/g, ""); // trim leading/trailing hyphens

    const suffix = randomSuffix(4);

    return base ? `${base}-${suffix}` : suffix;
}

function randomSuffix(length) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
