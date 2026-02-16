/**
 * Generate calendar data from an event.
 * Returns .ics file content and a Google Calendar deep link.
 */

/**
 * Build an .ics file string for a single event.
 */
export function generateIcs({ title, dateTime, durationMinutes, location, description, url }) {
    const start = formatIcsDate(new Date(dateTime));
    const end = formatIcsDate(
        new Date(new Date(dateTime).getTime() + durationMinutes * 60 * 1000)
    );

    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Nature Club//Event//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${escapeIcs(title)}`,
        location ? `LOCATION:${escapeIcs(location)}` : null,
        description ? `DESCRIPTION:${escapeIcs(description)}` : null,
        url ? `URL:${url}` : null,
        `UID:${Date.now()}@natureclub.com`,
        "END:VEVENT",
        "END:VCALENDAR",
    ];

    return lines.filter(Boolean).join("\r\n");
}

/**
 * Build a Google Calendar "Add Event" URL.
 */
export function googleCalendarUrl({ title, dateTime, durationMinutes, location, description }) {
    const start = formatGcalDate(new Date(dateTime));
    const end = formatGcalDate(
        new Date(new Date(dateTime).getTime() + durationMinutes * 60 * 1000)
    );

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: title,
        dates: `${start}/${end}`,
        ...(location && { location }),
        ...(description && { details: description }),
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a Date as iCal UTC: 20260215T140000Z */
function formatIcsDate(date) {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Format a Date for Google Calendar: 20260215T140000Z */
function formatGcalDate(date) {
    return formatIcsDate(date);
}

/** Escape special chars for .ics text fields */
function escapeIcs(text) {
    return text
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\n/g, "\\n");
}
