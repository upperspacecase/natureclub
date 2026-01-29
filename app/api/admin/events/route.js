import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Event from "@/models/Event";
import { THEMES } from "@/data/events";

const allowedThemeIds = new Set(THEMES.map((theme) => theme.id));

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
    if (body?.action === "list") {
      const events = await Event.find({})
        .select("eventId title tags themes")
        .sort({ title: 1 })
        .lean();
      return NextResponse.json({ events });
    }

    if (body?.action === "update") {
      const eventId = body?.eventId;
      if (!eventId) {
        return NextResponse.json(
          { error: "eventId is required" },
          { status: 400 }
        );
      }

      const tags = Array.isArray(body?.tags)
        ? body.tags.map((tag) => `${tag}`.trim()).filter(Boolean)
        : [];
      const themes = Array.isArray(body?.themes)
        ? body.themes
            .map((theme) => `${theme}`.trim())
            .filter((theme) => allowedThemeIds.has(theme))
        : [];

      const event = await Event.findOneAndUpdate(
        { eventId },
        { $set: { tags, themes } },
        { new: true }
      ).lean();

      if (!event) {
        return NextResponse.json(
          { error: "Event not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ event });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
