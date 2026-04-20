"use client";

import React from "react";
import { AvatarStack, Caps, I, Italic, ProgressRing, StatusBar, TabBar } from "../primitives";

export default function Home({
  user,
  stats,
  nextEvent,
  savedEvents = [],
  nearbyEvents = [],
  onOpenEvent,
  onNav,
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const firstName = (user?.name || "").split(" ")[0] || "there";
  const greeting = getGreeting();
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const eventCount = stats?.eventCount || 0;
  const hours = stats?.totalHours || 0;
  const goal = 12;
  const progress = Math.min(1, eventCount / goal);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "auto", background: "#0a0a0a", paddingBottom: 90 }}>
      <div style={{ position: "relative", height: 440, overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={nextEvent?.img || "/nc/img/7.png"}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.62) saturate(0.9)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.1) 35%, rgba(10,10,10,0.92) 100%)",
          }}
        />

        <StatusBar dark />

        <div
          style={{
            position: "absolute",
            top: 58,
            left: 20,
            right: 20,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nc/logo-light.svg" alt="Nature Club" style={{ height: 34 }} />
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
                border: "0.5px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fafaf9",
                cursor: "pointer",
              }}
            >
              {I.menu("#fafaf9")}
            </button>
            {menuOpen && (
              <NavMenu
                onNav={(k) => {
                  setMenuOpen(false);
                  onNav?.(k);
                }}
                onClose={() => setMenuOpen(false)}
              />
            )}
          </div>
        </div>

        <div style={{ position: "absolute", left: 20, right: 20, bottom: 200, zIndex: 10 }}>
          <Caps style={{ color: "rgba(255,255,255,0.72)" }}>{todayLabel}</Caps>
          <div style={{ height: 8 }} />
          <Italic size={38} style={{ display: "block" }}>
            {greeting},
            <br />
            {firstName}.
          </Italic>
        </div>

        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: 24,
            zIndex: 10,
            padding: 16,
            borderRadius: 16,
            background: "rgba(250,249,246,0.06)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "0.5px solid rgba(255,255,255,0.14)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <ProgressRing size={54} stroke={3} progress={progress} color="#c8d9a8" />
          <div style={{ flex: 1 }}>
            <Caps style={{ color: "rgba(255,255,255,0.55)" }}>Your year</Caps>
            <div
              style={{
                fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                fontStyle: "italic",
                fontSize: 20,
                color: "#fafaf9",
                marginTop: 2,
                lineHeight: 1.1,
              }}
            >
              {eventCount} event{eventCount === 1 ? "" : "s"}
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
                {" "}
                / {goal}
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 11,
                color: "rgba(255,255,255,0.55)",
                marginTop: 2,
              }}
            >
              {hours} {hours === 1 ? "hour" : "hours"} in Nature this year
            </div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)" }}>{I.chevR("rgba(255,255,255,0.5)")}</div>
        </div>
      </div>

      {nextEvent && (
        <div style={{ padding: "32px 20px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <Caps style={{ color: "rgba(255,255,255,0.5)" }}>Your next visit</Caps>
            <span
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {relativeWhen(nextEvent)}
            </span>
          </div>
          <button
            onClick={() => onOpenEvent?.(nextEvent.id)}
            style={{
              width: "100%",
              padding: 0,
              border: "none",
              background: "none",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 14,
                alignItems: "stretch",
                padding: 14,
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={nextEvent.img || "/nc/img/1.png"}
                alt=""
                style={{ width: 72, height: 88, borderRadius: 10, objectFit: "cover" }}
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Italic size={19} style={{ display: "block" }}>
                    {nextEvent.title}
                  </Italic>
                  <div
                    style={{
                      fontFamily: "var(--font-inter), Inter, sans-serif",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.55)",
                      marginTop: 6,
                    }}
                  >
                    {nextEvent.date} · {nextEvent.time}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <AvatarStack imgs={nextEvent.attendees?.slice(0, 3) || []} size={22} border="#141210" />
                  <div
                    style={{
                      fontFamily: "var(--font-inter), Inter, sans-serif",
                      fontSize: 11,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "rgba(200,217,168,0.14)",
                      color: "#c8d9a8",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Going
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {nearbyEvents.length > 0 && (
        <div style={{ marginTop: 34 }}>
          <div
            style={{
              padding: "0 20px",
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <Caps style={{ color: "rgba(255,255,255,0.5)" }}>This week near you</Caps>
            <button
              onClick={() => onNav?.("discover")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.5)",
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Discover all {I.arrowUpRight("rgba(255,255,255,0.5)")}
            </button>
          </div>
          <div
            className="nc-no-scrollbar"
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              padding: "0 20px",
              scrollbarWidth: "none",
            }}
          >
            {nearbyEvents.map((e) => (
              <EventCard key={e.id} e={e} onClick={() => onOpenEvent?.(e.id)} />
            ))}
            <div style={{ flexShrink: 0, width: 8 }} />
          </div>
        </div>
      )}

      {savedEvents.length > 0 && (
        <div style={{ marginTop: 34 }}>
          <div style={{ padding: "0 20px", marginBottom: 14 }}>
            <Caps style={{ color: "rgba(255,255,255,0.5)" }}>Saved for later</Caps>
          </div>
          <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            {savedEvents.map((e) => (
              <SavedRow key={e.id} e={e} onClick={() => onOpenEvent?.(e.id)} />
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          margin: "40px 20px 20px",
          padding: 18,
          borderRadius: 14,
          border: "0.5px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#03241a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {I.leaf("#c8d9a8")}
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-playfair), "Playfair Display", serif',
              fontStyle: "italic",
              fontSize: 15,
              color: "#fafaf9",
              lineHeight: 1.3,
            }}
          >
            Every membership supports local ecosystem restoration.
          </div>
          <div
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
              marginTop: 4,
            }}
          >
            1% for the Planet
          </div>
        </div>
      </div>

      <TabBar active="home" onNav={onNav} />
    </div>
  );
}

function NavMenu({ onNav, onClose }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 20 }}
      />
      <div
        style={{
          position: "absolute",
          top: 44,
          right: 0,
          zIndex: 21,
          minWidth: 180,
          padding: 6,
          borderRadius: 12,
          background: "rgba(20,18,16,0.98)",
          backdropFilter: "blur(14px)",
          border: "0.5px solid rgba(255,255,255,0.1)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
        }}
      >
        {[
          { k: "home", label: "Home" },
          { k: "discover", label: "Discover" },
          { k: "plans", label: "Your plans" },
          { k: "you", label: "Your profile" },
          { k: "yourEvents", label: "Host events" },
        ].map((item) => (
          <button
            key={item.k}
            onClick={() => onNav(item.k)}
            style={{
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
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function relativeWhen(e) {
  if (!e?.dateTimeISO) return e?.date || "";
  const ms = new Date(e.dateTimeISO).getTime() - Date.now();
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 7) return `in ${days} days`;
  const w = Math.floor(days / 7);
  return `in ${w} week${w === 1 ? "" : "s"}`;
}

function EventCard({ e, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        width: 192,
        padding: 0,
        border: "none",
        background: "none",
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ position: "relative", width: 192, height: 240, borderRadius: 12, overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={e.img || "/nc/img/1.png"}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.85)" }}
        />
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            padding: "4px 9px",
            borderRadius: 999,
            background: "rgba(10,10,10,0.55)",
            backdropFilter: "blur(10px)",
            color: "#fafaf9",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {e.type}
        </div>
      </div>
      <div>
        <Italic size={17} style={{ display: "block", lineHeight: 1.15 }}>
          {e.title}
        </Italic>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 6,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <span style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: 11 }}>
            {e.date}
          </span>
          {e.distance && (
            <>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
              <span style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: 11 }}>
                {e.distance}
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

function SavedRow({ e, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 10,
        borderRadius: 12,
        border: "none",
        background: "rgba(255,255,255,0.03)",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={e.img || "/nc/img/1.png"}
        alt=""
        style={{ width: 54, height: 54, borderRadius: 10, objectFit: "cover" }}
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
          {e.date} · {e.location}
        </div>
      </div>
      {I.heart("rgba(255,255,255,0.6)", "rgba(255,255,255,0.6)")}
    </button>
  );
}
