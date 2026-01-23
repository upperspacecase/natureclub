import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Event from "@/models/Event";

export async function GET() {
  await connectMongo();

  try {
    const [event] = await Event.aggregate([{ $sample: { size: 1 } }]);
    return NextResponse.json({ image: event?.image || null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load event" }, { status: 500 });
  }
}
