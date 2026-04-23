"use client";

import React from "react";
import { Caps, I, Italic, NatureClubWordmark } from "../primitives";
import LocationPicker from "@/components/LocationPicker";

export default function NewEvent({ initial, onBack, onSave }) {
  const [draft, setDraft] = React.useState({
    title: initial?.title || "",
    activityType: initial?.activityType || "nature-walk",
    date: initial?.date || "",
    time: initial?.time || "",
    durationMinutes: initial?.durationMinutes || 90,
    location: initial?.location || "",
    lat: initial?.lat ?? null,
    lng: initial?.lng ?? null,
    capacity: initial?.capacity || 12,
    price: initial?.price ?? 0,
    currency: initial?.currency || "USD",
    isPublic: initial?.isPublic ?? true,
    about: initial?.about || "",
    img: initial?.img || "/nc/img/6.png",
    coverPhotoUrl: initial?.coverPhotoUrl || initial?.img || "/nc/img/6.png",
    bring: initial?.bring || [],
  });
  const fileInputRef = React.useRef(null);
  const [uploading, setUploading] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [publishMenu, setPublishMenu] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [err, setErr] = React.useState("");

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const activityTypes = [
    { id: "nature-walk", label: "Nature Walk" },
    { id: "hike", label: "Hike" },
    { id: "bird-walk", label: "Bird Walk" },
    { id: "forest-bathing", label: "Forest Bathing" },
    { id: "foraging", label: "Foraging" },
    { id: "outdoor-yoga", label: "Outdoor Yoga" },
    { id: "meditation", label: "Meditation" },
    { id: "other", label: "Other" },
  ];
  const covers = ["6.png", "11.png", "14.png", "17.png"];

  async function handleSave(publish) {
    setPending(true);
    setErr("");
    try {
      await onSave?.({ draft, publish });
    } catch (ex) {
      setErr(ex?.message || "Save failed");
    } finally {
      setPending(false);
      setPublishMenu(false);
    }
  }

  async function handleUpload(file) {
    if (!file) return;
    setUploading(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      const { url } = await res.json();
      setDraft((d) => ({ ...d, img: url, coverPhotoUrl: url }));
    } catch (ex) {
      setErr(ex?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="nc-no-scrollbar"
      style={{ position: "absolute", inset: 0, overflow: "auto", background: "#0a0a0a", paddingBottom: 40 }}
    >
      

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          padding: "max(16px, env(safe-area-inset-top)) 16px 12px",
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(14px)",
          borderBottom: "0.5px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.75)",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 13,
            cursor: "pointer",
            padding: 6,
          }}
        >
          Cancel
        </button>
        <Caps style={{ color: "rgba(255,255,255,0.55)" }}>New event</Caps>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setPublishMenu(!publishMenu)}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              background: draft.title ? "#fafaf9" : "rgba(255,255,255,0.12)",
              color: draft.title ? "#0a0a0a" : "rgba(255,255,255,0.4)",
              border: "none",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 12,
              fontWeight: 500,
              cursor: draft.title ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Save
            <svg width="10" height="6" viewBox="0 0 10 6">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </button>
          {publishMenu && draft.title && (
            <div onClick={() => setPublishMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 30 }}>
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  top: 100,
                  right: 16,
                  minWidth: 180,
                  padding: 6,
                  borderRadius: 12,
                  background: "#1a1714",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
                }}
              >
                <button disabled={pending} onClick={() => handleSave(true)} style={menuItem}>
                  {pending ? "Saving…" : "Publish now"}
                </button>
                <button disabled={pending} onClick={() => handleSave(false)} style={menuItem}>
                  {pending ? "Saving…" : "Save draft"}
                </button>
                <button
                  onClick={() => setPublishMenu(false)}
                  style={{ ...menuItem, color: "rgba(255,255,255,0.55)" }}
                >
                  Keep editing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "18px 20px 0" }}>
        <Caps style={{ color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 10 }}>
          Live preview
        </Caps>
        <PreviewCard draft={draft} />
      </div>

      <div style={{ padding: "26px 20px 0", display: "flex", flexDirection: "column", gap: 22 }}>
        <Field label="Title">
          <input
            value={draft.title}
            onChange={(ev) => set("title", ev.target.value)}
            placeholder="What are you gathering for?"
            style={inputStyle}
          />
        </Field>

        <Field label="Cover">
          <div style={{ display: "flex", gap: 8 }}>
            {covers.map((c) => {
              const path = `/nc/img/${c}`;
              const on = draft.img === path;
              return (
                <button
                  key={c}
                  onClick={() =>
                    setDraft((d) => ({ ...d, img: path, coverPhotoUrl: path }))
                  }
                  style={{
                    width: 56,
                    height: 68,
                    borderRadius: 8,
                    overflow: "hidden",
                    padding: 0,
                    border: on ? "2px solid #c8d9a8" : "0.5px solid rgba(255,255,255,0.12)",
                    background: "none",
                    cursor: "pointer",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={path} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              );
            })}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                width: 56,
                height: 68,
                borderRadius: 8,
                background: "rgba(255,255,255,0.04)",
                border: "0.5px dashed rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.5)",
                cursor: uploading ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: uploading ? 0.5 : 1,
              }}
            >
              {uploading ? "…" : I.plus("rgba(255,255,255,0.5)")}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={(ev) => handleUpload(ev.target.files?.[0])}
            />
          </div>
        </Field>

        <Field label="Type">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {activityTypes.map((t) => {
              const on = t.id === draft.activityType;
              return (
                <button
                  key={t.id}
                  onClick={() => set("activityType", t.id)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 999,
                    background: on ? "#fafaf9" : "transparent",
                    color: on ? "#0a0a0a" : "rgba(255,255,255,0.75)",
                    border: on ? "none" : "0.5px solid rgba(255,255,255,0.18)",
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </Field>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Field label="Date" flex>
            <input
              type="date"
              value={draft.date}
              onChange={(ev) => set("date", ev.target.value)}
              style={{ ...inputStyle, minWidth: 0 }}
            />
          </Field>
          <Field label="Time" flex>
            <input
              type="time"
              value={draft.time}
              onChange={(ev) => set("time", ev.target.value)}
              style={{ ...inputStyle, minWidth: 0 }}
            />
          </Field>
        </div>

        <Field label="Meeting point">
          <LocationPicker
            value={{
              description: draft.location,
              lat: draft.lat,
              lng: draft.lng,
            }}
            onChange={(loc) =>
              setDraft((d) => ({
                ...d,
                location: loc.description || "",
                lat: loc.lat ?? null,
                lng: loc.lng ?? null,
              }))
            }
          />
        </Field>

        <Field label="Visibility">
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: "rgba(255,255,255,0.03)",
              border: "0.5px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 13,
                  color: "#fafaf9",
                }}
              >
                {draft.isPublic ? "Open to all members" : "Private · invite only"}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                  marginTop: 3,
                }}
              >
                {draft.isPublic
                  ? "Shows up in Discover feed"
                  : "Only people you share the link with"}
              </div>
            </div>
            <Toggle on={draft.isPublic} onToggle={() => set("isPublic", !draft.isPublic)} />
          </div>
        </Field>

        <div>
          <button
            onClick={() => setDetailsOpen(!detailsOpen)}
            style={{
              width: "100%",
              padding: "14px 0",
              background: "transparent",
              border: "none",
              borderTop: "0.5px solid rgba(255,255,255,0.08)",
              borderBottom: detailsOpen ? "none" : "0.5px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#fafaf9",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Add details{" "}
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
              Duration · Difficulty · What to bring · Price {detailsOpen ? "▴" : "▾"}
            </span>
          </button>
          {detailsOpen && (
            <div
              style={{
                paddingTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 18,
                borderBottom: "0.5px solid rgba(255,255,255,0.08)",
                paddingBottom: 18,
              }}
            >
              <Field label="About">
                <textarea
                  value={draft.about}
                  onChange={(ev) => set("about", ev.target.value)}
                  placeholder="What is this night about?"
                  style={{ ...inputStyle, minHeight: 80, resize: "none", paddingTop: 10 }}
                />
              </Field>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Field label="Duration (min)" flex>
                  <input
                    type="number"
                    min={15}
                    max={480}
                    value={draft.durationMinutes}
                    onChange={(ev) => set("durationMinutes", Number(ev.target.value))}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Capacity" flex>
                  <input
                    type="number"
                    min={2}
                    max={100}
                    value={draft.capacity}
                    onChange={(ev) => set("capacity", Number(ev.target.value))}
                    style={inputStyle}
                  />
                </Field>
              </div>
              <PriceField
                price={draft.price}
                currency={draft.currency}
                onPriceChange={(v) => set("price", v)}
                onCurrencyChange={(c) => set("currency", c)}
              />
            </div>
          )}
        </div>

        {err && (
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: "rgba(233,120,100,0.1)",
              border: "0.5px solid rgba(233,120,100,0.3)",
              color: "#e97864",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 12,
            }}
          >
            {err}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  background: "rgba(255,255,255,0.04)",
  border: "0.5px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  color: "#fafaf9",
  fontFamily: "var(--font-inter), Inter, sans-serif",
  fontSize: 14,
  outline: "none",
};

const menuItem = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  background: "transparent",
  border: "none",
  color: "#fafaf9",
  fontFamily: "var(--font-inter), Inter, sans-serif",
  fontSize: 13,
  textAlign: "left",
  cursor: "pointer",
};

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "CAD", symbol: "CA$" },
  { code: "AUD", symbol: "A$" },
  { code: "NZD", symbol: "NZ$" },
  { code: "JPY", symbol: "¥" },
  { code: "MXN", symbol: "MX$" },
  { code: "BRL", symbol: "R$" },
  { code: "SEK", symbol: "kr" },
  { code: "NOK", symbol: "kr" },
  { code: "DKK", symbol: "kr" },
  { code: "CHF", symbol: "CHF" },
  { code: "INR", symbol: "₹" },
  { code: "ZAR", symbol: "R" },
];

function PriceField({ price, currency, onPriceChange, onCurrencyChange }) {
  const presets = [0, 5, 15, 25];
  const isPreset = presets.includes(price);
  const [otherOn, setOtherOn] = React.useState(!isPreset && price > 0);
  const sym = CURRENCIES.find((c) => c.code === currency)?.symbol || "$";

  return (
    <Field label="Price">
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <select
          value={currency}
          onChange={(ev) => onCurrencyChange?.(ev.target.value)}
          style={{
            padding: "10px 8px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
            border: "0.5px solid rgba(255,255,255,0.18)",
            color: "#fafaf9",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 12,
            cursor: "pointer",
            outline: "none",
          }}
          aria-label="Currency"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code} style={{ background: "#1a1714" }}>
              {c.code}
            </option>
          ))}
        </select>
        <div style={{ flex: 1, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {presets.map((v) => {
            const on = !otherOn && price === v;
            return (
              <button
                key={v}
                onClick={() => {
                  setOtherOn(false);
                  onPriceChange?.(v);
                }}
                style={{
                  flex: 1,
                  minWidth: 52,
                  padding: "10px 0",
                  borderRadius: 8,
                  background: on ? "#fafaf9" : "transparent",
                  color: on ? "#0a0a0a" : "rgba(255,255,255,0.75)",
                  border: on ? "none" : "0.5px solid rgba(255,255,255,0.18)",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {v === 0 ? "Free" : `${sym}${v}`}
              </button>
            );
          })}
          <button
            onClick={() => {
              setOtherOn(true);
              if (isPreset) onPriceChange?.(10);
            }}
            style={{
              flex: 1,
              minWidth: 62,
              padding: "10px 0",
              borderRadius: 8,
              background: otherOn ? "#fafaf9" : "transparent",
              color: otherOn ? "#0a0a0a" : "rgba(255,255,255,0.75)",
              border: otherOn ? "none" : "0.5px solid rgba(255,255,255,0.18)",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Other
          </button>
        </div>
      </div>
      {otherOn && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              padding: "12px 12px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 14,
            }}
          >
            {sym}
          </div>
          <input
            type="number"
            min={0}
            step={1}
            value={price}
            onChange={(ev) => onPriceChange?.(Number(ev.target.value) || 0)}
            placeholder="Custom amount"
            style={{
              flex: 1,
              padding: "12px 14px",
              background: "rgba(255,255,255,0.04)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              color: "#fafaf9",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>
      )}
    </Field>
  );
}

function Field({ label, flex, children }) {
  return (
    <div style={{ flex: flex ? 1 : undefined, minWidth: flex ? 140 : undefined }}>
      <Caps style={{ color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 8 }}>{label}</Caps>
      {children}
    </div>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        padding: 2,
        background: on ? "#c8d9a8" : "rgba(255,255,255,0.14)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: on ? "#0a0a0a" : "#fafaf9",
          transform: `translateX(${on ? 18 : 0}px)`,
          transition: "transform 0.2s",
        }}
      />
    </button>
  );
}

const ACTIVITY_LABELS = {
  "nature-walk": "Nature Walk",
  hike: "Hike",
  "bird-walk": "Bird Walk",
  "forest-bathing": "Forest Bathing",
  foraging: "Foraging",
  "outdoor-yoga": "Outdoor Yoga",
  meditation: "Meditation",
  other: "Other",
};

function PreviewCard({ draft }) {
  const title = draft.title || "Your event title";
  const placeholder = !draft.title;
  const typeLabel = ACTIVITY_LABELS[draft.activityType] || "Event";
  const dateDisplay = draft.date
    ? new Date(`${draft.date}T${draft.time || "00:00"}`).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "Date TBA";
  const timeDisplay = draft.time
    ? new Date(`2000-01-01T${draft.time}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "Time TBA";
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "4 / 5",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={draft.img}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0.15) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 18,
          left: 18,
        }}
      >
        <NatureClubWordmark height={22} color="rgba(255,255,255,0.92)" />
      </div>

      <div
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          padding: "4px 10px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(10px)",
          color: "#fafaf9",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {typeLabel}
      </div>

      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          top: "40%",
          transform: "translateY(-50%)",
        }}
      >
        <Italic
          size={32}
          color={placeholder ? "rgba(255,255,255,0.5)" : "#fafaf9"}
          style={{
            display: "block",
            textShadow: "0 2px 16px rgba(0,0,0,0.4)",
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </Italic>
      </div>

      <div style={{ position: "absolute", left: 22, bottom: 22, right: 90 }}>
        <div
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 13,
            color: "#fafaf9",
            textShadow: "0 1px 6px rgba(0,0,0,0.4)",
          }}
        >
          {dateDisplay}
        </div>
        <div
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.8)",
            marginTop: 2,
            textShadow: "0 1px 6px rgba(0,0,0,0.4)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {timeDisplay} · {draft.location || "Meeting point TBA"}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 18,
          bottom: 18,
          width: 68,
          height: 68,
          borderRadius: "50%",
          background: "#fafaf9",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
        }}
      >
        <Italic size={16} color="#0a0a0a" style={{ lineHeight: 1 }}>
          RSVP
        </Italic>
      </div>
    </div>
  );
}
