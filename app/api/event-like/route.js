import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import EventLike from "@/models/EventLike";

export async function GET(req) {
  await connectMongo();
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  try {
    const likes = await EventLike.find({ clientId }).select("eventId -_id");
    const likedEventIds = likes.map((like) => like.eventId);
    return NextResponse.json({ likedEventIds });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connectMongo();
  const body = await req.json();

  if (!body.eventId || !body.clientId) {
    return NextResponse.json(
      { error: "eventId and clientId are required" },
      { status: 400 }
    );
  }

  try {
    const existing = await EventLike.findOne({
      eventId: body.eventId,
      clientId: body.clientId,
    });

    if (existing) {
      await EventLike.deleteOne({ _id: existing._id });
      return NextResponse.json({ liked: false });
    }

    await EventLike.create({
      eventId: body.eventId,
      clientId: body.clientId,
    });

    return NextResponse.json({ liked: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
