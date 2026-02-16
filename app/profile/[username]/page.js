import connectMongo from "@/libs/mongoose";
import Facilitator from "@/models/Facilitator";
import BookingEvent from "@/models/BookingEvent";
import Rsvp from "@/models/Rsvp";
import { notFound } from "next/navigation";
import { getSEOTags } from "@/libs/seo";
import Link from "next/link";

export async function generateMetadata({ params }) {
    const { username } = await params;
    await connectMongo();
    const facilitator = await Facilitator.findOne({ username });

    if (!facilitator) {
        return getSEOTags({ title: "Profile not found" });
    }

    return getSEOTags({
        title: `${facilitator.name} — Nature Club`,
        description: facilitator.bio || `See what ${facilitator.name} has planned on Nature Club`,
    });
}

export default async function ProfilePage({ params }) {
    const { username } = await params;
    await connectMongo();

    const facilitator = await Facilitator.findOne({ username });
    if (!facilitator) {
        notFound();
    }

    const now = new Date();

    const upcoming = await BookingEvent.find({
        facilitatorId: facilitator._id,
        status: "published",
        dateTime: { $gte: now },
    })
        .sort({ dateTime: 1 })
        .lean();

    const past = await BookingEvent.find({
        facilitatorId: facilitator._id,
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
                className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
                    {event.coverPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={event.coverPhotoUrl}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">
                            🌿
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-stone-800 truncate">
                        {event.title}
                    </h3>
                    <p className="text-sm text-stone-500">{formatDate(event.dateTime)}</p>
                </div>
                <span className="flex-shrink-0 text-xs text-stone-400">
                    {count} going
                </span>
            </Link>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f6f3]">
            <div className="mx-auto max-w-lg px-5 py-10">
                {/* Profile header */}
                <div className="mb-8 text-center">
                    {facilitator.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={facilitator.photoUrl}
                            alt={facilitator.name}
                            className="mx-auto mb-4 h-20 w-20 rounded-full object-cover"
                        />
                    ) : (
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-stone-200 text-3xl">
                            🌿
                        </div>
                    )}
                    <h1 className="font-serif text-2xl font-bold text-stone-800">
                        {facilitator.name}
                    </h1>
                    <p className="mt-1 text-sm text-stone-500">@{facilitator.username}</p>
                    {facilitator.bio && (
                        <p className="mt-3 text-sm text-stone-600">{facilitator.bio}</p>
                    )}
                </div>

                {/* Upcoming Events */}
                {upcoming.length > 0 && (
                    <div className="mb-8">
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
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
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
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
                    <p className="text-center text-sm text-stone-400">
                        No events yet — check back soon.
                    </p>
                )}
            </div>
        </div>
    );
}
