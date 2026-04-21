"use client";

import React from "react";
import { AvatarStack, Caps, I, Italic } from "../primitives";

export default function EventDetail({
  event,
  weather,
  initialRsvp = false,
  initialSaved = false,
  canRsvp = true,
  onBack,
  onRsvp,
  onCancelRsvp,
  onToggleSave,
  onShare,
  onDownloadStoryCard,
  onAddToGoogleCal,
  onDownloadIcs,
  onOpenHost,
}) {
  const e = event;
  const [rsvp, setRsvp] = React.useState(initialRsvp);
  const [saved, setSaved] = React.useState(initialSaved);
  const [confirming, setConfirming] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [err, setErr] = React.useState("");

  if (!e) return null;

  async function confirmRsvp() {
    setPending(true);
    setErr("");
    try {
      await onRsvp?.();
      setRsvp(true);
      setConfirming(false);
    } catch (ex) {
      setErr(ex?.message || "Could not RSVP");
    } finally {
      setPending(false);
    }
  }

  async function cancelRsvp() {
    setPending(true);
    setErr("");
    try {
      await onCancelRsvp?.();
      setRsvp(false);
    } catch (ex) {
      setErr(ex?.message || "Could not cancel");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="nc-no-scrollbar"
      style={{ position: "absolute", inset: 0, overflow: "auto", background: "#0a0a0a", paddingBottom: 110 }}
    >
      
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          padding: "max(16px, env(safe-area-inset-top)) 16px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(to bottom, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0) 100%)",
        }}
      >
        <button onClick={onBack} style={roundBtn}>
          {I.chevL("#fafaf9")}
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={async () => {
              const next = !saved;
              setSaved(next);
              try {
                await onToggleSave?.();
              } catch {
                setSaved(!next);
              }
            }}
            style={{
              ...roundBtn,
              background: saved ? "rgba(153,70,33,0.25)" : roundBtn.background,
            }}
          >
            {saved ? I.heart("#994621", "#994621") : I.heart("#fafaf9")}
          </button>
          <button onClick={onShare} style={roundBtn}>
            {I.share("#fafaf9")}
          </button>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        <StoryCard e={e} rsvp={rsvp} onTap={() => !rsvp && canRsvp && setConfirming(true)} />
        <Caps
          style={{
            display: "block",
            textAlign: "center",
            marginTop: 12,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {rsvp ? "↓ Save card · members only" : "↓ Tap to share · Members only"}
        </Caps>
      </div>

      {rsvp && (
        <YoureInPanel
          e={e}
          weather={weather}
          onAddToGoogleCal={onAddToGoogleCal}
          onDownloadIcs={onDownloadIcs}
        />
      )}

      {e.host && (
        <div
          onClick={onOpenHost}
          style={{
            margin: "30px 20px 0",
            padding: "16px 0",
            borderTop: "0.5px solid rgba(255,255,255,0.08)",
            borderBottom: "0.5px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: onOpenHost ? "pointer" : "default",
          }}
        >
          {e.hostAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={e.hostAvatar}
              alt=""
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                objectFit: "cover",
                filter: "saturate(0.9)",
              }}
            />
          ) : (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <Caps style={{ color: "rgba(255,255,255,0.4)" }}>Hosted by</Caps>
            <div
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 14,
                color: "#fafaf9",
                marginTop: 2,
              }}
            >
              {e.host}
            </div>
          </div>
          <button
            onClick={(ev) => {
              ev.stopPropagation();
              onOpenHost?.();
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              background: "transparent",
              border: "0.5px solid rgba(255,255,255,0.22)",
              color: "#fafaf9",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {rsvp ? "Message" : "Follow"}
          </button>
        </div>
      )}

      {e.about && (
        <div style={{ margin: "22px 20px 0" }}>
          <Caps style={{ color: "rgba(255,255,255,0.4)", display: "block" }}>About</Caps>
          <p
            style={{
              marginTop: 10,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 14,
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {e.about}
          </p>
        </div>
      )}

      <div style={{ margin: "28px 20px 0" }}>
        <Caps style={{ color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 14 }}>
          Details
        </Caps>
        <DetailRow
          icon={I.calendar}
          label="When"
          value={`${e.date} · ${e.time}`}
          sub={e.duration}
        />
        <DetailRow
          icon={I.pin}
          label="Where"
          value={rsvp ? e.location : `${(e.location || "").split("·")[0].trim() || "Nearby"} area`}
          sub={rsvp ? e.distance ? `${e.distance} from you` : null : "Exact meeting point revealed after RSVP"}
        />
      </div>

      {e.bring?.length > 0 && (
        <div style={{ margin: "28px 20px 0" }}>
          <Caps style={{ color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 12 }}>
            What to bring
          </Caps>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {e.bring.map((b, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 0",
                  borderBottom:
                    i < e.bring.length - 1 ? "0.5px solid rgba(255,255,255,0.06)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#c8d9a8",
                    flexShrink: 0,
                  }}
                />
                {b}
              </div>
            ))}
          </div>
        </div>
      )}

      {(e.attendees?.length > 0 || e.capacity > 0) && (
        <div style={{ margin: "28px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <Caps style={{ color: "rgba(255,255,255,0.4)" }}>Who&apos;s going</Caps>
            <span
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 11,
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {e.attending + (rsvp ? 1 : 0)}
              {e.capacity > 0 && ` · ${Math.max(0, e.capacity - e.attending - (rsvp ? 1 : 0))} spots left`}
            </span>
          </div>
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 14 }}>
            {e.attendees?.length > 0 && (
              <AvatarStack imgs={e.attendees} size={36} border="#0a0a0a" />
            )}
            {e.attending > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {rsvp && <span style={{ color: "#c8d9a8" }}>You </span>}
                {Math.max(0, e.attending - (e.attendees?.length || 0) + (rsvp ? 1 : 0))} member
                {e.attending - (e.attendees?.length || 0) + (rsvp ? 1 : 0) === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>
      )}

      <div style={{ margin: "32px 20px 0" }}>
        <button
          onClick={onDownloadStoryCard}
          style={{
            width: "100%",
            padding: "14px",
            background: "transparent",
            border: "0.5px solid rgba(255,255,255,0.22)",
            borderRadius: 10,
            color: "#fafaf9",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {I.share("#fafaf9")} Download story card
        </button>
      </div>

      {err && (
        <div
          style={{
            margin: "20px 20px 0",
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

      {canRsvp && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 30,
            padding: "14px 20px 28px",
            background:
              "linear-gradient(to top, #0a0a0a 40%, rgba(10,10,10,0.85) 80%, rgba(10,10,10,0) 100%)",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {e.price === "Free" ? "Included with membership" : `${e.price} · members`}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                fontStyle: "italic",
                fontSize: 18,
                color: "#fafaf9",
                marginTop: 2,
              }}
            >
              {e.price}
            </div>
          </div>
          <button
            disabled={pending}
            onClick={() => (rsvp ? cancelRsvp() : setConfirming(true))}
            style={{
              flex: 1.5,
              padding: "14px 22px",
              borderRadius: 10,
              background: rsvp ? "#c8d9a8" : "#fafaf9",
              color: "#0a0a0a",
              border: "none",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 14,
              fontWeight: 500,
              cursor: pending ? "wait" : "pointer",
              opacity: pending ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.25s",
            }}
          >
            {rsvp ? (
              <>
                {I.check("#0a0a0a")} You&apos;re in
              </>
            ) : (
              <>
                RSVP {I.arrowRight("#0a0a0a")}
              </>
            )}
          </button>
        </div>
      )}

      {confirming && (
        <RsvpSheet
          e={e}
          pending={pending}
          onClose={() => !pending && setConfirming(false)}
          onConfirm={confirmRsvp}
        />
      )}
    </div>
  );
}

const roundBtn = {
  width: 38,
  height: 38,
  borderRadius: "50%",
  background: "rgba(10,10,10,0.6)",
  backdropFilter: "blur(18px)",
  border: "0.5px solid rgba(255,255,255,0.18)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

function RsvpSheet({ e, pending, onClose, onConfirm }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        onClick={(ev) => ev.stopPropagation()}
        style={{
          width: "100%",
          background: "#141210",
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          padding: "14px 22px 32px",
          color: "#fafaf9",
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.2)",
            margin: "0 auto 20px",
          }}
        />
        <Caps style={{ color: "rgba(255,255,255,0.4)", display: "block" }}>RSVP to</Caps>
        <Italic size={24} style={{ display: "block", marginTop: 6, letterSpacing: "-0.01em" }}>
          {e.title}
        </Italic>
        <div
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
            marginTop: 6,
          }}
        >
          {e.date} · {e.time}
          {e.duration ? ` · ${e.duration}` : ""}
        </div>

        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 2 }}>
          <SheetRow
            label="Cost"
            value={e.price === "Free" ? "Included with membership" : e.price}
          />
          {e.capacity > 0 && (
            <SheetRow
              label="Spot"
              value={`1 of ${Math.max(0, e.capacity - e.attending)} open`}
            />
          )}
        </div>

        <div
          style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 10,
            background: "rgba(200,217,168,0.08)",
            border: "0.5px solid rgba(200,217,168,0.22)",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "rgba(200,217,168,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            {I.pin("#c8d9a8")}
          </div>
          <div
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 12,
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.5,
            }}
          >
            Confirming reveals the exact meeting point and adds this to your calendar.
          </div>
        </div>

        <button
          disabled={pending}
          onClick={onConfirm}
          style={{
            width: "100%",
            marginTop: 18,
            padding: "15px",
            borderRadius: 10,
            background: "#fafaf9",
            color: "#0a0a0a",
            border: "none",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 14,
            fontWeight: 500,
            cursor: pending ? "wait" : "pointer",
            opacity: pending ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {I.check("#0a0a0a")} {pending ? "Confirming…" : "Confirm RSVP"}
        </button>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            marginTop: 10,
            padding: "13px",
            borderRadius: 10,
            background: "transparent",
            color: "rgba(255,255,255,0.65)",
            border: "none",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Not yet
        </button>
      </div>
    </div>
  );
}

function SheetRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "12px 0",
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: 12,
          color: "rgba(255,255,255,0.5)",
        }}
      >
        {label}
      </div>
      <div
        style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: 13, color: "#fafaf9" }}
      >
        {value}
      </div>
    </div>
  );
}

function YoureInPanel({ e, weather, onAddToGoogleCal, onDownloadIcs }) {
  return (
    <div
      style={{
        margin: "22px 20px 0",
        padding: 0,
        borderRadius: 16,
        background: "linear-gradient(180deg, rgba(200,217,168,0.08) 0%, rgba(200,217,168,0.02) 100%)",
        border: "0.5px solid rgba(200,217,168,0.2)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "0.5px solid rgba(200,217,168,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "rgba(200,217,168,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {I.check("#c8d9a8")}
          </div>
          <Caps style={{ color: "#c8d9a8" }}>You&apos;re in</Caps>
        </div>
      </div>

      {weather && (
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "0.5px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "#0a0f14",
              border: "0.5px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#c8d9a8",
              fontSize: 22,
            }}
          >
            {weather.icon || "☀"}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 13,
                color: "#fafaf9",
              }}
            >
              {weather.summary || "Forecast"}
              {weather.tempF != null && ` · ${weather.tempF}°`}
            </div>
            {weather.note && (
              <div
                style={{
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                  marginTop: 2,
                }}
              >
                {weather.note}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "0.5px solid rgba(255,255,255,0.06)",
        }}
      >
        {I.pin("#c8d9a8")}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 12,
              color: "#fafaf9",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {e.location}
          </div>
          {e.distance && (
            <div
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 10,
                color: "rgba(255,255,255,0.5)",
                marginTop: 1,
              }}
            >
              {e.distance} from you
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 0 }}>
        <CalBtn label="Add to Google" onClick={onAddToGoogleCal} />
        <div style={{ width: "0.5px", background: "rgba(255,255,255,0.06)" }} />
        <CalBtn label="Add to iCal" onClick={onDownloadIcs} />
      </div>
    </div>
  );
}

function CalBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "14px 8px",
        background: "transparent",
        border: "none",
        color: "rgba(255,255,255,0.78)",
        fontFamily: "var(--font-inter), Inter, sans-serif",
        fontSize: 12,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {I.calendar("rgba(255,255,255,0.78)")} {label}
    </button>
  );
}

function DetailRow({ icon, label, value, sub }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        padding: "14px 0",
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "rgba(255,255,255,0.04)",
          border: "0.5px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon("#c8d9a8")}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 14,
            color: "#fafaf9",
            marginTop: 3,
          }}
        >
          {value}
        </div>
        {sub && (
          <div
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 11,
              color: "rgba(255,255,255,0.45)",
              marginTop: 2,
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function StoryCard({ e, rsvp, onTap }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "4 / 5",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={e.img || "/nc/img/1.png"}
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
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
          display: "flex",
          alignItems: "center",
          gap: 7,
          color: "rgba(255,255,255,0.92)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <path
            d="M16 2s-9 0-12 4-2 8-2 8 4 0 8-2 6-4 6-10z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M2 16S7 11 12 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <Caps>Nature Club</Caps>
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
        {e.type}
      </div>

      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          top: "40%",
          transform: "translateY(-50%)",
          color: "#fafaf9",
        }}
      >
        <Italic
          size={34}
          style={{
            display: "block",
            textShadow: "0 2px 16px rgba(0,0,0,0.4)",
            letterSpacing: "-0.015em",
          }}
        >
          {e.title}
        </Italic>
      </div>

      <div style={{ position: "absolute", left: 22, bottom: 22 }}>
        <div
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 13,
            color: "#fafaf9",
            textShadow: "0 1px 6px rgba(0,0,0,0.4)",
          }}
        >
          {e.date}
        </div>
        <div
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.8)",
            marginTop: 2,
            textShadow: "0 1px 6px rgba(0,0,0,0.4)",
          }}
        >
          {e.time}
          {e.location ? ` · ${e.location}` : ""}
        </div>
      </div>

      <button
        onClick={onTap}
        style={{
          position: "absolute",
          right: 18,
          bottom: 18,
          width: 68,
          height: 68,
          borderRadius: "50%",
          background: rsvp ? "#c8d9a8" : "#fafaf9",
          border: "none",
          cursor: rsvp ? "default" : "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
          transition: "all 0.3s",
        }}
      >
        {rsvp ? (
          <>
            {I.check("#03241a")}
            <Caps style={{ color: "#03241a", marginTop: 2, fontSize: 9 }}>Going</Caps>
          </>
        ) : (
          <>
            <Italic size={14} color="#0a0a0a" style={{ lineHeight: 1 }}>
              RSVP
            </Italic>
            <Caps style={{ color: "#57534e", marginTop: 3, fontSize: 9 }}>{e.price}</Caps>
          </>
        )}
      </button>
    </div>
  );
}
