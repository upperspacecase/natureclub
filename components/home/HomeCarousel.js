"use client";

import Link from "next/link";

export default function HomeCarousel({ label, title, viewAllHref, dark, children }) {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between px-6">
        <div>
          {label && (
            <span className={`block mb-2 text-[10px] text-all-caps-spacing uppercase ${dark ? "text-white/50" : "text-nc-secondary"}`}>
              {label}
            </span>
          )}
          <h3 className={`font-headline text-2xl italic ${dark ? "text-white" : "text-nc-on-surface"}`}>
            {title}
          </h3>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className={`border-b pb-1 text-[10px] text-all-caps-spacing uppercase ${dark ? "border-white/20 text-white/40" : "border-nc-outline-variant text-nc-on-surface-variant"}`}
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
