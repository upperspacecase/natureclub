import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Visit from "@/models/Visit";

export async function POST() {
  await connectMongo();
  const today = new Date().toISOString().slice(0, 10);

  try {
    await Visit.findOneAndUpdate(
      { date: today },
      { $inc: { count: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json({});
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
