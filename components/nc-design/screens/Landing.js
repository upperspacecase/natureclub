"use client";

import React from "react";
import { Caps, Italic } from "../primitives";

export default function Landing({ onEnter, onSignIn }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#000" }}>
      <video
        src="/nc/landing.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      

      <div style={{ position: "absolute", top: 'max(20px, env(safe-area-inset-top))', left: 24, zIndex: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/nc/logo-light.svg" alt="Nature Club" style={{ height: 44 }} />
      </div>

      <div style={{ position: "absolute", left: 24, right: 24, bottom: 40, zIndex: 10 }}>
        <Italic size={56} style={{ display: "block", lineHeight: 1.02 }}>
          Spend more
          <br />
          time in Nature.
        </Italic>
        <p
          style={{
            marginTop: 18,
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 14,
            lineHeight: 1.4,
            color: "rgba(255,255,255,0.88)",
            maxWidth: 280,
          }}
        >
          Access local{" "}
          <em style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif' }}>Nature</em>{" "}
          events, experiences, and classes with one membership.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
          <div
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 11,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.2,
            }}
          >
            <div>Every membership supports</div>
            <div>local ecosystem restoration</div>
          </div>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>+</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nc/1-percent.svg" alt="1% for the Planet" style={{ height: 52, opacity: 0.82 }} />
        </div>

        <button
          onClick={onEnter}
          style={{
            marginTop: 28,
            width: "100%",
            padding: "16px 24px",
            background: "#fafaf9",
            color: "#0a0a0a",
            border: "none",
            borderRadius: 10,
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          Join the Club
        </button>
        <div
          style={{
            marginTop: 14,
            textAlign: "center",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Already a member?{" "}
          <button
            onClick={onSignIn}
            style={{
              color: "#fafaf9",
              textDecoration: "underline",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "inherit",
            }}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
