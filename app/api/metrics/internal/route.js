import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";
import { LEAD_STATUS } from "@/libs/signup";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const expected = process.env.METRICS_INTERNAL_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  const header = request.headers.get("authorization") || "";
  if (header !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectMongo();

  const signups = await Lead.countDocuments({
    role: { $in: ["host", "member"] },
    $or: [{ status: LEAD_STATUS.SUBMITTED }, { status: { $exists: false } }],
  });

  return NextResponse.json({
    signups,
    waitlist: null, // Nature Club has no separate waitlist model
  });
}
