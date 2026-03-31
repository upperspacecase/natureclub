import getUpcomingEvents from "@/libs/get-upcoming-events";

// GET — Public endpoint: list published, public, upcoming events with coordinates
export async function GET() {
    try {
        const events = await getUpcomingEvents();
        return Response.json({ events });
    } catch (error) {
        console.error("GET /api/events/explore error:", error);
        return Response.json(
            { error: "Failed to load events" },
            { status: 500 }
        );
    }
}
