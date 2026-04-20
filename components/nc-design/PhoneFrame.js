"use client";

import React from "react";

const PHONE_W = 390;
const PHONE_H = 844;

export default function PhoneFrame({ children }) {
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const compute = () => {
      const sx = (window.innerWidth - 40) / PHONE_W;
      const sy = (window.innerHeight - 40) / PHONE_H;
      setScale(Math.min(1, sx, sy));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#171411",
        overflow: "hidden",
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.4,
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(152,101,55,0.25) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(3,36,26,0.3) 0%, transparent 60%)",
        }}
      />

      <div
        style={{
          width: PHONE_W,
          height: PHONE_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          position: "relative",
          borderRadius: 52,
          overflow: "hidden",
          background: "#000",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 10px #1a1714, 0 0 0 11px #2a2420",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 11,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 34,
            borderRadius: 20,
            background: "#000",
            zIndex: 100,
          }}
        />
        {children}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 0,
            right: 0,
            zIndex: 200,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 134,
              height: 5,
              borderRadius: 100,
              background: "rgba(255,255,255,0.7)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
