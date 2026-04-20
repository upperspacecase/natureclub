"use client";

import React from "react";
import { Caps, I, Italic, StatusBar, TabBar } from "../primitives";

export default function You({
  user,
  stats,
  memberCounts,
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
      style={{ position: "absolute", inset: 0, overflow: "auto", background: "#0a0a0a", paddingBottom: 90 }}
    >
      <StatusBar dark />

      <div style={{ padding: "68px 20px 0" }}>
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
