"use client";

/**
 * Compact event card for the explore page list/sheet.
 *
 * Props:
 *  - event  : explore event object from the API
 */
export default function ExploreEventCard({ event }) {
    const time = new Date(event.dateTime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

    const activityLabel = event.activityType
        ? event.activityType.replace(/-/g, " ")
        : "";

    return (
        <a
            href={event.slug ? `/e/${event.slug}` : "#"}
            className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition-colors hover:bg-white/[0.08]"
        >
            {/* Thumbnail */}
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white/10">
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

            {/* Info */}
            <div className="flex flex-1 flex-col justify-center min-w-0">
                <h4 className="truncate font-serif text-sm font-medium text-white">
                    {event.title || "Untitled"}
                </h4>
                <p className="mt-0.5 text-xs text-white/50">
                    {time}
                    {activityLabel && (
                        <span className="ml-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/40">
                            {activityLabel}
                        </span>
                    )}
                </p>
            </div>

            {/* Spots */}
            <div className="flex flex-col items-end justify-center shrink-0">
                <span className="text-sm font-semibold text-white">
                    {event.spotsLeft}
                    <span className="text-white/40">/{event.groupSize}</span>
                </span>
                <span className="text-[10px] text-white/30">spots</span>
            </div>
        </a>
    );
}
