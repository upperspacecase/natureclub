import connectMongo from "@/libs/mongoose";
import mongoose from "mongoose";
import { importParksEvents } from "@/libs/nyc-parks-import";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET — weekly Vercel cron: refresh the NYC Parks event supply.
// Vercel sends `Authorization: Bearer ${CRON_SECRET}` when the env var is set.
export async function GET(req) {
    const auth = req.headers.get("authorization") || "";
    if (
        !process.env.CRON_SECRET ||
        auth !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectMongo();
        const result = await importParksEvents(mongoose.connection.db);
        console.log(
            `cron import-events: rows=${result.totalRows} aligned=${result.aligned} selected=${result.selected} created=${result.created} updated=${result.updated}`
        );
        return Response.json(result);
    } catch (error) {
        console.error("cron import-events failed:", error.message);
        return Response.json({ error: "Import failed" }, { status: 500 });
    }
}
