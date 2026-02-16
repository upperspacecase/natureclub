import connectMongo from "@/libs/mongoose";
import Facilitator from "@/models/Facilitator";

// GET — Public facilitator profile by username
export async function GET(req, { params }) {
    try {
        const { username } = await params;
        await connectMongo();

        const facilitator = await Facilitator.findOne({ username });
        if (!facilitator) {
            return Response.json({ error: "Profile not found" }, { status: 404 });
        }

        // Public-safe fields only
        return Response.json({
            name: facilitator.name,
            username: facilitator.username,
            bio: facilitator.bio,
            photoUrl: facilitator.photoUrl,
        });
    } catch (error) {
        console.error("GET /api/facilitator/[username] error:", error);
        return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}
