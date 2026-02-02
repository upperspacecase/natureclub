import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Visit from "@/models/Visit";
import VisitSession from "@/models/VisitSession";
import Lead from "@/models/Lead";
import Click from "@/models/Click";
import EventLike from "@/models/EventLike";
import User from "@/models/User";

export async function POST(req) {
  await connectMongo();
  const body = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: "Admin password not configured" },
      { status: 500 }
    );
  }

  if (!body?.password || body.password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Reset all admin/metrics tracking collections to empty
    // Keep events table intact (contains seed/mock data)
    await Promise.all([
      // Daily visit counts
      Visit.updateMany({}, { $set: { count: 0 } }),
      // Time-on-page sessions
      VisitSession.deleteMany({}),
      // Lead submissions (member/host only)
      Lead.updateMany(
        {},
        {
          $set: {
            source: "button",
            responses: {},
          },
        }
      ),
      // Click tracking
      Click.deleteMany({}),
      // Event likes
      EventLike.deleteMany({}),
      // Users
      User.deleteMany({}),
    ]);

    return NextResponse.json({
      success: true,
      message: "All metrics reset to zero. Events kept intact.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}