function icsEscape(s = "") {
  return String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function formatIcsDate(d) {
  // YYYYMMDDTHHmmssZ
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

export function buildIcs({ title, startIso, endIso, description, location, url, uid }) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nature Club//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid || `nc-${Date.now()}@natureclub`}`,
    `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
    `DTSTART:${formatIcsDate(startIso)}`,
    `DTEND:${formatIcsDate(endIso)}`,
    `SUMMARY:${icsEscape(title)}`,
    description ? `DESCRIPTION:${icsEscape(description)}` : "",
    location ? `LOCATION:${icsEscape(location)}` : "",
    url ? `URL:${icsEscape(url)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

export function downloadIcsFile(name, icsContent) {
  if (typeof window === "undefined") return;
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
