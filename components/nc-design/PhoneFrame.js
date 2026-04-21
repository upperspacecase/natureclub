"use client";

import React from "react";

/**
 * Responsive mobile-first container. On phones it fills the viewport.
 * On wider screens it caps at 430px and centers, against a dark backdrop.
 * No fake status bar, notch, or home indicator — the real device draws those.
 */
export default function PhoneFrame({ children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        background: "#0a0a0a",
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 430,
          height: "100%",
          overflow: "hidden",
          background: "#0a0a0a",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
