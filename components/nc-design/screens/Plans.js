"use client";

import React from "react";
import { AvatarStack, Caps, I, Italic, TabBar } from "../primitives";

const TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "hosting", label: "Hosting" },
  { id: "drafts", label: "Drafts" },
  { id: "past", label: "Past" },
];

export default function Plans({
  upcoming = [],
  hosting = [],
  drafts = [],
  past = [],
  onOpenEvent,
  onEditEvent,
  onNewEvent,
  onNav,
  onMenuAction,
}) {
  const [tab, setTab] = React.useState("upcoming");
  const [menuFor, setMenuFor] = React.useState(null);

  const counts = {
    upcoming: upcoming.length,
    hosting: hosting.length,
    drafts: drafts.length,
    past: past.length,
  };

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#0a0a0a" }}>
      <div
        className="nc-no-scrollbar"
        style={{
          position: "absolute",
          inset: 0,
          overflowY: "auto",
          paddingBottom: 90,
        }}
      >
        <div
          style={{
            padding: "max(16px, env(safe-area-inset-top)) 20px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Caps style={{ color: "rgba(255,255,255,0.45)" }}>Your plans</Caps>
          {onNewEvent && (
            <button
              onClick={onNewEvent}
              aria-label="New event"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#fafaf9",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {I.plus("#0a0a0a")}
            </button>
          )}
        </div>

        <div style={{ padding: "14px 20px 0" }}>
          <Italic size={34} style={{ display: "block" }}>
            What&apos;s ahead.
          </Italic>
        </div>

        <div
          style={{
            padding: "0 20px",
            display: "flex",
            gap: 0,
            marginTop: 18,
            marginBottom: 18,
          }}
        >
          {TABS.map((t) => (
            <Seg
              key={t.id}
              on={tab === t.id}
              onClick={() => setTab(t.id)}
              label={`${t.label} · ${counts[t.id]}`}
            />
          ))}
        </div>

        {tab === "upcoming" && (
          <TabList>
            {upcoming.length === 0 ? (
              <Empty
                title="Nothing on the calendar yet."
                sub="RSVP to something in Discover or host your own."
              />
            ) : (
              upcoming.map((e, i) => (
                <UpcomingCard
                  key={e.id}
                  e={e}
                  index={i}
                  onClick={() => onOpenEvent?.(e.id)}
                />
              ))
            )}
          </TabList>
        )}

        {tab === "hosting" && (
          <TabList>
            {hosting.length === 0 ? (
              <Empty
                title="Not hosting anything yet."
                sub="Tap + to create your first event."
              />
            ) : (
              hosting.map((e) => (
                <HostCard
                  key={e.id}
                  e={e}
                  status="live"
                  menuOpen={menuFor === e.id}
                  onMenu={() => setMenuFor(menuFor === e.id ? null : e.id)}
                  onClose={() => setMenuFor(null)}
                  onAction={(action) => {
                    setMenuFor(null);
                    onMenuAction?.(action, e);
                  }}
                  onClick={() => onOpenEvent?.(e.id)}
                />
              ))
            )}
          </TabList>
        )}

        {tab === "drafts" && (
          <TabList>
            {drafts.length === 0 ? (
              <Empty
                title="No drafts right now."
                sub="Tap + to start shaping an event."
              />
            ) : (
              drafts.map((e) => (
                <HostCard
                  key={e.id}
                  e={e}
                  status="draft"
                  menuOpen={menuFor === e.id}
                  onMenu={() => setMenuFor(menuFor === e.id ? null : e.id)}
                  onClose={() => setMenuFor(null)}
                  onAction={(action) => {
                    setMenuFor(null);
                    onMenuAction?.(action, e);
                  }}
                  onClick={() => onEditEvent?.(e)}
                />
              ))
            )}
          </TabList>
        )}

        {tab === "past" && (
          <TabList>
            {past.length === 0 ? (
              <Empty title="No past events." sub="Events you've attended show up here." />
            ) : (
              past.map((e) =>
                e.isOwner ? (
                  <HostCard
                    key={e.id}
                    e={e}
                    status="past"
                    menuOpen={menuFor === e.id}
                    onMenu={() => setMenuFor(menuFor === e.id ? null : e.id)}
                    onClose={() => setMenuFor(null)}
                    onAction={(action) => {
                      setMenuFor(null);
                      onMenuAction?.(action, e);
                    }}
                    onClick={() => onOpenEvent?.(e.id)}
                  />
                ) : (
                  <PastRow key={e.id} e={e} onClick={() => onOpenEvent?.(e.id)} />
                )
              )
            )}
          </TabList>
        )}
      </div>

      <TabBar active="plans" onNav={onNav} overlay />
    </div>
  );
}

function TabList({ children }) {
  return (
    <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      {children}
    </div>
  );
}

function Empty({ title, sub }) {
  return (
    <div style={{ padding: "40px 0 20px", textAlign: "center" }}>
      <Italic size={20} style={{ display: "block", color: "rgba(255,255,255,0.7)" }}>
        {title}
      </Italic>
      {sub && (
        <p
          style={{
            marginTop: 10,
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function UpcomingCard({ e, index, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: 14,
        borderRadius: 14,
        background: "rgba(255,255,255,0.04)",
        border: "0.5px solid rgba(255,255,255,0.08)",
        display: "flex",
        gap: 14,
        alignItems: "stretch",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 62,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px 0",
          borderRadius: 10,
          background: "rgba(200,217,168,0.08)",
          border: "0.5px solid rgba(200,217,168,0.2)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 10,
            textTransform: "uppercase",
            color: "#c8d9a8",
            letterSpacing: "0.14em",
          }}
        >
          {e.month || ""}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-playfair), "Playfair Display", serif',
            fontStyle: "italic",
            fontSize: 28,
            color: "#fafaf9",
            lineHeight: 1,
            marginTop: 4,
          }}
        >
          {e.day || ""}
        </div>
        <div
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 10,
            color: "rgba(255,255,255,0.5)",
            marginTop: 3,
          }}
        >
          {e.weekday || ""}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Italic size={18} style={{ display: "block", letterSpacing: "-0.01em" }}>
          {e.title}
        </Italic>
        <div
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.55)",
            marginTop: 6,
          }}
        >
          {e.time}
          {e.location ? ` · ${e.location.split("·")[0].trim()}` : ""}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          {e.attendees?.length > 0 && (
            <AvatarStack imgs={e.attendees.slice(0, 3)} size={22} border="#0a0a0a" />
          )}
          <span
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 10,
              padding: "3px 8px",
              borderRadius: 999,
              background: e.isOwner
                ? "rgba(250,249,246,0.14)"
                : "rgba(200,217,168,0.14)",
              color: e.isOwner ? "#fafaf9" : "#c8d9a8",
              letterSpacing: "0.04em",
            }}
          >
            {e.isOwner ? "Hosting" : "Going"}
          </span>
          {index === 0 && e.relative && (
            <span
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {e.relative}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function PastRow({ e, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: 12,
        borderRadius: 12,
        background: "transparent",
        border: "0.5px solid rgba(255,255,255,0.06)",
        display: "flex",
        gap: 12,
        alignItems: "center",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={e.img || "/nc/img/1.png"}
        alt=""
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          objectFit: "cover",
          filter: "grayscale(0.5) brightness(0.8)",
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Italic size={15} style={{ display: "block", color: "rgba(255,255,255,0.85)" }}>
          {e.title}
        </Italic>
        <div
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            marginTop: 3,
          }}
        >
          {e.date}
          {e.duration ? ` · ${e.duration}` : ""}
        </div>
      </div>
      <div style={{ color: "rgba(255,255,255,0.3)" }}>{I.chevR("rgba(255,255,255,0.3)")}</div>
    </button>
  );
}

function HostCard({ e, status, menuOpen, onMenu, onClose, onAction, onClick }) {
  const badge = {
    draft: { bg: "rgba(200,139,82,0.14)", fg: "#e0a26b", label: "Draft" },
    live: { bg: "rgba(200,217,168,0.14)", fg: "#c8d9a8", label: "We're ON" },
    past: { bg: "rgba(255,255,255,0.06)", fg: "rgba(255,255,255,0.55)", label: "Past" },
  }[status];

  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={onClick}
        style={{
          padding: 14,
          borderRadius: 14,
          background: "rgba(255,255,255,0.04)",
          border: "0.5px solid rgba(255,255,255,0.08)",
          display: "flex",
          gap: 14,
          alignItems: "stretch",
          cursor: onClick ? "pointer" : "default",
          opacity: status === "past" ? 0.72 : 1,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={e.img || "/nc/img/1.png"}
          alt=""
          style={{
            width: 66,
            height: 80,
            borderRadius: 10,
            objectFit: "cover",
            filter: status === "past" ? "grayscale(0.4)" : "none",
          }}
        />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 999,
                  background: badge.bg,
                  color: badge.fg,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {badge.label}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {e.date}
              </span>
            </div>
            <Italic
              size={17}
              style={{ display: "block", marginTop: 6, letterSpacing: "-0.01em" }}
            >
              {e.title || "Untitled draft"}
            </Italic>
          </div>
          {status !== "past" ? (
            <div
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 11,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {status === "draft"
                ? "Not published · only you can see"
                : e.capacity > 0
                  ? `${e.attending} / ${e.capacity} going`
                  : `${e.attending} going`}
            </div>
          ) : (
            <div
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {e.attending} attended
              {e.duration ? ` · ${e.duration}` : ""}
            </div>
          )}
        </div>
        <button
          onClick={(ev) => {
            ev.stopPropagation();
            onMenu();
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "flex-start",
          }}
          aria-label="Event menu"
        >
          <svg width="4" height="16" viewBox="0 0 4 16">
            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
            <circle cx="2" cy="8" r="1.5" fill="currentColor" />
            <circle cx="2" cy="14" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 20 }}>
          <div
            onClick={(ev) => ev.stopPropagation()}
            style={{
              position: "absolute",
              right: 8,
              top: 42,
              minWidth: 180,
              padding: 6,
              borderRadius: 12,
              background: "#1a1714",
              border: "0.5px solid rgba(255,255,255,0.1)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
            }}
          >
            {(status === "draft"
              ? [
                  { id: "edit", label: "Edit draft" },
                  { id: "publish", label: "Publish" },
                  { id: "delete", label: "Delete" },
                ]
              : status === "live"
              ? [
                  { id: "edit", label: "Edit event" },
                  { id: "cancel", label: "Cancel event" },
                ]
              : [{ id: "run-again", label: "Run again" }]
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => onAction?.(item.id)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "transparent",
                  border: "none",
                  color:
                    item.id === "cancel" || item.id === "delete"
                      ? "#e08b6b"
                      : "#fafaf9",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 13,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Seg({ on, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "10px 6px",
        textAlign: "center",
        background: "transparent",
        border: "none",
        borderBottom: on ? "1.5px solid #fafaf9" : "0.5px solid rgba(255,255,255,0.1)",
        color: on ? "#fafaf9" : "rgba(255,255,255,0.5)",
        fontFamily: "var(--font-inter), Inter, sans-serif",
        fontSize: 11,
        fontWeight: on ? 500 : 400,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
