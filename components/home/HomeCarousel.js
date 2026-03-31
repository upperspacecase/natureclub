"use client";

import Link from "next/link";

export default function HomeCarousel({ title, viewAllHref, children }) {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between px-6">
        <h3 className="font-headline text-2xl italic text-nc-on-surface">
          {title}
        </h3>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="border-b border-nc-outline-variant pb-1 text-[10px] text-all-caps-spacing uppercase text-nc-on-surface-variant"
          >
            View All
          </Link>
        )}
      </div>
      <div className="hide-scrollbar flex gap-4 overflow-x-auto scroll-smooth px-6">
        {children}
      </div>
    </section>
  );
}
