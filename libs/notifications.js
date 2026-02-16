import { sendEmail } from "@/libs/resend";
import { getSiteUrl } from "@/libs/site-url";

/**
 * Central notification dispatcher.
 *
 * v1: sends email via Resend.
 * When Twilio is ready, swap the transport inside this function.
 * Nothing else in the codebase needs to change.
 */
export async function notify({ to, subject, body, html }) {
    // `to` is an email address (v1) — will become a phone number for SMS later
    return sendEmail({
        to,
        subject,
        text: body,
        html: html || body,
    });
}

// ---------------------------------------------------------------------------
// Notification templates — each returns { to, subject, body }
// ---------------------------------------------------------------------------

export function rsvpConfirmedParticipant({ email, eventTitle, eventDate, eventUrl }) {
    const dateStr = eventDate
        ? new Date(eventDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        })
        : "a date TBA";

    return {
        to: email,
        subject: `You're in for ${eventTitle}!`,
        body: `You're in for ${eventTitle} on ${dateStr}!\n\nDetails: ${eventUrl}`,
    };
}

export function rsvpConfirmedFacilitator({
    facilitatorEmail,
    participantName,
    eventTitle,
    rsvpCount,
    groupSize,
}) {
    return {
        to: facilitatorEmail,
        subject: `New RSVP for ${eventTitle}`,
        body: `${participantName} just RSVP'd for ${eventTitle} (${rsvpCount}/${groupSize}).`,
    };
}

export function waitlistJoined({ email, eventTitle, position }) {
    return {
        to: email,
        subject: `You're on the waitlist for ${eventTitle}`,
        body: `You're on the waitlist (#${position}) for ${eventTitle}. We'll let you know if a spot opens.`,
    };
}

export function spotOpened({ email, eventTitle, confirmUrl }) {
    return {
        to: email,
        subject: `A spot opened for ${eventTitle}!`,
        body: `A spot opened for ${eventTitle}! Confirm in 2 hours: ${confirmUrl}`,
    };
}

export function waitlistExpired({ email, eventTitle }) {
    return {
        to: email,
        subject: `Waitlist update for ${eventTitle}`,
        body: `The spot for ${eventTitle} has been offered to the next person.`,
    };
}

export function eventEdited({ email, eventTitle, changes, eventUrl }) {
    const changeLines = changes.map((c) => `• ${c}`).join("\n");
    return {
        to: email,
        subject: `${eventTitle} updated`,
        body: `${eventTitle} has been updated:\n${changeLines}\n\nDetails: ${eventUrl}`,
    };
}

export function rainCheckOn({ email, eventTitle, eventDate, note }) {
    const dateStr = eventDate
        ? new Date(eventDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        })
        : "";
    return {
        to: email,
        subject: `${eventTitle} is ON!`,
        body: `${eventTitle} is ON for ${dateStr}.${note ? ` ${note}` : ""}`,
    };
}

export function rainCheckReschedule({ email, eventTitle, newDate, eventUrl }) {
    const dateStr = new Date(newDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
    return {
        to: email,
        subject: `${eventTitle} rescheduled`,
        body: `${eventTitle} has been rescheduled to ${dateStr}. Your RSVP is confirmed.\n\nDetails: ${eventUrl}`,
    };
}

export function rainCheckCancel({ email, eventTitle, eventDate, reason }) {
    const dateStr = eventDate
        ? new Date(eventDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        })
        : "";
    return {
        to: email,
        subject: `${eventTitle} cancelled`,
        body: `${eventTitle} on ${dateStr} has been cancelled.${reason ? ` Reason: ${reason}` : ""}`,
    };
}

export function duplicateNotify({
    email,
    facilitatorName,
    eventTitle,
    newDate,
    eventUrl,
}) {
    const dateStr = new Date(newDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
    return {
        to: email,
        subject: `${facilitatorName} is running ${eventTitle} again!`,
        body: `${facilitatorName} is running ${eventTitle} again on ${dateStr}.\n\nRSVP: ${eventUrl}`,
    };
}

/**
 * Helper: build the full event URL from a slug.
 */
export function eventUrl(slug) {
    return `${getSiteUrl()}/e/${slug}`;
}
