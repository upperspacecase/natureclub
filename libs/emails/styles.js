/**
 * Shared brand colors, category colors, and utilities for emails and UI.
 * This is the single source of truth — changing values here updates both
 * the site (event cards) and all email templates.
 */

export const brandColors = {
  page: "#040404",
  panel: "#0b0b0b",
  border: "#1f1f1f",
  text: "#ffffff",
  muted: "rgba(255, 255, 255, 0.78)",
};

export const categoryColors = {
  gather: "#4f6b3e",
  move: "#c26b3a",
  restore: "#2f6b59",
  learn: "#3c5a86",
  explore: "#b5842d",
  make: "#8a5b3a",
};

export const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
