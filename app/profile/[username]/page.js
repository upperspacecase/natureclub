import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import BookingEvent from "@/models/BookingEvent";
import Rsvp from "@/models/Rsvp";
import { searchPhoto } from "@/libs/unsplash";
import { notFound } from "next/navigation";
import { getSEOTags } from "@/libs/seo";
import Link from "next/link";

export async function generateMetadata({ params }) {
    const { username } = await params;
    await connectMongo();
    const user = await User.findOne({ username });

    if (!user) {
        return getSEOTags({ title: "Profile not found" });
    }

    return getSEOTags({
        title: `${user.name} — Nature Club`,
        description: user.bio || `See what ${user.name} has planned on Nature Club`,
    });
}

export default async function ProfilePage({ params }) {
    const { username } = await params;
    await connectMongo();

    const user = await User.findOne({ username, hostingOn: true });
    if (!user) {
        notFound();
    }

    const now = new Date();

    const upcoming = await BookingEvent.find({
        createdBy: user._id,
        status: "published",
        dateTime: { $gte: now },
    })
        .sort({ dateTime: 1 })
        .lean();

    const past = await BookingEvent.find({
        createdBy: user._id,
        status: "published",
        dateTime: { $lt: now },
    })
        .sort({ dateTime: -1 })
        .limit(10)
        .lean();

    // Get RSVP counts
    const allEventIds = [...upcoming, ...past].map((e) => e._id);
    const rsvpCounts = {};
    if (allEventIds.length > 0) {
        const counts = await Rsvp.aggregate([
            { $match: { eventId: { $in: allEventIds }, status: "confirmed" } },
            { $group: { _id: "$eventId", count: { $sum: 1 } } },
        ]);
        counts.forEach((c) => {
            rsvpCounts[c._id.toString()] = c.count;
        });
    }

    // Auto-fetch Unsplash images for events missing cover photos
    if (process.env.UNSPLASH_ACCESS_KEY) {
        for (const event of [...upcoming, ...past]) {
            if (!event.coverPhotoUrl) {
                try {
                    const parts = [event.title];
                    if (event.activityType && event.activityType !== "other") {
                        parts.push(event.activityType.replace(/-/g, " "));
                    }
                    const photo = await searchPhoto(parts.join(" ") || "nature outdoor");
                    if (photo?.url) {
                        event.coverPhotoUrl = photo.url;
                        await BookingEvent.updateOne(
                            { _id: event._id },
                            { $set: { coverPhotoUrl: photo.url } }
                        );
                    }
                } catch (err) {
                    console.error("Unsplash fallback failed:", err.message);
                }
            }
        }
    }

    function formatDate(d) {
        if (!d) return "Date TBA";
        return new Date(d).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    }

    function EventCard({ event }) {
        const count = rsvpCounts[event._id.toString()] || 0;
        return (
            <Link
                href={`/e/${event.slug}`}
                className="flex items-center gap-4 rounded-[6px] border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20"
            >
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-[6px] bg-white/10">
                    {event.coverPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={event.coverPhotoUrl}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-medium text-white/40">
                            NC
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-medium text-white truncate">
                        {event.title}
                    </h3>
                    <p className="text-sm text-white/60">{formatDate(event.dateTime)}</p>
                </div>
                <span className="flex-shrink-0 text-xs text-white/50">
                    {count} going
                </span>
            </Link>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="mx-auto max-w-lg px-5 py-10">
                {/* Profile header */}
                <div className="mb-8 text-center">
                    {user.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={user.photoUrl}
                            alt={user.name}
                            className="mx-auto mb-4 h-20 w-20 rounded-full object-cover"
                        />
                    ) : (
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-2xl font-medium text-white/60">
                            {user.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                    )}
                    <h1 className="font-serif text-2xl italic text-white">
                        {user.name}
                    </h1>
                    <p className="mt-1 text-sm text-white/50">@{user.username}</p>
                    {user.bio && (
                        <p className="mt-3 text-sm text-white/70">{user.bio}</p>
                    )}
                </div>

                {/* Upcoming Events */}
                {upcoming.length > 0 && (
                    <div className="mb-8">
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                            Upcoming
                        </h2>
                        <div className="space-y-2">
                            {upcoming.map((event) => (
                                <EventCard key={event._id.toString()} event={event} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Past Events */}
                {past.length > 0 && (
                    <div>
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                            Past
                        </h2>
                        <div className="space-y-2">
                            {past.map((event) => (
                                <EventCard key={event._id.toString()} event={event} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty */}
                {upcoming.length === 0 && past.length === 0 && (
                    <p className="text-center text-sm text-white/40">
                        No events yet — check back soon.
                    </p>
                )}
            </div>
        </div>
    );
}
