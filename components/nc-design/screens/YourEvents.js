"use client";

import React from "react";
import { Caps, I, Italic, StatusBar } from "../primitives";

export default function YourEvents({
  drafts = [],
  hosted = [],
  past = [],
  attending = [],
  onOpenEvent,
  onEditEvent,
  onNewEvent,
  onBack,
  onMenuAction,
}) {
  const [menuFor, setMenuFor] = React.useState(null);

  return (
    <div
      className="nc-no-scrollbar"
      style={{ position: "absolute", inset: 0, overflow: "auto", background: "#0a0a0a", paddingBottom: 110 }}
    >
      <StatusBar dark />

      <div
        style={{
          padding: "58px 16px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            border: "0.5px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {I.chevL("#fafaf9")}
        </button>
        <Caps style={{ color: "rgba(255,255,255,0.55)" }}>Your events</Caps>
        <div style={{ width: 38 }} />
      </div>

      <div style={{ padding: "10px 20px 0" }}>
        <Italic size={30} style={{ display: "block", letterSpacing: "-0.01em" }}>
          Two things you&apos;re
          <br />
          bringing together.
        </Italic>
      </div>

      {drafts.length > 0 && (
        <Section title={`Drafts · ${drafts.length}`}>
          {drafts.map((e) => (
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
          ))}
        </Section>
      )}

      {hosted.length > 0 && (
        <Section title={`Hosting · ${hosted.length}`}>
          {hosted.map((e) => (
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
          ))}
        </Section>
      )}

      {past.length > 0 && (
        <Section title={`Past · ${past.length}`}>
          {past.map((e) => (
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
            />
          ))}
        </Section>
      )}

      {attending.length > 0 && (
        <Section title={`Attending · ${attending.length}`}>
          {attending.map((e) => (
            <button
              key={e.id}
              onClick={() => onOpenEvent?.(e.id)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
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
                style={{ width: 46, height: 46, borderRadius: 10, objectFit: "cover" }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Italic size={15} style={{ display: "block" }}>
                  {e.title}
                </Italic>
                <div
                  style={{
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                    marginTop: 3,
                  }}
                >
                  {e.date}
                  {e.host ? ` · hosted by ${e.host}` : ""}
                </div>
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)" }}>
                {I.chevR("rgba(255,255,255,0.4)")}
              </div>
            </button>
          ))}
        </Section>
      )}

      {drafts.length === 0 && hosted.length === 0 && past.length === 0 && attending.length === 0 && (
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <Italic size={20} style={{ display: "block", color: "rgba(255,255,255,0.7)" }}>
            Host your first event.
          </Italic>
          <p
            style={{
              marginTop: 10,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Start a draft, shape it, share it with members.
          </p>
        </div>
      )}

      <button
        onClick={onNewEvent}
        style={{
          position: "absolute",
          right: 20,
          bottom: 30,
          zIndex: 40,
          padding: "14px 18px",
          borderRadius: 999,
          background: "#fafaf9",
          color: "#0a0a0a",
          border: "none",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: 13,
          fontWeight: 500,
          boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {I.plus("#0a0a0a")} New event
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ padding: "28px 20px 0" }}>
      <Caps style={{ color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 14 }}>
        {title}
      </Caps>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
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
