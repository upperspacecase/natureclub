import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Event from "@/models/Event";
import eventsSeed, { THEMES } from "@/data/events";
import { normalizeRegionDisplay, toRegionKey } from "@/libs/regions";

const allowedThemeIds = new Set(THEMES.map((theme) => theme.id));
const BYPASS_ADMIN_AUTH = false;

export async function POST(req) {
  const body = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!BYPASS_ADMIN_AUTH) {
    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin password not configured" },
        { status: 500 }
      );
    }

    if (!body?.password || body.password !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  await connectMongo();

  try {
    if (body?.action === "list") {
      const events = await Event.find({})
        .select(
          "eventId title tags themes region regionKey facilitatorName facilitatorEmail startsAt"
        )
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
      const region = normalizeRegionDisplay(body?.region);
      const facilitatorName =
        typeof body?.facilitatorName === "string"
          ? body.facilitatorName.trim()
          : "";
      const facilitatorEmail =
        typeof body?.facilitatorEmail === "string"
          ? body.facilitatorEmail.trim().toLowerCase()
          : "";
      const startsAt =
        typeof body?.startsAt === "string" && body.startsAt
          ? new Date(body.startsAt)
          : null;
      const isValidStartDate =
        startsAt instanceof Date && !Number.isNaN(startsAt.getTime());

      const event = await Event.findOneAndUpdate(
        { eventId },
        {
          $set: {
            tags,
            themes,
            region,
            regionKey: toRegionKey(region),
            facilitatorName,
            facilitatorEmail,
            startsAt: isValidStartDate ? startsAt : null,
          },
        },
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

    if (body?.action === "seed") {
      const operations = eventsSeed.map((event) => ({
        updateOne: {
          filter: { eventId: event.id },
          update: {
            $set: {
              title: event.title || event.headline || "Founding member",
              image: event.image,
              categoryTag: event.categoryTag || "",
              attributeTags: event.attributeTags || [],
              themes: event.themes || [],
              type: event.type || "experience",
              headline: event.headline || "",
              buttonText: event.buttonText || "",
              eventId: event.id,
              region: "",
              regionKey: "",
              facilitatorName: "",
              facilitatorEmail: "",
              startsAt: null,
            },
          },
          upsert: true,
        },
      }));

      const result = await Event.bulkWrite(operations);
      await Event.deleteMany({
        eventId: { $nin: eventsSeed.map((event) => event.id) },
      });

      return NextResponse.json({
        inserted: result?.upsertedCount || 0,
        modified: result?.modifiedCount || 0,
        matched: result?.matchedCount || 0,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
