import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";
import {
  LEAD_STATUS,
  SIGNUP_QUESTION_VERSION,
  getSessionId,
  isValidEmail,
  normalizeLeadResponses,
} from "@/libs/signup";

export async function POST(req) {
  const body = await req.json();
  const shouldAllowDrafts = process.env.ALLOW_SIGNUP_DRAFTS === "true";
  if (!shouldAllowDrafts) {
    return NextResponse.json(
      {
        error: "Draft saving is disabled. Submit the form to save.",
        role: body?.role || "",
      },
      { status: 410 }
    );
  }

  await connectMongo();
  const allowedRoles = ["host", "member"];

  if (!body?.role || !allowedRoles.includes(body.role)) {
    return NextResponse.json({ error: "Role is required" }, { status: 400 });
  }

  if (body?.email && !isValidEmail(body.email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const draftId =
    typeof body?.draftId === "string" && body.draftId.trim()
      ? body.draftId.trim()
      : randomUUID();
  const source = typeof body?.source === "string" && body.source.trim()
    ? body.source.trim()
    : "modal";
  const questionVersion =
    typeof body?.questionVersion === "string" && body.questionVersion.trim()
      ? body.questionVersion.trim()
      : SIGNUP_QUESTION_VERSION;
  const sessionId = getSessionId(body?.sessionId);
  const responses = normalizeLeadResponses(body.role, body?.responses);

  try {
    const lead = await Lead.findOneAndUpdate(
      { draftId, role: body.role },
      {
        $set: {
          status: LEAD_STATUS.DRAFT,
          source,
          responses,
          questionVersion,
          sessionId,
          ...(body?.email ? { email: body.email } : {}),
        },
        $setOnInsert: {
          draftId,
          role: body.role,
          email: body?.email || `${draftId}@draft.local`,
          welcomeEmailSentAt: null,
          submittedAt: null,
          country: "",
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    return NextResponse.json({
      draftId: lead.draftId,
      status: lead.status,
      updatedAt: lead.updatedAt,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
