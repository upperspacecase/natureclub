"use client";

import React from "react";
import { Caps, I, Italic, TabBar } from "../primitives";

export default function You({
  user,
  stats,
  memberCounts,
  activity,
  onNav,
  onGoYourEvents,
  onSignOut,
  onEditProfile,
}) {
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      })
    : "";
  const hosted = stats?.hostedCount || 0;
  const attended = stats?.eventCount || 0;
  const hours = stats?.totalHours || 0;

  return (
    <div
      className="nc-no-scrollbar"
      style={{ position: "absolute", inset: 0, overflow: "auto", background: "#0a0a0a" }}
    >
      

      <div style={{ padding: "max(28px, env(safe-area-inset-top)) 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {user?.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoUrl}
              alt=""
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                objectFit: "cover",
                border: "0.5px solid rgba(255,255,255,0.15)",
              }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            {memberSince && (
              <Caps style={{ color: "rgba(255,255,255,0.45)" }}>
                Member since {memberSince}
              </Caps>
            )}
            <Italic size={26} style={{ display: "block", marginTop: 4 }}>
              {user?.name || user?.username || "Member"}
            </Italic>
          </div>
          <button
            onClick={onEditProfile}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              background: "transparent",
              border: "0.5px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.75)",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Edit
          </button>
        </div>
      </div>

      <div style={{ padding: "26px 20px 0" }}>
        <div
          style={{
            padding: 20,
            borderRadius: 16,
            background: "linear-gradient(180deg, #122019 0%, #0a120e 100%)",
            border: "0.5px solid rgba(200,217,168,0.18)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Caps style={{ color: "#c8d9a8" }}>Your year in Nature</Caps>
          <div
            style={{
              fontFamily: 'var(--font-playfair), "Playfair Display", serif',
              fontStyle: "italic",
              fontSize: 52,
              color: "#fafaf9",
              marginTop: 8,
              lineHeight: 1,
            }}
          >
            {attended}
            <span style={{ fontSize: 22, color: "rgba(255,255,255,0.5)" }}>
              {" "}
              event{attended === 1 ? "" : "s"}
            </span>
          </div>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
            <span
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {hours} {hours === 1 ? "hour" : "hours"} outside
              {hosted > 0 ? ` · ${hosted} hosted` : ""}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: "26px 20px 0" }}>
        <Caps style={{ color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 10 }}>
          Activity
        </Caps>
        <ActivityLeafMap activity={activity || {}} />
      </div>

      <div style={{ padding: "26px 20px 0" }}>
        <Caps style={{ color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 10 }}>
          Host
        </Caps>
        <Row
          icon={I.calendar}
          label="Your events"
          sub={
            memberCounts
              ? `${memberCounts.hosting || 0} hosting · ${memberCounts.draft || 0} draft`
              : "Manage events you host"
          }
          onClick={onGoYourEvents}
        />
      </div>

      <div style={{ padding: "22px 20px 0" }}>
        <Caps style={{ color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 10 }}>
          Membership
        </Caps>
        <Row icon={I.leaf} label="1% for the Planet" sub="Every membership supports restoration" />
        <Row icon={I.heart} label="Saved events" sub={memberCounts?.saved ? `${memberCounts.saved} saved` : "Nothing saved yet"} />
      </div>

      <div style={{ padding: "22px 20px 0" }}>
        <Caps style={{ color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 10 }}>
          Settings
        </Caps>
        <Row label="Notifications" sub="Weekly digest" />
        <Row label="Privacy" />
        <Row label="Sign out" muted onClick={onSignOut} />
      </div>

      <TabBar active="you" onNav={onNav} />
    </div>
  );
}

const LEAF_LEVELS = [
  "rgba(255,255,255,0.08)",
  "rgba(200,217,168,0.3)",
  "rgba(200,217,168,0.55)",
  "rgba(200,217,168,0.8)",
  "#c8d9a8",
];

function Leaf({ fill, size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" style={{ display: "block" }}>
      <path
        d="M6 0.8 C9.6 2.6 10.6 7.2 6 11.2 C1.4 7.2 2.4 2.6 6 0.8 Z"
        fill={fill}
      />
    </svg>
  );
}

function level(count) {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

// GitHub-style contribution grid over the past year, drawn with leaves.
// Columns are weeks (Sunday-first); the grid scrolls horizontally and
// starts scrolled to the most recent weeks.
function ActivityLeafMap({ activity }) {
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const { weeks, monthLabels } = React.useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - 364);
    start.setDate(start.getDate() - start.getDay()); // back to Sunday

    const weeks = [];
    const monthLabels = [];
    let cursor = new Date(start);
    let prevMonth = -1;
    while (cursor <= today) {
      const col = [];
      const weekStartMonth = cursor.getMonth();
      if (weekStartMonth !== prevMonth && cursor.getDate() <= 7) {
        monthLabels.push({
          index: weeks.length,
          label: cursor.toLocaleDateString("en-US", { month: "short" }),
        });
        prevMonth = weekStartMonth;
      } else if (weekStartMonth !== prevMonth) {
        prevMonth = weekStartMonth;
      }
      for (let d = 0; d < 7; d += 1) {
        if (cursor > today) {
          col.push(null);
        } else {
          const y = cursor.getFullYear();
          const m = String(cursor.getMonth() + 1).padStart(2, "0");
          const day = String(cursor.getDate()).padStart(2, "0");
          col.push(`${y}-${m}-${day}`);
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(col);
    }
    return { weeks, monthLabels };
  }, []);

  const CELL = 13; // 11px leaf + 2px gap
  const DAY_ROWS = [
    { row: 1, label: "Mon" },
    { row: 3, label: "Wed" },
    { row: 5, label: "Fri" },
  ];

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 14,
        background: "rgba(255,255,255,0.03)",
        border: "0.5px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            flexShrink: 0,
            paddingTop: 16,
          }}
        >
          {Array.from({ length: 7 }, (_, r) => (
            <div
              key={r}
              style={{
                height: CELL,
                display: "flex",
                alignItems: "center",
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 9,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {DAY_ROWS.find((d) => d.row === r)?.label || ""}
            </div>
          ))}
        </div>
        <div ref={scrollRef} className="nc-no-scrollbar" style={{ overflowX: "auto" }}>
          <div style={{ position: "relative", height: 16, width: weeks.length * CELL }}>
            {monthLabels.map((m) => (
              <span
                key={`${m.label}-${m.index}`}
                style={{
                  position: "absolute",
                  left: m.index * CELL,
                  top: 0,
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 9,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {m.label}
              </span>
            ))}
          </div>
          <div style={{ display: "flex" }}>
            {weeks.map((col, ci) => (
              <div key={ci} style={{ display: "flex", flexDirection: "column" }}>
                {col.map((key, ri) => (
                  <div
                    key={ri}
                    style={{
                      width: CELL,
                      height: CELL,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {key && <Leaf fill={LEAF_LEVELS[level(activity[key])]} />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 4,
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: 9,
          color: "rgba(255,255,255,0.4)",
        }}
      >
        Less
        {LEAF_LEVELS.map((c) => (
          <Leaf key={c} fill={c} size={10} />
        ))}
        More
      </div>
    </div>
  );
}

function Row({ icon, label, sub, muted, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px 0",
        background: "transparent",
        border: "none",
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        textAlign: "left",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {icon && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
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
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 14,
            color: muted ? "rgba(255,255,255,0.55)" : "#fafaf9",
          }}
        >
          {label}
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
      {onClick && !muted && <div style={{ color: "rgba(255,255,255,0.3)" }}>{I.chevR("rgba(255,255,255,0.3)")}</div>}
    </button>
  );
}
