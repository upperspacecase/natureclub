import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";
import EventLike from "@/models/EventLike";
import User from "@/models/User";
import Visit from "@/models/Visit";
import events from "@/data/events";

export async function POST(req) {
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

  await connectMongo();

  try {
    const [
      totalLeads,
      participantLeads,
      hostLeads,
      likesTotal,
      usersTotal,
      visits,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ role: "participant" }),
      Lead.countDocuments({ role: "host_interest" }),
      EventLike.countDocuments(),
      User.countDocuments(),
      Visit.find({}).lean(),
    ]);

    const visitsTotal = visits.reduce((sum, visit) => sum + visit.count, 0);
    const today = new Date().toISOString().slice(0, 10);
    const visitsToday = visits.find((visit) => visit.date === today)?.count || 0;

    return NextResponse.json({
      visitsTotal,
      visitsToday,
      signupsTotal: totalLeads,
      signupsParticipant: participantLeads,
      signupsHostInterest: hostLeads,
      eventsTotal: events.length,
      likesTotal,
      usersTotal,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
