import { unstable_noStore as noStore } from "next/cache";
import eventsSeed from "@/data/events";
import connectMongo from "@/libs/mongoose";
import Event from "@/models/Event";
import getUpcomingEvents from "@/libs/get-upcoming-events";
import EventsList from "./EventsList";
import WaitlistSection from "./WaitlistSection";
import HomeCarousel from "@/components/home/HomeCarousel";
import HomeEventCard from "@/components/home/HomeEventCard";

const normalizeEvents = (items) =>
  items.map((event) => ({
    id: event.eventId || event.id,
    title: event.title || event.headline || "Founding member",
    image: event.image,
    categoryTag: event.categoryTag || "",
    attributeTags: event.attributeTags || [],
    type: event.type || "experience",
    headline: event.headline || "",
    buttonText: event.buttonText || "",
    description: event.description || "",
    region: event.region || "",
    location: event.location || null,
  }));

const EventsSection = async () => {
  noStore();

  let events = eventsSeed;

  if (process.env.MONGODB_URI) {
    try {
      await connectMongo();

      await Event.bulkWrite(
        eventsSeed.map((event) => ({
          updateOne: {
            filter: { eventId: event.id },
            update: {
              $set: {
                title: event.title || event.headline || "Founding member",
                image: event.image,
                categoryTag: event.categoryTag || "",
                attributeTags: event.attributeTags || [],
                themes: event.themes || [],
                type: event.type || "experience",
                headline: event.headline || "",
                buttonText: event.buttonText || "",
                description: event.description || "",
                region: event.region || "",
                regionKey: event.regionKey || "",
                location: event.location || { lat: null, lng: null },
              },
            },
            upsert: true,
          },
        }))
      );

      await Event.deleteMany({
        eventId: { $nin: eventsSeed.map((event) => event.id) },
      });

      events = await Event.find({}).sort({ createdAt: 1 }).lean();
    } catch (error) {
      console.error("EventsSection fallback to seed data", error);
      events = eventsSeed;
    }
  }

  const normalizedEvents = normalizeEvents(events);

  let upcomingEvents = [];
  try {
    upcomingEvents = await getUpcomingEvents();
  } catch (err) {
    console.error("EventsSection: failed to load upcoming events", err);
  }

  return (
    <section className="bg-base-100 px-6 py-12 text-base-content md:px-10 md:py-16">
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">
        <div
          className="text-center text-sm text-base-content/80 min-h-5"
          aria-hidden="true"
        />
        <h2
          id="events-heading"
          className="text-center font-serif text-2xl leading-tight text-base-content sm:text-3xl"
        >
          Experiences & spots to explore
        </h2>
        <div id="events-carousel">
          <EventsList events={normalizedEvents} />
        </div>
        <div className="mt-4 md:mt-6">
          <WaitlistSection />
        </div>
        {upcomingEvents.length > 0 && (
          <div className="mt-8 md:mt-12">
            <HomeCarousel title="Upcoming Events" dark>
              {upcomingEvents.map((event) => (
                <HomeEventCard key={event._id} event={event} variant="upcoming" dark />
              ))}
            </HomeCarousel>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
