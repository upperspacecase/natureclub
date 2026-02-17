import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import { getAuthUser } from "@/libs/auth";

// POST — Create a new draft event
export async function POST(req) {
    try {
        // TWILIO-AUTH: getAuthUser() currently returns a dev stub
        const user = await getAuthUser();
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectMongo();

        const event = await BookingEvent.create({
            createdBy: user._id,
            status: "draft",
        });

        return Response.json({ id: event._id.toString() }, { status: 201 });
    } catch (error) {
        console.error("POST /api/events/create error:", error);
        return Response.json({ error: "Failed to create event" }, { status: 500 });
    }
}
