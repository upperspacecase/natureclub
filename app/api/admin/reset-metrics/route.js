import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Visit from "@/models/Visit";
import VisitSession from "@/models/VisitSession";
import Lead from "@/models/Lead";
import Click from "@/models/Click";
import EventLike from "@/models/EventLike";
import User from "@/models/User";

const BYPASS_ADMIN_AUTH = false;

export async function POST(req) {
  await connectMongo();
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

  try {
    const shouldResetLeads =
      body?.includeLeads === true && body?.confirm === "RESET_LEADS";

    // Reset all admin/metrics tracking collections to empty
    // Keep events and lead responses intact by default.
    await Promise.all([
      // Daily visit counts
      Visit.updateMany({}, { $set: { count: 0 } }),
      // Time-on-page sessions
      VisitSession.deleteMany({}),
      ...(shouldResetLeads
        ? [
            Lead.deleteMany({}),
          ]
        : []),
      // Click tracking
      Click.deleteMany({}),
      // Event likes
      EventLike.deleteMany({}),
      // Users
      User.deleteMany({}),
    ]);

    return NextResponse.json({
      success: true,
      message: shouldResetLeads
        ? "Metrics and lead records reset."
        : "Metrics reset. Lead records preserved.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
