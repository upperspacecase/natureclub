import { ImageResponse } from "next/og";
import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Facilitator from "@/models/Facilitator";
import { getSiteUrl } from "@/libs/site-url";

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

        const facilitator = await Facilitator.findById(event.facilitatorId);
        const siteUrl = getSiteUrl();

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

        const activityLabel = event.activityType
            ? event.activityType
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : "";

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

                    {/* Middle: event info */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "24px",
                        }}
                    >
                        {activityLabel && (
                            <div style={{ display: "flex" }}>
                                <span
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.12)",
                                        borderRadius: "24px",
                                        padding: "8px 20px",
                                        fontSize: "24px",
                                        color: "#d6d3d1",
                                    }}
                                >
                                    {activityLabel}
                                </span>
                            </div>
                        )}
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
                            {facilitator?.name && <span>🌿 with {facilitator.name}</span>}
                            {event.groupSize && (
                                <span>👥 {event.groupSize} spots</span>
                            )}
                        </div>
                    </div>

                    {/* Bottom: CTA */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                backgroundColor: "#fafaf9",
                                color: "#292524",
                                padding: "20px 60px",
                                borderRadius: "40px",
                                fontSize: "32px",
                                fontWeight: 600,
                            }}
                        >
                            RSVP — I&apos;m in 🌱
                        </div>
                        <span style={{ fontSize: "22px", color: "#78716c" }}>
                            {siteUrl}/e/{event.slug}
                        </span>
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
