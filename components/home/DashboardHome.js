"use client";

import { useEffect, useState } from "react";
import HomeHero from "./HomeHero";
import HomeCarousel from "./HomeCarousel";
import HomeEventCard from "./HomeEventCard";
import HomeActions from "./HomeActions";
import HomeFooter from "./HomeFooter";
import apiClient from "@/libs/api";

const CLIENT_ID_KEY = "nc-client-id";

function getClientId() {
  if (typeof window === "undefined") return null;
  let clientId = localStorage.getItem(CLIENT_ID_KEY);
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }
  return clientId;
}

export default function UserHome({
  user,
  stats,
  upcomingEvents,
  pastEvents,
  hostedEvents = [],
}) {
  const [savedEvents, setSavedEvents] = useState([]);

  useEffect(() => {
    const clientId = getClientId();
    if (!clientId) return;

    apiClient
      .get(`/user/liked-events?clientId=${clientId}`)
      .then((res) => setSavedEvents(res || []))
      .catch(() => {});
  }, []);

  return (
    <div className="relative mx-auto h-[100dvh] w-full max-w-[430px] overflow-y-auto overflow-x-hidden bg-nc-surface text-nc-on-surface">
      <HomeHero stats={stats} user={user} />

      <main className="bg-nc-surface py-12 px-0 space-y-14">
        {/* Hosting */}
        {hostedEvents.length > 0 && (
          <HomeCarousel label="Hosting" title="Your Events">
            {hostedEvents.map((event) => (
              <HomeEventCard
                key={event._id}
                event={event}
                variant="hosting"
              />
            ))}
          </HomeCarousel>
        )}

        {/* Upcoming Bookings */}
        {upcomingEvents.length > 0 ? (
          <HomeCarousel
            label="Schedule"
            title="Upcoming Bookings"
            viewAllHref="/events"
          >
            {upcomingEvents.map((event) => (
              <HomeEventCard
                key={event._id}
                event={event}
                variant="upcoming"
              />
            ))}
          </HomeCarousel>
        ) : (
          <section className="px-6">
            <div className="space-y-2 mb-6">
              <span className="text-nc-secondary text-[10px] text-all-caps-spacing uppercase">
                Schedule
              </span>
              <h3 className="font-headline italic text-2xl">
                Upcoming Bookings
              </h3>
            </div>
            <p className="text-nc-on-surface-variant text-sm">
              No upcoming events.{" "}
              <a href="/discovery" className="text-nc-secondary underline">
                Explore experiences
              </a>{" "}
              to find your next adventure.
            </p>
          </section>
        )}

        {/* Saved Experiences */}
        {savedEvents.length > 0 ? (
          <HomeCarousel label="Archive" title="Saved">
            {savedEvents.map((event) => (
              <HomeEventCard
                key={event._id}
                event={event}
                variant="saved"
              />
            ))}
          </HomeCarousel>
        ) : (
          <section className="px-6">
            <div className="space-y-2 mb-6">
              <span className="text-nc-secondary text-[10px] text-all-caps-spacing uppercase">
                Archive
              </span>
              <h3 className="font-headline italic text-2xl">
                Saved
              </h3>
            </div>
            <p className="text-nc-on-surface-variant text-sm">
              No saved experiences yet. Tap the heart on any event to save it
              here.
            </p>
          </section>
        )}

        {/* Past Experiences */}
        {pastEvents.length > 0 && (
          <HomeCarousel label="History" title="Past Experiences">
            {pastEvents.map((event) => (
              <HomeEventCard key={event._id} event={event} variant="past" />
            ))}
          </HomeCarousel>
        )}

        {/* Actions */}
        <HomeActions />
      </main>

      <HomeFooter />
    </div>
  );
}
