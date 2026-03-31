import getUpcomingEvents from "@/libs/get-upcoming-events";
import HomeCarousel from "@/components/home/HomeCarousel";
import HomeEventCard from "@/components/home/HomeEventCard";

export default async function LandingUpcomingSection() {
  let events = [];

  try {
    events = await getUpcomingEvents();
  } catch (err) {
    console.error("LandingUpcomingSection: failed to load events", err);
  }

  if (!events.length) return null;

  return (
    <section className="bg-black py-16 md:py-20">
      <HomeCarousel
        label="Experiences"
        title="Upcoming Events"
        viewAllHref="/discovery"
        dark
      >
        {events.map((event) => (
          <HomeEventCard key={event._id} event={event} variant="upcoming" dark />
        ))}
      </HomeCarousel>
    </section>
  );
}
