"use client";

import Link from "next/link";

export default function HomeCarousel({
  label,
  title,
  viewAllHref,
  children,
}) {
  return (
    <section>
      <div className="px-8 mb-8 flex justify-between items-end">
        <div className="space-y-2">
          <span className="text-nc-secondary text-[10px] text-all-caps-spacing uppercase">
            {label}
          </span>
          <h3 className="font-headline italic text-3xl text-nc-on-surface">
            {title}
          </h3>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-[10px] text-all-caps-spacing uppercase border-b border-nc-outline-variant pb-1 text-nc-on-surface-variant"
          >
            View All
          </Link>
        )}
      </div>
      <div className="flex overflow-x-auto gap-6 px-8 hide-scrollbar scroll-smooth">
        {children}
      </div>
    </section>
  );
}
