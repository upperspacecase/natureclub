import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Click from "@/models/Click";

export async function POST(req) {
  await connectMongo();

  const body = await req.json();
  const allowedTypes = ["member_click", "host_click"];

  if (!body?.type || !allowedTypes.includes(body.type)) {
    return NextResponse.json({ error: "Invalid click type" }, { status: 400 });
  }

  try {
    await Click.create({
      type: body.type,
      country: body.country || "",
    });
    return NextResponse.json({});
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
