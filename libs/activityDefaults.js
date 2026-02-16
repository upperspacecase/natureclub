/**
 * Activity type → default difficulty + what-to-bring checklist + placeholder text.
 * Used during event creation to auto-populate fields when facilitator picks a type.
 */

const ACTIVITY_DEFAULTS = {
    "nature-walk": {
        label: "Nature Walk",
        difficulty: "easy",
        whatToBring: [
            "Water bottle",
            "Comfortable shoes",
            "Sunscreen",
            "Hat",
        ],
        placeholder:
            "A relaxed walk through local nature. We'll take it slow, notice what's around us, and enjoy being outside together.",
    },
    hike: {
        label: "Hike",
        difficulty: "moderate",
        whatToBring: [
            "Water bottle",
            "Snacks",
            "Sunscreen",
            "Comfortable hiking shoes",
            "Light layers",
        ],
        placeholder:
            "We'll hit the trail together — expect some elevation and beautiful views. All fitness levels welcome with the right footwear.",
    },
    "bird-walk": {
        label: "Bird Walk",
        difficulty: "easy",
        whatToBring: [
            "Binoculars (if you have them)",
            "Field guide (optional)",
            "Water bottle",
            "Comfortable shoes",
            "Sunscreen",
        ],
        placeholder:
            "A quiet, slow walk focused on spotting and identifying birds. No experience necessary — just curiosity and patience.",
    },
    "forest-bathing": {
        label: "Forest Bathing",
        difficulty: "easy",
        whatToBring: [
            "Comfortable clothing",
            "Water bottle",
            "Sit pad or small towel",
        ],
        placeholder:
            "A guided sensory experience in the forest. We'll slow down, breathe deeply, and let the woods in. No hiking involved.",
    },
    foraging: {
        label: "Foraging",
        difficulty: "moderate",
        whatToBring: [
            "Basket or cloth bag",
            "Comfortable shoes",
            "Water bottle",
            "Sunscreen",
            "Small knife (optional)",
        ],
        placeholder:
            "Learn to identify and gather wild edibles with a guide. We'll walk, forage, and maybe taste what we find.",
    },
    "outdoor-yoga": {
        label: "Outdoor Yoga",
        difficulty: "easy",
        whatToBring: [
            "Yoga mat",
            "Water bottle",
            "Comfortable clothing",
            "Light layers",
        ],
        placeholder:
            "Yoga in the open air. Bring your own mat, find your spot, and let nature do the rest. All levels welcome.",
    },
    meditation: {
        label: "Meditation",
        difficulty: "easy",
        whatToBring: [
            "Comfortable clothing",
            "Cushion or sit pad (optional)",
            "Water bottle",
        ],
        placeholder:
            "A guided meditation outdoors. We'll find a quiet spot, settle in, and practice being present together.",
    },
    other: {
        label: "Other",
        difficulty: "",
        whatToBring: [],
        placeholder:
            "Tell people what to expect — what you'll do, where you'll be, and why it'll be worth showing up.",
    },
};

/**
 * Get defaults for a given activity type.
 * Returns { label, difficulty, whatToBring, placeholder } or null.
 */
export function getActivityDefaults(activityType) {
    return ACTIVITY_DEFAULTS[activityType] || null;
}

/**
 * Get all activity types as an array of { value, label } for select inputs.
 */
export function getActivityTypeOptions() {
    return Object.entries(ACTIVITY_DEFAULTS).map(([value, { label }]) => ({
        value,
        label,
    }));
}

export default ACTIVITY_DEFAULTS;
