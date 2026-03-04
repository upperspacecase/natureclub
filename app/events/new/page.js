"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/libs/api";
import StoryCardPreview from "@/components/StoryCardPreview";
import DateTimePicker from "@/components/DateTimePicker";
import LocationPicker from "@/components/LocationPicker";
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
    { value: "strenuous", label: "Crazy" },
];

const DURATION_OPTIONS = [
    { value: 30, label: "30 min" },
    { value: 45, label: "45 min" },
    { value: 60, label: "1 hr" },
    { value: 75, label: "1 hr 15 min" },
    { value: 90, label: "1 hr 30 min" },
    { value: 120, label: "2 hr" },
    { value: 150, label: "2 hr 30 min" },
    { value: 180, label: "3 hr" },
    { value: 240, label: "4 hr" },
    { value: 300, label: "5 hr" },
    { value: 360, label: "6 hr" },
    { value: 480, label: "8 hr" },
];

function getDefaultDate() {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(8, 0, 0, 0);
    return d;
}

const CURRENCIES = [
    { code: "USD", symbol: "$", label: "$ USD" },
    { code: "EUR", symbol: "€", label: "€ EUR" },
    { code: "GBP", symbol: "£", label: "£ GBP" },
    { code: "CAD", symbol: "CA$", label: "CA$ CAD" },
    { code: "AUD", symbol: "A$", label: "A$ AUD" },
    { code: "NZD", symbol: "NZ$", label: "NZ$ NZD" },
    { code: "BRL", symbol: "R$", label: "R$ BRL" },
    { code: "MXN", symbol: "MX$", label: "MX$ MXN" },
    { code: "JPY", symbol: "¥", label: "¥ JPY" },
    { code: "INR", symbol: "₹", label: "₹ INR" },
    { code: "ZAR", symbol: "R", label: "R ZAR" },
    { code: "CHF", symbol: "CHF", label: "CHF" },
    { code: "SEK", symbol: "kr", label: "kr SEK" },
    { code: "NOK", symbol: "kr", label: "kr NOK" },
    { code: "DKK", symbol: "kr", label: "kr DKK" },
    { code: "COP", symbol: "COL$", label: "COL$ COP" },
    { code: "ARS", symbol: "AR$", label: "AR$ ARS" },
    { code: "CLP", symbol: "CL$", label: "CL$ CLP" },
];

function detectCurrency() {
    try {
        const locale = Intl.DateTimeFormat().resolvedOptions().locale || navigator.language;
        const region = locale.split("-").pop()?.toUpperCase();
        const map = {
            US: "USD", GB: "GBP", CA: "CAD", AU: "AUD", NZ: "NZD",
            BR: "BRL", MX: "MXN", JP: "JPY", IN: "INR", ZA: "ZAR",
            CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", CO: "COP",
            AR: "ARS", CL: "CLP",
            DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR",
            PT: "EUR", IE: "EUR", AT: "EUR", BE: "EUR", FI: "EUR",
        };
        return map[region] || "USD";
    } catch {
        return "USD";
    }
}

const inputClass =
    "w-full rounded-[5px] border border-white/35 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/60 outline-none focus:border-white/70";

function EventCreatePageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const existingId = searchParams.get("id");
    const initialView = searchParams.get("view");

    const [eventId, setEventId] = useState(null);
    const [publishing, setPublishing] = useState(false);
    const [published, setPublished] = useState(initialView === "share");
    const [slug, setSlug] = useState("");
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [shareView, setShareView] = useState(initialView === "share");
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [loadingExisting, setLoadingExisting] = useState(!!existingId);
    const [hostName, setHostName] = useState("");
    const [saveMenuOpen, setSaveMenuOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [dateTime, setDateTime] = useState(() => getDefaultDate());
    const [durationMinutes, setDurationMinutes] = useState(90);
    const [locationObj, setLocationObj] = useState({ description: "", lat: null, lng: null });
    const [activityType, setActivityType] = useState("");
    const [activityTypeOther, setActivityTypeOther] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [groupSize, setGroupSize] = useState("");
    const [description, setDescription] = useState("");
    const [whatToBring, setWhatToBring] = useState([]);
    const [newBringItem, setNewBringItem] = useState("");
    const [weatherPolicy, setWeatherPolicy] = useState("Light rain OK, storms cancel");
    const [weatherOpen, setWeatherOpen] = useState(false);
    const [price, setPrice] = useState(0);
    const [currency, setCurrency] = useState(() => detectCurrency());
    const [priceLink, setPriceLink] = useState("");
    const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [isPublic, setIsPublic] = useState(true);

    const [placeholder] = useState(
        () => TITLE_PLACEHOLDERS[Math.floor(Math.random() * TITLE_PLACEHOLDERS.length)]
    );

    const saveTimer = useRef(null);
    const saveMenuRef = useRef(null);

    // Close save menu on outside click
    useEffect(() => {
        function handleClick(e) {
            if (saveMenuRef.current && !saveMenuRef.current.contains(e.target)) {
                setSaveMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Load existing event or create a new draft on mount
    useEffect(() => {
        if (existingId) {
            // Load existing event
            async function loadEvent() {
                try {
                    const res = await apiClient.get(`/events/${existingId}`);
                    setEventId(res.id || res._id);
                    setTitle(res.title || "");
                    if (res.dateTime) setDateTime(new Date(res.dateTime));
                    if (res.durationMinutes) setDurationMinutes(res.durationMinutes);
                    if (res.meetingPoint) {
                        setLocationObj({
                            description: res.meetingPoint.description || "",
                            lat: res.meetingPoint.lat ?? null,
                            lng: res.meetingPoint.lng ?? null,
                        });
                    }
                    if (res.activityType) setActivityType(res.activityType);
                    if (res.activityTypeOther) setActivityTypeOther(res.activityTypeOther);
                    if (res.difficulty) setDifficulty(res.difficulty);
                    if (res.groupSize) setGroupSize(res.groupSize);
                    if (res.description) setDescription(res.description);
                    if (res.whatToBring) setWhatToBring(res.whatToBring);
                    if (res.weatherPolicy) {
                        setWeatherPolicy(res.weatherPolicy);
                    }
                    if (res.price != null) setPrice(res.price);
                    if (res.currency) setCurrency(res.currency);
                    if (res.priceLink) setPriceLink(res.priceLink);
                    // accessibilityNotes removed
                    if (res.coverPhotoUrl) setCoverPhotoUrl(res.coverPhotoUrl);
                    if (res.isPublic !== undefined) setIsPublic(res.isPublic);
                    if (res.slug) setSlug(res.slug);
                    if (res.status === "published") setPublished(true);
                } catch (err) {
                    console.error("Failed to load event:", err);
                } finally {
                    setLoadingExisting(false);
                }
            }
            loadEvent();
        } else {
            // Create a new draft
            async function createDraft() {
                try {
                    const res = await apiClient.post("/events/create");
                    setEventId(res.id);
                } catch (err) {
                    console.error("Failed to create draft:", err);
                }
            }
            createDraft();
        }
    }, [existingId]);

    // Load host profile name
    useEffect(() => {
        async function loadHost() {
            try {
                const res = await apiClient.get("/user");
                setHostName(res.name || "");
            } catch (_err) {
                // ignore
            }
        }
        loadHost();
    }, []);

    // Auto-save (debounced)
    const autoSave = useCallback(
        (fields) => {
            if (!eventId) return;
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(async () => {
                try {
                    await apiClient.patch(`/events/${eventId}`, fields);
                } catch (err) {
                    console.error("Auto-save failed:", err);
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
            dateTime: dateTime instanceof Date && !isNaN(dateTime.getTime())
                ? dateTime.toISOString()
                : null,
            durationMinutes,
            meetingPoint: locationObj.description?.trim()
                ? {
                    description: locationObj.description.trim(),
                    ...(locationObj.lat != null && locationObj.lng != null
                        ? { lat: locationObj.lat, lng: locationObj.lng }
                        : {}),
                }
                : null,
            activityType,
            activityTypeOther,
            difficulty,
            groupSize,
            description,
            whatToBring,
            weatherPolicy,
            price,
            currency,
            priceLink,
            coverPhotoUrl,
            isPublic,
        });
    }, [
        eventId, title, dateTime, durationMinutes, locationObj, activityType,
        activityTypeOther, difficulty, groupSize, description, whatToBring,
        weatherPolicy, price, currency, priceLink,
        coverPhotoUrl, isPublic, autoSave,
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activityType, difficulty, description, whatToBring.length]);

    // Publish — stay on page, show share view
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
            setShareView(true);
        } catch (err) {
            console.error("Publish failed:", err);
        } finally {
            setPublishing(false);
        }
    }

    // Copy link to clipboard
    async function copyLink() {
        const url = typeof window !== "undefined"
            ? `${window.location.origin}/e/${slug}`
            : `/e/${slug}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const input = document.createElement("input");
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    // Download story card image
    async function downloadStoryCard() {
        setDownloading(true);
        try {
            const res = await fetch(`/api/events/${eventId}/story-card`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${slug}-story.png`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
        } finally {
            setDownloading(false);
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

    // Check if required fields present for publish
    const canPublish = title.trim() && dateTime && locationObj.description?.trim();

    if (loadingExisting) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                <span className="text-white/40">Loading...</span>
            </div>
        );
    }

    // ── SHARE VIEW (post-publish) ──
    if (shareView && published && slug) {
        const eventUrl = typeof window !== "undefined"
            ? `${window.location.origin}/e/${slug}`
            : `/e/${slug}`;

        return (
            <div className="min-h-screen bg-black text-white">
                <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <button
                            onClick={() => router.push("/events")}
                            className="text-sm text-white/60 hover:text-white"
                        >
                            ← Events
                        </button>
                        <button
                            onClick={() => setShareView(false)}
                            className="text-sm text-white/60 hover:text-white"
                        >
                            Edit
                        </button>
                    </div>

                    {/* Story card preview */}
                    <div className="mx-auto max-w-[280px]">
                        <StoryCardPreview
                            title={title}
                            dateTime={dateTime instanceof Date ? dateTime.toISOString() : dateTime}
                            activityType={activityType === "other" ? activityTypeOther : activityType}
                            groupSize={groupSize}
                            hostName={hostName}
                            slug={slug}
                            published={true}
                            eventId={eventId}
                            coverPhotoUrl={coverPhotoUrl}
                            price={price}
                            hideDownload={true}
                            location={locationObj.description}
                            durationMinutes={durationMinutes}
                            currency={currency}
                        />
                    </div>

                    {/* Share actions */}
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={copyLink}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-stone-800 transition hover:bg-white/90"
                        >
                            {copied ? "Copied!" : "Copy Link"}
                        </button>
                        <button
                            onClick={downloadStoryCard}
                            disabled={downloading}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:opacity-50"
                        >
                            {downloading ? "..." : "Download Image"}
                        </button>
                    </div>

                    {/* Event URL display */}
                    <p className="mt-4 text-center text-xs text-white/30">
                        {eventUrl}
                    </p>
                </div>
            </div>
        );
    }

    // ── CREATE / EDIT VIEW ──
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:max-w-5xl">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <button
                        onClick={() => router.push("/events")}
                        className="text-sm text-white/60 hover:text-white"
                    >
                        ← Back
                    </button>
                    {!published ? (
                        <div ref={saveMenuRef} className="relative">
                            <button
                                onClick={() => setSaveMenuOpen(!saveMenuOpen)}
                                disabled={publishing}
                                className="btn flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {publishing ? "Publishing..." : "Save ▾"}
                            </button>
                            {saveMenuOpen && (
                                <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-white/15 bg-[#1c1917] shadow-xl">
                                    <button
                                        onClick={() => {
                                            setSaveMenuOpen(false);
                                            router.push("/events");
                                        }}
                                        className="block w-full px-4 py-2.5 text-left text-sm text-white/70 hover:bg-white/10"
                                    >
                                        Save draft
                                    </button>
                                    <div className="border-t border-white/10" />
                                    <button
                                        onClick={() => {
                                            setSaveMenuOpen(false);
                                            handlePublish();
                                        }}
                                        disabled={!canPublish}
                                        className="block w-full px-4 py-2.5 text-left text-sm font-medium text-white hover:bg-white/10 disabled:opacity-40"
                                    >
                                        Publish
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setShareView(true)}
                            className="btn"
                        >
                            Save →
                        </button>
                    )}
                </div>

                {/* ─── Two-column layout on desktop ─── */}
                <div className="lg:flex lg:gap-10">
                    {/* ─── LEFT: Form ─── */}
                    <div className="lg:flex-1">

                        {/* Title (above the image) */}
                        <textarea
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value.replace(/\n/g, ""));
                                e.target.style.height = "auto";
                                e.target.style.height = e.target.scrollHeight + "px";
                            }}
                            placeholder={placeholder}
                            maxLength={80}
                            rows={1}
                            className="mb-6 w-full resize-none overflow-hidden border-0 bg-transparent font-serif text-3xl italic text-white placeholder-white/30 outline-none focus:ring-0 sm:text-4xl"
                            style={{ lineHeight: 1.8, paddingBottom: "0.5em" }}
                        />

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
                                        <span className="text-sm">Add photo</span>
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

                        {/* Public / Private toggle */}
                        <div className="mb-6 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsPublic(!isPublic)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${isPublic ? "bg-green-500" : "bg-white/20"
                                    }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isPublic ? "translate-x-5" : "translate-x-0"
                                        }`}
                                />
                            </button>
                            <div>
                                <span className="text-sm font-medium text-white">
                                    {isPublic ? "Public" : "Private"}
                                </span>
                                <p className="text-xs text-white/40">
                                    {isPublic
                                        ? "Visible on Explore page"
                                        : "Only people with the link can see this"}
                                </p>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="mb-4">
                            <label className="mb-1 flex items-center gap-1 text-sm font-medium text-white/60">
                                Date & Time <span className="text-red-400">*</span>
                            </label>
                            <DateTimePicker
                                value={dateTime}
                                onChange={(date) => setDateTime(date)}
                                placeholder="Pick a date & time"
                            />
                        </div>

                        {/* Location */}
                        <div className="mb-6">
                            <label className="mb-1 flex items-center gap-1 text-sm font-medium text-white/60">
                                Location <span className="text-red-400">*</span>
                            </label>
                            <LocationPicker
                                value={locationObj}
                                onChange={setLocationObj}
                            />
                        </div>

                        {/* ─── ADD DETAILS ACCORDION ─── */}

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
                                {/* Duration */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-white/60">
                                        Duration
                                    </label>
                                    <select
                                        value={durationMinutes}
                                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                                        className={inputClass}
                                    >
                                        {DURATION_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
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
                                        Group Size (optional)
                                    </label>
                                    <input
                                        type="number"
                                        value={groupSize}
                                        onChange={(e) => setGroupSize(e.target.value === "" ? "" : Number(e.target.value))}
                                        min={2}
                                        max={100}
                                        placeholder="Leave empty if no limit"
                                        className={`w-full ${inputClass}`}
                                    />
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
                                                <span>• {item}</span>
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

                                {/* Weather / Rain Policy — collapsible */}
                                <div>
                                    <button
                                        onClick={() => setWeatherOpen(!weatherOpen)}
                                        className="flex w-full items-center gap-2 text-sm font-medium text-white/60 hover:text-white"
                                    >
                                        <span
                                            className="inline-block transition-transform"
                                            style={{ transform: weatherOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                                        >
                                            ▸
                                        </span>
                                        Rain policy
                                        {weatherPolicy && (
                                            <span className="ml-auto text-xs text-white/40">{weatherPolicy}</span>
                                        )}
                                    </button>
                                    {weatherOpen && (
                                        <div className="mt-3 space-y-2">
                                            {WEATHER_PRESETS.map((preset) => (
                                                <button
                                                    key={preset}
                                                    onClick={() => setWeatherPolicy(preset)}
                                                    className={`block w-full rounded-[5px] border px-4 py-2 text-left text-sm transition ${weatherPolicy === preset
                                                        ? "border-white bg-white/20 text-white"
                                                        : "border-white/30 text-white/70 hover:border-white"
                                                        }`}
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-white/60">
                                        Price
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="rounded-[5px] border border-white/35 bg-white/[0.04] px-2 py-3 text-sm text-white outline-none focus:border-white/70"
                                        >
                                            {CURRENCIES.map((c) => (
                                                <option key={c.code} value={c.code}>
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
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


                            </div>
                        )}

                    </div>{/* end left column */}

                    {/* ─── RIGHT: Live Story Card Preview (desktop: sticky sidebar) ─── */}
                    <div className="mt-10 border-t border-white/10 pt-8 lg:mt-0 lg:w-[300px] lg:flex-shrink-0 lg:border-t-0 lg:pt-0">
                        <div className="lg:sticky lg:top-8">
                            <h3 className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-white/40">
                                Story card preview
                            </h3>
                            <div className="mx-auto max-w-[260px]">
                                <StoryCardPreview
                                    title={title}
                                    dateTime={dateTime instanceof Date ? dateTime.toISOString() : dateTime}
                                    activityType={activityType === "other" ? activityTypeOther : activityType}
                                    groupSize={groupSize}
                                    hostName={hostName}
                                    slug={slug}
                                    published={published}
                                    eventId={eventId}
                                    coverPhotoUrl={coverPhotoUrl}
                                    price={price}
                                    location={locationObj.description}
                                    durationMinutes={durationMinutes}
                                    currency={currency}
                                />
                            </div>
                        </div>
                    </div>
                </div>{/* end two-column wrapper */}
            </div>
        </div>
    );
}

// Wrap in Suspense for useSearchParams
export default function EventCreatePage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                <span className="text-white/40">Loading...</span>
            </div>
        }>
            <EventCreatePageInner />
        </Suspense>
    );
}
