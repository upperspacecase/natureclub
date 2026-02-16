"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/libs/api";
import {
    getActivityDefaults,
    getActivityTypeOptions,
} from "@/libs/activityDefaults";

const TITLE_PLACEHOLDERS = [
    "Saturday morning bird walk",
    "Full moon hike at Bear Creek",
    "Forest bathing in the redwoods",
    "Sunrise yoga at the lake",
    "Wildflower foraging walk",
    "Meditation by the creek",
];

const WEATHER_PRESETS = [
    "Light rain OK, storms cancel",
    "Any rain cancels",
    "We go regardless",
];

const DIFFICULTY_OPTIONS = [
    { value: "easy", label: "Easy" },
    { value: "moderate", label: "Moderate" },
    { value: "hard", label: "Hard" },
    { value: "strenuous", label: "Strenuous" },
];

const inputClass =
    "w-full rounded-[5px] border border-white/35 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/60 outline-none focus:border-white/70";

export default function EventCreatePage() {
    const router = useRouter();
    const [eventId, setEventId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [published, setPublished] = useState(false);
    const [slug, setSlug] = useState("");
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(90);
    const [activityType, setActivityType] = useState("");
    const [activityTypeOther, setActivityTypeOther] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [groupSize, setGroupSize] = useState(10);
    const [description, setDescription] = useState("");
    const [whatToBring, setWhatToBring] = useState([]);
    const [newBringItem, setNewBringItem] = useState("");
    const [weatherPolicy, setWeatherPolicy] = useState("Light rain OK, storms cancel");
    const [customWeather, setCustomWeather] = useState("");
    const [price, setPrice] = useState(0);
    const [priceLink, setPriceLink] = useState("");
    const [accessibilityNotes, setAccessibilityNotes] = useState("");
    const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const [placeholder] = useState(
        () => TITLE_PLACEHOLDERS[Math.floor(Math.random() * TITLE_PLACEHOLDERS.length)]
    );

    const saveTimer = useRef(null);

    // Create draft event on mount
    useEffect(() => {
        async function createDraft() {
            try {
                const res = await apiClient.post("/events/create");
                setEventId(res.id);
            } catch (err) {
                console.error("Failed to create draft:", err);
            }
        }
        createDraft();
    }, []);

    // Auto-save (debounced)
    const autoSave = useCallback(
        (fields) => {
            if (!eventId) return;
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(async () => {
                setSaving(true);
                try {
                    await apiClient.patch(`/events/${eventId}`, fields);
                } catch (err) {
                    console.error("Auto-save failed:", err);
                } finally {
                    setSaving(false);
                }
            }, 800);
        },
        [eventId]
    );

    // Auto-save on field change
    useEffect(() => {
        if (!eventId) return;
        autoSave({
            title,
            dateTime: dateTime ? new Date(dateTime).toISOString() : null,
            durationMinutes,
            activityType,
            activityTypeOther,
            difficulty,
            groupSize,
            description,
            whatToBring,
            weatherPolicy: WEATHER_PRESETS.includes(weatherPolicy)
                ? weatherPolicy
                : customWeather,
            price,
            priceLink,
            accessibilityNotes,
            coverPhotoUrl,
        });
    }, [
        eventId, title, dateTime, durationMinutes, activityType, activityTypeOther,
        difficulty, groupSize, description, whatToBring, weatherPolicy, customWeather,
        price, priceLink, accessibilityNotes, coverPhotoUrl, autoSave,
    ]);

    // When activity type changes, set defaults
    useEffect(() => {
        if (!activityType) return;
        const defaults = getActivityDefaults(activityType);
        if (defaults) {
            if (!difficulty) setDifficulty(defaults.difficulty);
            if (whatToBring.length === 0) setWhatToBring([...defaults.whatToBring]);
            if (!description) setDescription(defaults.placeholder);
        }
    }, [activityType]);

    // Publish
    async function handlePublish() {
        if (!title.trim()) return;
        setPublishing(true);
        try {
            const res = await apiClient.patch(`/events/${eventId}`, {
                title,
                status: "published",
            });
            setPublished(true);
            setSlug(res.slug);
        } catch (err) {
            console.error("Publish failed:", err);
        } finally {
            setPublishing(false);
        }
    }

    // Photo upload
    async function handlePhotoUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                setCoverPhotoUrl(data.url);
            }
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploadingPhoto(false);
        }
    }

    // Add what-to-bring item
    function addBringItem() {
        const item = newBringItem.trim();
        if (item && !whatToBring.includes(item)) {
            setWhatToBring([...whatToBring, item]);
            setNewBringItem("");
        }
    }

    function removeBringItem(index) {
        setWhatToBring(whatToBring.filter((_, i) => i !== index));
    }

    return (
        <div className="min-h-screen bg-base-100 text-white">
            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <button
                        onClick={() => router.push("/events")}
                        className="text-sm text-white/60 hover:text-white"
                    >
                        ← Back
                    </button>
                    <div className="flex items-center gap-3">
                        {saving && (
                            <span className="text-xs text-white/40">Saving...</span>
                        )}
                        {published && slug && (
                            <a
                                href={`/e/${slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-white/70 hover:text-white hover:underline"
                            >
                                View event →
                            </a>
                        )}
                        <button
                            onClick={handlePublish}
                            disabled={!title.trim() || publishing || published}
                            className="btn disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {published ? "Published ✓" : publishing ? "Publishing..." : "Publish"}
                        </button>
                    </div>
                </div>

                {/* Cover Photo */}
                <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-[6px] border border-white/15 bg-white/10">
                    {coverPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={coverPhotoUrl}
                            alt="Cover"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-white/40">
                            <label className="cursor-pointer text-center">
                                <span className="text-3xl">📷</span>
                                <p className="mt-2 text-sm">Add a cover photo</p>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}
                    {coverPhotoUrl && (
                        <label className="absolute bottom-3 right-3 cursor-pointer rounded-full border border-white/30 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/70">
                            Change photo
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                        </label>
                    )}
                    {uploadingPhoto && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="text-white">Uploading...</span>
                        </div>
                    )}
                </div>

                {/* Title */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={placeholder}
                    maxLength={80}
                    className="mb-6 w-full border-0 bg-transparent font-serif text-3xl italic text-white placeholder-white/30 outline-none focus:ring-0 sm:text-4xl"
                />

                {/* Add details toggle */}
                <button
                    onClick={() => setDetailsOpen(!detailsOpen)}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white"
                >
                    <span
                        className="inline-block transition-transform"
                        style={{ transform: detailsOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                    >
                        ▸
                    </span>
                    Add details
                </button>

                {/* Details section */}
                {detailsOpen && (
                    <div className="space-y-6 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                        {/* Date & Time */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-white/60">
                                Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                value={dateTime}
                                onChange={(e) => setDateTime(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-white/60">
                                Duration
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={durationMinutes}
                                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                                    min={15}
                                    max={480}
                                    step={15}
                                    className={`w-24 ${inputClass}`}
                                />
                                <span className="text-sm text-white/60">minutes</span>
                            </div>
                        </div>

                        {/* Activity Type */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-white/60">
                                Activity Type
                            </label>
                            <select
                                value={activityType}
                                onChange={(e) => setActivityType(e.target.value)}
                                className={inputClass}
                            >
                                <option value="">Select activity...</option>
                                {getActivityTypeOptions().map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            {activityType === "other" && (
                                <input
                                    type="text"
                                    value={activityTypeOther}
                                    onChange={(e) => setActivityTypeOther(e.target.value)}
                                    placeholder="What kind of activity?"
                                    className={`mt-2 ${inputClass}`}
                                />
                            )}
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-white/60">
                                Difficulty
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {DIFFICULTY_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setDifficulty(opt.value)}
                                        className={`rounded-full px-4 py-1.5 text-sm transition-colors ${difficulty === opt.value
                                            ? "border border-white bg-white/20 text-white"
                                            : "border border-white/30 text-white/70 hover:border-white"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Group Size */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-white/60">
                                Group Size
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setGroupSize(Math.max(2, groupSize - 1))}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white/70 hover:border-white hover:text-white"
                                >
                                    −
                                </button>
                                <span className="w-10 text-center text-lg font-medium text-white">
                                    {groupSize}
                                </span>
                                <button
                                    onClick={() => setGroupSize(Math.min(100, groupSize + 1))}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white/70 hover:border-white hover:text-white"
                                >
                                    +
                                </button>
                                <span className="text-sm text-white/60">people</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-white/60">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={2000}
                                rows={4}
                                placeholder="Tell people what to expect..."
                                className={`resize-none ${inputClass}`}
                            />
                            <p className="mt-1 text-right text-xs text-white/40">
                                {description.length}/2000
                            </p>
                        </div>

                        {/* What to Bring */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-white/60">
                                What to Bring
                            </label>
                            <ul className="mb-2 space-y-1">
                                {whatToBring.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center justify-between rounded-[5px] border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm text-white/80"
                                    >
                                        <span>☑ {item}</span>
                                        <button
                                            onClick={() => removeBringItem(i)}
                                            className="text-white/40 hover:text-white"
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newBringItem}
                                    onChange={(e) => setNewBringItem(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addBringItem()}
                                    placeholder="Add item..."
                                    className={`flex-1 ${inputClass}`}
                                />
                                <button
                                    onClick={addBringItem}
                                    className="rounded-[5px] border border-white/30 px-3 py-2 text-sm text-white/70 hover:border-white hover:text-white"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Weather Policy */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-white/60">
                                Weather Policy
                            </label>
                            <div className="space-y-2">
                                {WEATHER_PRESETS.map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => { setWeatherPolicy(preset); setCustomWeather(""); }}
                                        className={`block w-full rounded-[5px] border px-4 py-2 text-left text-sm transition ${weatherPolicy === preset
                                            ? "border-white bg-white/20 text-white"
                                            : "border-white/30 text-white/70 hover:border-white"
                                            }`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setWeatherPolicy("custom")}
                                    className={`block w-full rounded-[5px] border px-4 py-2 text-left text-sm transition ${weatherPolicy === "custom"
                                        ? "border-white bg-white/20 text-white"
                                        : "border-white/30 text-white/70 hover:border-white"
                                        }`}
                                >
                                    Custom
                                </button>
                                {weatherPolicy === "custom" && (
                                    <input
                                        type="text"
                                        value={customWeather}
                                        onChange={(e) => setCustomWeather(e.target.value)}
                                        placeholder="Describe your weather policy..."
                                        className={inputClass}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-white/60">
                                Price
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-white/60">$</span>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    min={0}
                                    className={`w-24 ${inputClass}`}
                                />
                                <span className="text-sm text-white/60">
                                    {price === 0 ? "(Free)" : ""}
                                </span>
                            </div>
                            {price > 0 && (
                                <input
                                    type="url"
                                    value={priceLink}
                                    onChange={(e) => setPriceLink(e.target.value)}
                                    placeholder="Payment link (Venmo, PayPal, etc.)"
                                    className={`mt-2 ${inputClass}`}
                                />
                            )}
                        </div>

                        {/* Accessibility */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-white/60">
                                Accessibility Notes
                            </label>
                            <input
                                type="text"
                                value={accessibilityNotes}
                                onChange={(e) => setAccessibilityNotes(e.target.value)}
                                maxLength={500}
                                placeholder="Trail is wheelchair accessible for first 0.5 miles"
                                className={inputClass}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
