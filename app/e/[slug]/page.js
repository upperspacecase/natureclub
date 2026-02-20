import { notFound } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import User from "@/models/User";
import { getSEOTags } from "@/libs/seo";
import EventPageClient from "./EventPageClient";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    await connectMongo();
    const event = await BookingEvent.findOne({ slug, status: "published" });

    if (!event) {
        return getSEOTags({ title: "Event not found" });
    }

    const host = await User.findById(event.createdBy);

    return getSEOTags({
        title: event.title,
        description: event.description
            ? event.description.slice(0, 160)
            : `Join ${host?.name || "us"} for ${event.title}`,
        openGraph: {
            title: event.title,
            description: event.description?.slice(0, 160) || "",
            images: event.coverPhotoUrl ? [{ url: event.coverPhotoUrl }] : [],
        },
    });
}

export default async function EventPage({ params }) {
    const { slug } = await params;
    await connectMongo();

    const event = await BookingEvent.findOne({
        slug,
        status: { $ne: "draft" },
    });

    if (!event) {
        notFound();
    }

    const host = await User.findById(event.createdBy);

    // Pass serializable data to client component
    const eventData = {
        id: event._id.toString(),
        title: event.title,
        slug: event.slug,
        status: event.status,
        dateTime: event.dateTime?.toISOString() || null,
        durationMinutes: event.durationMinutes,
        activityType: event.activityType,
        activityTypeOther: event.activityTypeOther,
        groupSize: event.groupSize,
        description: event.description,
        difficulty: event.difficulty,
        whatToBring: event.whatToBring,
        weatherPolicy: event.weatherPolicy,
        price: event.price,
        currency: event.currency || "USD",
        priceLink: event.priceLink,
        coverPhotoUrl: event.coverPhotoUrl,
        accessibilityNotes: event.accessibilityNotes,
        cancelledReason: event.cancelledReason,
        hasLocation: !!(event.meetingPoint?.lat && event.meetingPoint?.lng),
        approximateLocation: event.meetingPoint?.lat
            ? {
                lat: Math.round(event.meetingPoint.lat * 100) / 100,
                lng: Math.round(event.meetingPoint.lng * 100) / 100,
            }
            : null,
        host: host
            ? {
                name: host.name || host.username || "your host",
                photoUrl: host.photoUrl,
                bio: host.bio,
                username: host.username,
            }
            : null,
    };

    return <EventPageClient event={eventData} />;
}
