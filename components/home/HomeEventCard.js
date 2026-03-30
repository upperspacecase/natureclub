"use client";

import Image from "next/image";
import Link from "next/link";

const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z";

function daysUntil(dateStr) {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function formatCompletedDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function HomeEventCard({ event, variant = "upcoming" }) {
  const slug = event.slug;
  const title = event.title || "Untitled Event";
  const coverUrl = event.coverPhotoUrl || "";
  const dateTime = event.dateTime;

  const isUpcoming = variant === "upcoming";
  const isSaved = variant === "saved";
  const isPast = variant === "past";

  const cardWidth = isSaved ? "w-60" : "w-72";
  const aspect = isSaved ? "aspect-square" : "aspect-[4/5]";
  const grayscaleClass = isPast
    ? "grayscale"
    : isUpcoming
    ? "grayscale hover:grayscale-0 transition-all duration-500"
    : "";

  return (
    <Link href={slug ? `/e/${slug}` : "#"} className={`flex-none ${cardWidth}`}>
      <div
        className={`${aspect} bg-nc-surface-container overflow-hidden mb-4 relative`}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            className={`object-cover ${grayscaleClass}`}
            sizes={isSaved ? "240px" : "288px"}
          />
        ) : (
          <div className="w-full h-full bg-nc-surface-container-high flex items-center justify-center">
            <span className="text-nc-outline text-sm">No image</span>
          </div>
        )}

        {isSaved && (
          <div className="absolute top-4 right-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="white"
              className="drop-shadow-md"
            >
              <path d={HEART_PATH} />
            </svg>
          </div>
        )}
      </div>

      {isSaved ? (
        <h4 className="text-sm font-medium uppercase tracking-wider text-nc-on-surface">
          {title}
        </h4>
      ) : (
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-light text-nc-on-surface">{title}</h4>
            {isUpcoming && dateTime && (
              <p className="text-nc-secondary text-[10px] text-all-caps-spacing uppercase mt-1">
                In {daysUntil(dateTime)} day{daysUntil(dateTime) !== 1 ? "s" : ""}
              </p>
            )}
            {isPast && dateTime && (
              <p className="text-nc-on-surface-variant text-[10px] text-all-caps-spacing uppercase mt-1">
                Completed {formatCompletedDate(dateTime)}
              </p>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}
