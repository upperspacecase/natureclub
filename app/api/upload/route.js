import { put } from "@vercel/blob";
import { getAuthUser } from "@/libs/auth";

// POST — Upload an image to Vercel Blob
export async function POST(req) {
    try {
        // TWILIO-AUTH: getAuthUser() currently returns a dev stub
        const user = await getAuthUser();
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return Response.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            return Response.json(
                { error: "Only JPG, PNG, and WebP images are allowed" },
                { status: 400 }
            );
        }

        // Validate size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            return Response.json(
                { error: "File must be under 10MB" },
                { status: 400 }
            );
        }

        const blob = await put(`events/${Date.now()}-${file.name}`, file, {
            access: "public",
        });

        return Response.json({ url: blob.url });
    } catch (error) {
        console.error("POST /api/upload error:", error);
        return Response.json({ error: "Upload failed" }, { status: 500 });
    }
}
