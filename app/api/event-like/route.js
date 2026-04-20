import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import EventLike from "@/models/EventLike";
import { getAuthUser } from "@/libs/auth";

export async function GET(req) {
  await connectMongo();
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  const user = await getAuthUser();

  const or = [];
  if (user) or.push({ userId: user._id });
  if (clientId) or.push({ clientId });

  if (or.length === 0) {
    return NextResponse.json({ likedEventIds: [] });
  }

  try {
    const likes = await EventLike.find({ $or: or }).select("eventId -_id");
    const likedEventIds = [...new Set(likes.map((l) => l.eventId))];
    return NextResponse.json({ likedEventIds });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connectMongo();
  const body = await req.json();

  if (!body.eventId) {
    return NextResponse.json({ error: "eventId is required" }, { status: 400 });
  }

  const user = await getAuthUser();

  // Authed saves use userId; anonymous falls back to clientId.
  const query = user
    ? { eventId: body.eventId, userId: user._id }
    : body.clientId
      ? { eventId: body.eventId, clientId: body.clientId }
      : null;

  if (!query) {
    return NextResponse.json(
      { error: "clientId required when signed out" },
      { status: 400 }
    );
  }

  try {
    const existing = await EventLike.findOne(query);
    if (existing) {
      await EventLike.deleteOne({ _id: existing._id });
      return NextResponse.json({ liked: false });
    }
    await EventLike.create(query);
    return NextResponse.json({ liked: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
