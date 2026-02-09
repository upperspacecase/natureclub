import { NextResponse } from "next/server";
import { sendEmail } from "@/libs/resend";

const BYPASS_ADMIN_AUTH = false;

export async function POST(req) {
  const body = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!BYPASS_ADMIN_AUTH) {
    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin password not configured" },
        { status: 500 }
      );
    }

    if (!body?.password || body.password !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  const to = typeof body?.to === "string" ? body.to.trim() : "";
  if (!to || !/\S+@\S+\.\S+/.test(to)) {
    return NextResponse.json({ error: "Valid recipient email is required" }, { status: 400 });
  }

  try {
    const result = await sendEmail({
      to,
      subject: "Nature Club Resend test",
      text: "This is a test email from Nature Club.",
      html: "<p>This is a test email from Nature Club.</p>",
    });

    return NextResponse.json({
      success: true,
      to,
      id: result?.id || "",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.message || "Email send failed" },
      { status: 500 }
    );
  }
}
