"use client";

import PhoneFrame from "@/components/nc-design/PhoneFrame";
import Home from "@/components/nc-design/screens/Home";
import { useNCNav } from "@/components/nc-design/useNav";

export default function HomeClient({
  user,
  stats,
  nextEvent,
  nearbyEvents,
  savedEvents = [],
}) {
  const { go, openEvent } = useNCNav();
  return (
    <PhoneFrame>
      <Home
        user={user}
        stats={stats}
        nextEvent={nextEvent}
        nearbyEvents={nearbyEvents}
        savedEvents={savedEvents}
        onOpenEvent={openEvent}
        onNav={go}
      />
    </PhoneFrame>
  );
}
