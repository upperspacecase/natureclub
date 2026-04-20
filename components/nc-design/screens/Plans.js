"use client";

import React from "react";
import { AvatarStack, Caps, I, Italic, StatusBar, TabBar } from "../primitives";

export default function Plans({ upcoming = [], past = [], onOpenEvent, onNav }) {
  const [tab, setTab] = React.useState("upcoming");
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div
      className="nc-no-scrollbar"
      style={{ position: "absolute", inset: 0, overflow: "auto", background: "#0a0a0a", paddingBottom: 90 }}
    >
      <StatusBar dark />
      <div style={{ padding: "68px 20px 14px" }}>
        <Caps style={{ color: "rgba(255,255,255,0.45)" }}>Your plans</Caps>
        <div style={{ height: 4 }} />
        <Italic size={34} style={{ display: "block" }}>
          What&apos;s ahead.
        </Italic>
      </div>

      <div style={{ padding: "0 20px", display: "flex", gap: 0, marginTop: 10, marginBottom: 22 }}>
        <Seg
          on={tab === "upcoming"}
          onClick={() => setTab("upcoming")}
          label={`Upcoming · ${upcoming.length}`}
        />
        <Seg
          on={tab === "past"}
          onClick={() => setTab("past")}
          label={`Past · ${past.length}`}
        />
      </div>

      {list.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <Italic size={20} style={{ display: "block", color: "rgba(255,255,255,0.7)" }}>
            {tab === "upcoming" ? "Nothing on the calendar yet." : "No past events."}
          </Italic>
          <p
            style={{
              marginTop: 10,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {tab === "upcoming"
              ? "RSVP to something in Discover."
              : "Events you've attended will show up here."}
          </p>
        </div>
      ) : tab === "upcoming" ? (
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {upcoming.map((e, i) => (
            <UpcomingCard key={e.id} e={e} index={i} onClick={() => onOpenEvent?.(e.id)} />
          ))}
        </div>
      ) : (
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {past.map((e) => (
            <PastRow key={e.id} e={e} onClick={() => onOpenEvent?.(e.id)} />
          ))}
        </div>
      )}

      <TabBar active="plans" onNav={onNav} />
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
              background: "rgba(200,217,168,0.14)",
              color: "#c8d9a8",
              letterSpacing: "0.04em",
            }}
          >
            Going
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

function Seg({ on, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "10px 12px",
        textAlign: "center",
        background: "transparent",
        border: "none",
        borderBottom: on ? "1.5px solid #fafaf9" : "0.5px solid rgba(255,255,255,0.1)",
        color: on ? "#fafaf9" : "rgba(255,255,255,0.5)",
        fontFamily: "var(--font-inter), Inter, sans-serif",
        fontSize: 12,
        fontWeight: on ? 500 : 400,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
