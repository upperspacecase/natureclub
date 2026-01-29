import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import VisitSession from "@/models/VisitSession";

export async function POST(req) {
  await connectMongo();

  const body = await req.json();
  const durationMs = Number(body?.durationMs);

  if (!Number.isFinite(durationMs) || durationMs < 0) {
    return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
  }

  try {
    await VisitSession.create({
      durationMs,
      country: body.country || "",
    });
    return NextResponse.json({});
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
