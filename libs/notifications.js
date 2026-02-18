import { sendEmail } from "@/libs/resend";
import { sendSms } from "@/libs/twilio";
import { getSiteUrl } from "@/libs/site-url";

/**
 * Central notification dispatcher.
 *
 * Routes to SMS (Twilio) for phone numbers, email (Resend) for email addresses.
 */
export async function notify({ to, subject, body, html }) {
    // Phone number → SMS
    if (to && to.startsWith("+")) {
        return sendSms(to, body);
    }

    // Email address → Resend
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

export function rsvpConfirmedParticipant({ phone, eventTitle, eventDate, eventUrl }) {
    const dateStr = eventDate
        ? new Date(eventDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        })
        : "a date TBA";

    return {
        to: phone,
        subject: `You're in for ${eventTitle}!`,
        body: `You're in for ${eventTitle} on ${dateStr}!\n\nDetails: ${eventUrl}`,
    };
}

export function rsvpConfirmedHost({
    hostPhone,
    participantName,
    eventTitle,
    rsvpCount,
    groupSize,
}) {
    return {
        to: hostPhone,
        subject: `New RSVP for ${eventTitle}`,
        body: `${participantName} just RSVP'd for ${eventTitle} (${rsvpCount}/${groupSize}).`,
    };
}

export function waitlistJoined({ phone, eventTitle, position }) {
    return {
        to: phone,
        subject: `You're on the waitlist for ${eventTitle}`,
        body: `You're on the waitlist (#${position}) for ${eventTitle}. We'll let you know if a spot opens.`,
    };
}

export function spotOpened({ phone, eventTitle, confirmUrl }) {
    return {
        to: phone,
        subject: `A spot opened for ${eventTitle}!`,
        body: `A spot opened for ${eventTitle}! Confirm in 2 hours: ${confirmUrl}`,
    };
}

export function waitlistExpired({ phone, eventTitle }) {
    return {
        to: phone,
        subject: `Waitlist update for ${eventTitle}`,
        body: `The spot for ${eventTitle} has been offered to the next person.`,
    };
}

export function eventEdited({ phone, eventTitle, changes, eventUrl }) {
    const changeLines = changes.map((c) => `• ${c}`).join("\n");
    return {
        to: phone,
        subject: `${eventTitle} updated`,
        body: `${eventTitle} has been updated:\n${changeLines}\n\nDetails: ${eventUrl}`,
    };
}

export function rainCheckOn({ phone, eventTitle, eventDate, note }) {
    const dateStr = eventDate
        ? new Date(eventDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        })
        : "";
    return {
        to: phone,
        subject: `${eventTitle} is ON!`,
        body: `${eventTitle} is ON for ${dateStr}.${note ? ` ${note}` : ""}`,
    };
}

export function rainCheckReschedule({ phone, eventTitle, newDate, eventUrl }) {
    const dateStr = new Date(newDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
    return {
        to: phone,
        subject: `${eventTitle} rescheduled`,
        body: `${eventTitle} has been rescheduled to ${dateStr}. Your RSVP is confirmed.\n\nDetails: ${eventUrl}`,
    };
}

export function rainCheckCancel({ phone, eventTitle, eventDate, reason }) {
    const dateStr = eventDate
        ? new Date(eventDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        })
        : "";
    return {
        to: phone,
        subject: `${eventTitle} cancelled`,
        body: `${eventTitle} on ${dateStr} has been cancelled.${reason ? ` Reason: ${reason}` : ""}`,
    };
}

export function duplicateNotify({
    phone,
    hostName,
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
        to: phone,
        subject: `${hostName} is running ${eventTitle} again!`,
        body: `${hostName} is running ${eventTitle} again on ${dateStr}.\n\nRSVP: ${eventUrl}`,
    };
}

/**
 * Helper: build the full event URL from a slug.
 */
export function eventUrl(slug) {
    return `${getSiteUrl()}/e/${slug}`;
}
