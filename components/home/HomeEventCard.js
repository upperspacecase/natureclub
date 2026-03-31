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
  const coverUrl = event.coverPhotoUrl || event.image || "";
  const dateTime = event.dateTime;

  const isUpcoming = variant === "upcoming";
  const isSaved = variant === "saved";
  const isPast = variant === "past";

  const cardWidth = isSaved ? "w-52" : "w-64";
  const aspect = isSaved ? "aspect-square" : "aspect-[4/5]";
  const grayscaleClass = isPast
    ? "grayscale"
    : isUpcoming
    ? "grayscale hover:grayscale-0 transition-all duration-500"
    : "";

  return (
    <Link
      href={slug ? `/e/${slug}` : "#"}
      className={`flex-none ${cardWidth}`}
    >
      <div
        className={`${aspect} relative overflow-hidden bg-nc-surface-container`}
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
          <div className="flex h-full w-full items-center justify-center bg-nc-surface-container-high">
            <span className="text-sm text-nc-outline">No image</span>
          </div>
        )}

        {isSaved && (
          <div className="absolute right-4 top-4">
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

      <div className="mt-3">
        {isSaved ? (
          <h4 className="text-sm font-medium uppercase tracking-wider text-nc-on-surface">
            {title}
          </h4>
        ) : (
          <div>
            <h4 className="text-base font-light text-nc-on-surface">
              {title}
            </h4>
            {isUpcoming && dateTime && (
              <p className="mt-1 text-[10px] text-all-caps-spacing uppercase text-nc-secondary">
                In {daysUntil(dateTime)} day
                {daysUntil(dateTime) !== 1 ? "s" : ""}
              </p>
            )}
            {isPast && dateTime && (
              <p className="mt-1 text-[10px] text-all-caps-spacing uppercase text-nc-on-surface-variant">
                Completed {formatCompletedDate(dateTime)}
              </p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
