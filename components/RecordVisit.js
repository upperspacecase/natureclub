"use client";

import { useEffect } from "react";
import apiClient from "@/libs/api";

const VISIT_KEY = "nc-visit-recorded";

const RecordVisit = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const startTime = Date.now();
    let sessionLogged = false;

    const recordVisit = async () => {
      if (sessionStorage.getItem(VISIT_KEY)) return;
      try {
        await apiClient.post("/visit");
        sessionStorage.setItem(VISIT_KEY, "true");
      } catch (error) {
        console.error(error);
      }
    };

    const sendSessionDuration = () => {
      if (sessionLogged) return;
      sessionLogged = true;
      const durationMs = Date.now() - startTime;
      if (durationMs < 1000) return;

      const payload = JSON.stringify({ durationMs });
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/visit-session", blob);
        return;
      }

      fetch("/api/visit-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch((error) => console.error(error));
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendSessionDuration();
      }
    };

    recordVisit();
    window.addEventListener("beforeunload", sendSessionDuration);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", sendSessionDuration);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
};

export default RecordVisit;
