import { sendEmail } from "@/libs/resend";
import { getSiteUrl } from "@/libs/site-url";
import { escapeHtml, categoryColors } from "@/libs/emails/styles";
import { emailShell, CONTACT_EMAIL } from "@/libs/emails/shell";

/**
 * Central notification dispatcher.
 * All notifications are sent via email (Resend).
 */
export async function notify({ to, subject, body, html }) {
    return sendEmail({
        to,
        subject,
        text: body,
        html: html || body,
    });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDate = (date) =>
    date
        ? new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        })
        : "";

const categoryPillHtml = (category) => {
    const hex = categoryColors[category];
    if (!hex) return "";
    return `<span class="category-pill" style="background:${hex};">${escapeHtml(category)}</span>`;
};

const ctaButtonHtml = (url, label) =>
    `<a class="cta-button" href="${escapeHtml(url)}">${escapeHtml(label)}</a>`;

const signoffHtml = `<p class="signoff">See you outside,<br>The Nature Club Team<br>${CONTACT_EMAIL}</p>`;

// ---------------------------------------------------------------------------
// Notification templates -- each returns { to, subject, body, html }
// All templates accept `email` as the recipient identifier.
// ---------------------------------------------------------------------------

export function rsvpConfirmedParticipant({ email, eventTitle, eventDate, eventUrl, category }) {
    const dateStr = formatDate(eventDate) || "a date TBA";
    const safeTitle = escapeHtml(eventTitle);

    return {
        to: email,
        subject: `You're in for ${eventTitle}!`,
        body: `You're in for ${eventTitle} on ${dateStr}!\n\nDetails: ${eventUrl}`,
        html: emailShell({
            headline: "You're in!",
            bodyHtml: `
                ${categoryPillHtml(category)}
                <p><strong>${safeTitle}</strong></p>
                <p>${escapeHtml(dateStr)}</p>
                ${eventUrl ? ctaButtonHtml(eventUrl, "View Event") : ""}
                ${signoffHtml}
            `,
        }),
    };
}

export function rsvpConfirmedHost({
    hostEmail,
    participantName,
    eventTitle,
    rsvpCount,
    groupSize,
    category,
}) {
    const safeTitle = escapeHtml(eventTitle);
    const safeName = escapeHtml(participantName);

    return {
        to: hostEmail,
        subject: `New RSVP for ${eventTitle}`,
        body: `${participantName} just RSVP'd for ${eventTitle} (${rsvpCount}/${groupSize}).`,
        html: emailShell({
            headline: "New RSVP",
            bodyHtml: `
                ${categoryPillHtml(category)}
                <p><strong>${safeName}</strong> just RSVP'd for <strong>${safeTitle}</strong>.</p>
                <p>${escapeHtml(rsvpCount)}/${escapeHtml(groupSize)} spots filled.</p>
                ${signoffHtml}
            `,
        }),
    };
}

export function waitlistJoined({ email, eventTitle, position, category }) {
    const safeTitle = escapeHtml(eventTitle);

    return {
        to: email,
        subject: `You're on the waitlist for ${eventTitle}`,
        body: `You're on the waitlist (#${position}) for ${eventTitle}. We'll let you know if a spot opens.`,
        html: emailShell({
            headline: "You're on the list",
            bodyHtml: `
                ${categoryPillHtml(category)}
                <p>You're <strong>#${escapeHtml(position)}</strong> on the waitlist for <strong>${safeTitle}</strong>.</p>
                <p>We'll let you know if a spot opens up.</p>
                ${signoffHtml}
            `,
        }),
    };
}

export function spotOpened({ email, eventTitle, confirmUrl, category }) {
    const safeTitle = escapeHtml(eventTitle);

    return {
        to: email,
        subject: `A spot opened for ${eventTitle}!`,
        body: `A spot opened for ${eventTitle}! Confirm in 2 hours: ${confirmUrl}`,
        html: emailShell({
            headline: "A spot opened!",
            bodyHtml: `
                ${categoryPillHtml(category)}
                <p>A spot just opened up for <strong>${safeTitle}</strong>.</p>
                <p>You have <strong>2 hours</strong> to confirm your spot before it goes to the next person.</p>
                ${ctaButtonHtml(confirmUrl, "Confirm Your Spot")}
                ${signoffHtml}
            `,
        }),
    };
}

export function waitlistExpired({ email, eventTitle }) {
    const safeTitle = escapeHtml(eventTitle);

    return {
        to: email,
        subject: `Waitlist update for ${eventTitle}`,
        body: `The spot for ${eventTitle} has been offered to the next person.`,
        html: emailShell({
            headline: "Waitlist update",
            bodyHtml: `
                <p>The spot for <strong>${safeTitle}</strong> has been offered to the next person in line.</p>
                ${signoffHtml}
            `,
        }),
    };
}

export function eventEdited({ email, eventTitle, changes, eventUrl, category }) {
    const safeTitle = escapeHtml(eventTitle);
    const changeLines = changes.map((c) => `- ${c}`).join("\n");
    const changeHtml = changes
        .map((c) => `<li style="margin:0 0 6px;color:rgba(255,255,255,0.78);">${escapeHtml(c)}</li>`)
        .join("");

    return {
        to: email,
        subject: `${eventTitle} updated`,
        body: `${eventTitle} has been updated:\n${changeLines}\n\nDetails: ${eventUrl}`,
        html: emailShell({
            headline: "Event updated",
            bodyHtml: `
                ${categoryPillHtml(category)}
                <p><strong>${safeTitle}</strong> has been updated:</p>
                <ul style="margin:0 0 16px;padding-left:20px;">${changeHtml}</ul>
                ${eventUrl ? ctaButtonHtml(eventUrl, "View Event") : ""}
                ${signoffHtml}
            `,
        }),
    };
}

export function rainCheckOn({ email, eventTitle, eventDate, note, category }) {
    const dateStr = formatDate(eventDate);
    const safeTitle = escapeHtml(eventTitle);

    return {
        to: email,
        subject: `${eventTitle} is ON!`,
        body: `${eventTitle} is ON for ${dateStr}.${note ? ` ${note}` : ""}`,
        html: emailShell({
            headline: "It's ON!",
            bodyHtml: `
                ${categoryPillHtml(category)}
                <p><strong>${safeTitle}</strong> is ON${dateStr ? ` for ${escapeHtml(dateStr)}` : ""}.</p>
                ${note ? `<p>${escapeHtml(note)}</p>` : ""}
                ${signoffHtml}
            `,
        }),
    };
}

export function rainCheckReschedule({ email, eventTitle, newDate, eventUrl, category }) {
    const dateStr = formatDate(newDate);
    const safeTitle = escapeHtml(eventTitle);

    return {
        to: email,
        subject: `${eventTitle} rescheduled`,
        body: `${eventTitle} has been rescheduled to ${dateStr}. Your RSVP is confirmed.\n\nDetails: ${eventUrl}`,
        html: emailShell({
            headline: "New date",
            bodyHtml: `
                ${categoryPillHtml(category)}
                <p><strong>${safeTitle}</strong> has been rescheduled to <strong>${escapeHtml(dateStr)}</strong>.</p>
                <p>Your RSVP is still confirmed.</p>
                ${eventUrl ? ctaButtonHtml(eventUrl, "View Event") : ""}
                ${signoffHtml}
            `,
        }),
    };
}

export function rainCheckCancel({ email, eventTitle, eventDate, reason, category }) {
    const dateStr = formatDate(eventDate);
    const safeTitle = escapeHtml(eventTitle);

    return {
        to: email,
        subject: `${eventTitle} cancelled`,
        body: `${eventTitle} on ${dateStr} has been cancelled.${reason ? ` Reason: ${reason}` : ""}`,
        html: emailShell({
            headline: "Cancelled",
            bodyHtml: `
                ${categoryPillHtml(category)}
                <p><strong>${safeTitle}</strong>${dateStr ? ` on ${escapeHtml(dateStr)}` : ""} has been cancelled.</p>
                ${reason ? `<p>Reason: ${escapeHtml(reason)}</p>` : ""}
                ${signoffHtml}
            `,
        }),
    };
}

export function duplicateNotify({
    email,
    hostName,
    eventTitle,
    newDate,
    eventUrl,
    category,
}) {
    const dateStr = formatDate(newDate);
    const safeTitle = escapeHtml(eventTitle);
    const safeHost = escapeHtml(hostName);

    return {
        to: email,
        subject: `${hostName} is running ${eventTitle} again!`,
        body: `${hostName} is running ${eventTitle} again on ${dateStr}.\n\nRSVP: ${eventUrl}`,
        html: emailShell({
            headline: "Back again!",
            bodyHtml: `
                ${categoryPillHtml(category)}
                <p><strong>${safeHost}</strong> is running <strong>${safeTitle}</strong> again on <strong>${escapeHtml(dateStr)}</strong>.</p>
                ${eventUrl ? ctaButtonHtml(eventUrl, "RSVP") : ""}
                ${signoffHtml}
            `,
        }),
    };
}

/**
 * Helper: build the full event URL from a slug.
 */
export function eventUrl(slug) {
    return `${getSiteUrl()}/e/${slug}`;
}
