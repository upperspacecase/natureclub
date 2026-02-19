import { ImageResponse } from "next/og";
import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import User from "@/models/User";

export const runtime = "nodejs";

// GET — Generate a 1080x1920 Instagram Story card image
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        await connectMongo();

        const event = await BookingEvent.findById(id);
        if (!event) {
            return Response.json({ error: "Event not found" }, { status: 404 });
        }

        const host = await User.findById(event.createdBy);

        const dateStr = event.dateTime
            ? new Date(event.dateTime).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
            })
            : "Date TBA";

        const timeStr = event.dateTime
            ? new Date(event.dateTime).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
            })
            : "";

        const locationStr = event.meetingPoint?.description || "";

        function fmtDur(mins) {
            if (!mins) return "";
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            if (h === 0) return `${m} min`;
            if (m === 0) return `${h} hr`;
            return `${h} hr ${m} min`;
        }
        const durationStr = fmtDur(event.durationMinutes);

        return new ImageResponse(
            (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        width: "100%",
                        height: "100%",
                        padding: "80px 60px",
                        backgroundColor: "#292524",
                        color: "#fafaf9",
                        fontFamily: "serif",
                    }}
                >
                    {/* Top: branding */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            fontSize: "28px",
                            color: "#a8a29e",
                        }}
                    >
                        🌿 Nature Club
                    </div>

                    {/* Top: title */}
                    <div
                        style={{
                            fontSize: "72px",
                            fontWeight: 700,
                            lineHeight: 1.1,
                            maxWidth: "900px",
                        }}
                    >
                        {event.title}
                    </div>

                    {/* Bottom-left: details */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            fontSize: "28px",
                            color: "#a8a29e",
                        }}
                    >
                        <span>📅 {dateStr}{timeStr ? ` at ${timeStr}` : ""}</span>
                        {durationStr && <span>⏱ {durationStr}</span>}
                        {locationStr && <span>📍 {locationStr}</span>}
                        {host?.name && <span>🌿 with {host.name}</span>}
                        {event.groupSize > 0 && (
                            <span>👥 {event.groupSize} spots</span>
                        )}
                    </div>
                </div>
            ),
            { width: 1080, height: 1920 }
        );
    } catch (error) {
        console.error("GET /api/events/[id]/story-card error:", error);
        return Response.json({ error: "Failed to generate card" }, { status: 500 });
    }
}
