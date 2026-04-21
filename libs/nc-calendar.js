function formatIcsDate(d) {
  return new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildGoogleCalendarUrl({ title, startIso, endIso, description, location }) {
  const fmt = (iso) => formatIcsDate(iso);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title || "Nature Club event",
    dates: `${fmt(startIso)}/${fmt(endIso)}`,
    details: description || "",
    location: location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
