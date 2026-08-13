import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";
import { sendEmailWithRetry } from "@/libs/resend";
import {
  LEAD_STATUS,
  SIGNUP_QUESTION_VERSION,
  extractLocationForCountry,
  getSessionId,
  isValidEmail,
  normalizeLeadResponses,
  validateSubmittedLead,
} from "@/libs/signup";
import { normalizeRegionDisplay, toRegionKey } from "@/libs/regions";
import { getMemberWelcomeEmail, getHostWelcomeEmail } from "@/libs/emails/welcome";

export async function POST(req) {
  await connectMongo();

  const body = await req.json();
  const allowedRoles = ["host", "member"];

  if (!isValidEmail(body?.email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  if (!body?.role || !allowedRoles.includes(body.role)) {
    return NextResponse.json({ error: "Role is required" }, { status: 400 });
  }

  const source = typeof body?.source === "string" && body.source.trim()
    ? body.source.trim()
    : "button";

  // Lightweight capture from empty states: email only, no questionnaire,
  // no welcome email. Role defaults to member.
  if (source === "notify") {
    const role = allowedRoles.includes(body?.role) ? body.role : "member";
    const existing = await Lead.findOne({ email: body.email, role }).lean();
    if (existing) {
      return NextResponse.json({ id: existing._id, status: existing.status });
    }
    const lead = await Lead.create({
      email: body.email,
      role,
      source,
      responses: normalizeLeadResponses(role, {}),
      status: LEAD_STATUS.SUBMITTED,
      submittedAt: new Date(),
      questionVersion: SIGNUP_QUESTION_VERSION,
      sessionId: getSessionId(body?.sessionId),
      welcomeEmailSentAt: null,
      country: "",
    });
    return NextResponse.json({ id: lead._id, status: lead.status });
  }

  const responses = normalizeLeadResponses(body.role, body?.responses);
  const validationError = validateSubmittedLead(body.role, responses);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const now = new Date();
  const questionVersion =
    typeof body?.questionVersion === "string" && body.questionVersion.trim()
      ? body.questionVersion.trim()
      : SIGNUP_QUESTION_VERSION;
  const sessionId = getSessionId(body?.sessionId);
  const draftId = typeof body?.draftId === "string" ? body.draftId.trim() : "";

  try {
    const country = await resolveCountry(body.role, responses);
    const leadRegion = getLeadRegion(body.role, responses, country);

    const baseSet = {
      email: body.email,
      role: body.role,
      source,
      responses,
      country,
      region: leadRegion,
      regionKey: toRegionKey(leadRegion),
      status: LEAD_STATUS.SUBMITTED,
      submittedAt: now,
      questionVersion,
      sessionId,
      ...(draftId ? { draftId } : {}),
    };

    let lead;

    if (draftId) {
      lead = await Lead.findOneAndUpdate(
        { draftId, role: body.role },
        {
          $set: baseSet,
          $setOnInsert: {
            welcomeEmailSentAt: null,
          },
        },
        { new: true, upsert: true }
      );
    } else {
      lead = await Lead.create({
        ...baseSet,
        welcomeEmailSentAt: null,
      });
    }

    let emailStatus = "skipped";
    let emailErrorMessage = "";

    if (!lead.welcomeEmailSentAt) {
      try {
        const emailContent =
          body.role === "host"
            ? getHostWelcomeEmail({ responses })
            : getMemberWelcomeEmail({ responses });

        await sendEmailWithRetry(
          {
            to: body.email,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html,
          },
          { retries: 1, retryDelayMs: 600 }
        );

        emailStatus = "sent";

        try {
          await Lead.updateOne(
            { _id: lead._id },
            { $set: { welcomeEmailSentAt: new Date() } }
          );
        } catch (updateError) {
          console.error(
            "Welcome email sent but failed to persist welcomeEmailSentAt:",
            updateError?.message || "Unknown update error"
          );
        }

      } catch (emailError) {
        emailStatus = "failed";
        emailErrorMessage = emailError?.message || "Welcome email failed";
        console.error("Failed to send welcome email:", emailErrorMessage);
      }
    } else {
      emailStatus = "already_sent";
    }

    return NextResponse.json({
      id: lead._id,
      draftId: lead.draftId || "",
      status: lead.status,
      emailStatus,
      ...(emailErrorMessage ? { emailError: emailErrorMessage } : {}),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

const parseCoords = (coords) => {
  if (!coords || typeof coords !== "string") return null;
  const parts = coords.split(",").map((part) => part.trim());
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lon = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
};

const normalizeCountry = (country, countryCode) => {
  if (country && typeof country === "string") return country;
  if (countryCode && typeof countryCode === "string") {
    return countryCode.toUpperCase();
  }
  return "";
};

const fetchCountry = async (url) => {
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) return "";
  const data = await response.json();
  return normalizeCountry(data?.address?.country, data?.address?.country_code);
};

const resolveCountry = async (role, responses) => {
  const apiKey = process.env.LOCATIONIQ_API_KEY;
  if (!apiKey) return "";

  try {
    const location = extractLocationForCountry(role, responses);
    const coords = parseCoords(location?.coords);

    if (coords) {
      const url = `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${coords.lat}&lon=${coords.lon}&format=json`;
      return fetchCountry(url);
    }

    const city = location?.city?.trim();
    if (!city) return "";

    const url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(
      city
    )}&format=json&limit=1`;
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) return "";

    const data = await response.json();
    return normalizeCountry(
      data?.[0]?.address?.country,
      data?.[0]?.address?.country_code
    );
  } catch (error) {
    console.error("resolveCountry failed:", error.message);
    return "";
  }
};

const getLeadRegion = (role, responses, country) => {
  const responseRegion =
    role === "member"
      ? responses?.member?.locationCity
      : responses?.host?.locationCity;
  const normalizedRegion = normalizeRegionDisplay(responseRegion);
  const fallbackCountry = `${country || ""}`.trim();
  return normalizedRegion || fallbackCountry || "Unknown";
};
