import { ImageResponse } from "next/og";
import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Facilitator from "@/models/Facilitator";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Event";

export default async function Image({ params }) {
    const { slug } = await params;
    await connectMongo();

    const event = await BookingEvent.findOne({ slug, status: "published" });
    if (!event) {
        return new ImageResponse(
            (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#f8f6f3",
                        fontSize: 48,
                        color: "#78716c",
                    }}
                >
                    Event not found
                </div>
            ),
            { ...size }
        );
    }

    const facilitator = await Facilitator.findById(event.facilitatorId);

    const dateStr = event.dateTime
        ? new Date(event.dateTime).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        })
        : "";

    const activityLabel = event.activityType
        ? event.activityType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "";

    return new ImageResponse(
        (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    width: "100%",
                    height: "100%",
                    padding: "60px",
                    backgroundColor: "#292524",
                    color: "#fafaf9",
                    fontFamily: "serif",
                }}
            >
                {/* Badge */}
                {activityLabel && (
                    <div
                        style={{
                            display: "flex",
                            marginBottom: "16px",
                        }}
                    >
                        <span
                            style={{
                                backgroundColor: "rgba(255,255,255,0.15)",
                                borderRadius: "20px",
                                padding: "6px 16px",
                                fontSize: "20px",
                                color: "#d6d3d1",
                            }}
                        >
                            {activityLabel}
                        </span>
                    </div>
                )}

                {/* Title */}
                <div
                    style={{
                        fontSize: "64px",
                        fontWeight: 700,
                        lineHeight: 1.1,
                        marginBottom: "20px",
                        maxWidth: "900px",
                    }}
                >
                    {event.title}
                </div>

                {/* Date + Facilitator */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        fontSize: "24px",
                        color: "#a8a29e",
                    }}
                >
                    {dateStr && <span>{dateStr}</span>}
                    {dateStr && facilitator?.name && <span>·</span>}
                    {facilitator?.name && <span>with {facilitator.name}</span>}
                </div>

                {/* Nature Club branding */}
                <div
                    style={{
                        position: "absolute",
                        top: "40px",
                        right: "60px",
                        fontSize: "20px",
                        color: "#78716c",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    🌿 Nature Club
                </div>
            </div>
        ),
        { ...size }
    );
}
