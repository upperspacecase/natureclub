import { unstable_noStore as noStore } from "next/cache";
import getUpcomingEvents from "@/libs/get-upcoming-events";
import HomeCarousel from "@/components/home/HomeCarousel";
import HomeEventCard from "@/components/home/HomeEventCard";

const EventsSection = async () => {
  noStore();

  let upcomingEvents = [];
  try {
    upcomingEvents = await getUpcomingEvents();
  } catch (err) {
    console.error("EventsSection: failed to load upcoming events", err);
  }

  if (upcomingEvents.length === 0) {
    return null;
  }

  return (
    <section className="bg-base-100 py-12 text-base-content md:py-16">
      <div className="mx-auto max-w-6xl">
        <HomeCarousel title="Upcoming Events" dark>
          {upcomingEvents.map((event) => (
            <HomeEventCard key={event._id} event={event} variant="upcoming" dark />
          ))}
        </HomeCarousel>
      </div>
    </section>
  );
};

export default EventsSection;
