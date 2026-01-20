"use client";

import { useEffect } from "react";
import apiClient from "@/libs/api";

const VISIT_KEY = "nc-visit-recorded";

const RecordVisit = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(VISIT_KEY)) return;

    const recordVisit = async () => {
      try {
        await apiClient.post("/visit");
        sessionStorage.setItem(VISIT_KEY, "true");
      } catch (error) {
        console.error(error);
      }
    };

    recordVisit();
  }, []);

  return null;
};

export default RecordVisit;
