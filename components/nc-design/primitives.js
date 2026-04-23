"use client";

import React from "react";

// ───────── Icons (stroked, 1.5, round) ─────────
export const I = {
  home: (c = "currentColor") => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2v-9z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  compass: (c = "currentColor") => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.5" />
      <path d="M15.5 8.5L13 13l-4.5 2.5L11 11l4.5-2.5z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  calendar: (c = "currentColor") => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke={c} strokeWidth="1.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  user: (c = "currentColor") => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.5" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  menu: (c = "currentColor") => (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
      <path d="M1 1.5h20M1 8h20M1 14.5h20" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  close: (c = "currentColor") => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 4l12 12M16 4L4 16" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  arrowRight: (c = "currentColor") => (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
      <path d="M1 7h15m0 0l-6-6m6 6l-6 6" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  arrowUpRight: (c = "currentColor") => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 11L11 3m0 0H5m6 0v6" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chevL: (c = "currentColor") => (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
      <path d="M8 1L2 8l6 7" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chevR: (c = "currentColor") => (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
      <path d="M1 1l6 6-6 6" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  pin: (c = "currentColor") => (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
      <path d="M7 15s5-4.5 5-9a5 5 0 10-10 0c0 4.5 5 9 5 9z" stroke={c} strokeWidth="1.4" />
      <circle cx="7" cy="6" r="1.8" stroke={c} strokeWidth="1.4" />
    </svg>
  ),
  clock: (c = "currentColor") => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke={c} strokeWidth="1.4" />
      <path d="M7 3.5V7l2.5 1.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  heart: (c = "currentColor", fill = "none") => (
    <svg width="18" height="16" viewBox="0 0 18 16" fill={fill}>
      <path d="M9 14.5S1.5 10.5 1.5 5.5a4 4 0 017.5-1.8A4 4 0 0116.5 5.5c0 5-7.5 9-7.5 9z" stroke={c} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  share: (c = "currentColor") => (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
      <path d="M8 1v11M8 1L4 5m4-4l4 4M2 11v5a1 1 0 001 1h10a1 1 0 001-1v-5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  filter: (c = "currentColor") => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 4h14M4 9h10M6 14h6" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  map: (c = "currentColor") => (
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
      <path d="M1 3l6-2 6 2 6-2v14l-6 2-6-2-6 2V3z" stroke={c} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7 1v14M13 3v14" stroke={c} strokeWidth="1.4" />
    </svg>
  ),
  check: (c = "currentColor") => (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
      <path d="M1 7l5 5L17 1" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  plus: (c = "currentColor") => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1v14M1 8h14" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  leaf: (c = "currentColor") => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M16 2s-9 0-12 4-2 8-2 8 4 0 8-2 6-4 6-10z" stroke={c} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M2 16S7 11 12 7" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  walk: (c = "currentColor") => (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
      <circle cx="8" cy="2" r="1.4" stroke={c} strokeWidth="1.3" />
      <path d="M4.5 7l2.3-2.4a1.4 1.4 0 012 0l1.7 1.7 2 1M6.8 5.3L5.3 9l-1.8 2.6M8.3 9l2 2 .9 3.5M7.5 7.5L6.6 15" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  bike: (c = "currentColor") => (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
      <circle cx="4" cy="10" r="3" stroke={c} strokeWidth="1.3" />
      <circle cx="14" cy="10" r="3" stroke={c} strokeWidth="1.3" />
      <path d="M4 10l4-5h3l3 5M8 5l-1.5-3H5M11 5l1-2h1.5" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function NatureClubWordmark({ height = 22, style = {} }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/nc/logo-light.svg"
      alt="Nature Club"
      style={{
        height,
        width: "auto",
        display: "block",
        filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.35))",
        ...style,
      }}
    />
  );
}

export function Caps({ children, style = {}, className }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        fontWeight: 500,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Italic({ children, size = 32, weight = 400, color = "#fafaf9", style = {} }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
        fontStyle: "italic",
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.05,
        letterSpacing: "-0.01em",
        color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function ProgressRing({ size = 54, stroke = 3, progress = 0.35, color = "#fafaf9", track = "rgba(255,255,255,0.2)" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - progress)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

export function AvatarStack({ imgs, size = 28, border = "#0a0a0a" }) {
  return (
    <div style={{ display: "flex" }}>
      {imgs.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={src}
          alt=""
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            border: `2px solid ${border}`,
            marginLeft: i === 0 ? 0 : -size * 0.35,
            position: "relative",
            zIndex: imgs.length - i,
          }}
        />
      ))}
    </div>
  );
}

export function TabBar({ active, onNav, dark = true, overlay = false }) {
  const tabs = [
    { key: "home", label: "Home", icon: I.home },
    { key: "discover", label: "Discover", icon: I.compass },
    { key: "plans", label: "Plans", icon: I.calendar },
    { key: "you", label: "You", icon: I.user },
  ];
  const bg = dark ? "rgba(10,10,10,0.82)" : "rgba(250,249,246,0.92)";
  const line = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const mute = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const active_c = dark ? "#fafaf9" : "#0a0a0a";
  const activeNorm = active === "calendar" ? "plans" : active === "profile" ? "you" : active;

  const positionStyle = overlay
    ? { position: "absolute", bottom: 0, left: 0, right: 0 }
    : { position: "sticky", bottom: 0, marginTop: "auto" };

  return (
    <div
      style={{
        ...positionStyle,
        zIndex: 30,
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        background: bg,
        borderTop: `0.5px solid ${line}`,
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        paddingTop: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        {tabs.map((t) => {
          const is = activeNorm === t.key;
          const c = is ? active_c : mute;
          return (
            <button
              key={t.key}
              onClick={() => onNav?.(t.key)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "6px 10px",
                color: c,
              }}
            >
              {t.icon(c)}
              <span style={{ fontSize: 10, fontFamily: "var(--font-inter), Inter, sans-serif", letterSpacing: 0.1 }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function StatusBar({ dark = true, time = "9:41" }) {
  const c = dark ? "#fff" : "#000";
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 25,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 28px 0",
        pointerEvents: "none",
      }}
    >
      <span style={{ fontFamily: "-apple-system, SF Pro, system-ui", fontWeight: 600, fontSize: 15, color: c }}>{time}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <svg width="16" height="10" viewBox="0 0 16 10">
          <rect x="0" y="6" width="2.5" height="4" rx="0.5" fill={c} />
          <rect x="4" y="4" width="2.5" height="6" rx="0.5" fill={c} />
          <rect x="8" y="2" width="2.5" height="8" rx="0.5" fill={c} />
          <rect x="12" y="0" width="2.5" height="10" rx="0.5" fill={c} />
        </svg>
        <svg width="22" height="11" viewBox="0 0 22 11">
          <rect x="0.5" y="0.5" width="19" height="10" rx="2.5" stroke={c} strokeOpacity="0.4" fill="none" />
          <rect x="2" y="2" width="16" height="7" rx="1.5" fill={c} />
          <rect x="20.5" y="3.5" width="1.5" height="4" rx="0.5" fill={c} fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
