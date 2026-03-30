import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import EventLike from "@/models/EventLike";
import BookingEvent from "@/models/BookingEvent";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json([]);
  }

  await connectMongo();

  const likes = await EventLike.find({ clientId }).lean();
  const eventIds = likes.map((l) => l.eventId);

  if (eventIds.length === 0) {
    return NextResponse.json([]);
  }

  const events = await BookingEvent.find({
    _id: { $in: eventIds },
    status: "published",
  })
    .select("title slug coverPhotoUrl dateTime")
    .lean();

  return NextResponse.json(events);
}
