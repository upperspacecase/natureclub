import { unstable_noStore as noStore } from "next/cache";
import eventsSeed from "@/data/events";
import connectMongo from "@/libs/mongoose";
import Event from "@/models/Event";
import EventsList from "./EventsList";
import WaitlistSection from "./WaitlistSection";

const EventsSection = async () => {
  noStore();
  await connectMongo();

  await Event.bulkWrite(
    eventsSeed.map((event) => ({
      updateOne: {
        filter: { eventId: event.id },
        update: {
          $set: {
            title: event.title,
            duration: event.duration,
            image: event.image,
            tags: event.tags || [],
          },
        },
        upsert: true,
      },
    }))
  );

  const events = await Event.find({}).sort({ createdAt: 1 }).lean();

  const normalizedEvents = events.map((event) => ({
    id: event.eventId,
    title: event.title,
    duration: event.duration,
    image: event.image,
    tags: event.tags || [],
  }));

  return (
    <section className="bg-base-100 px-6 py-16 text-base-content md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <p className="text-center text-sm text-base-content/80">
          Which events, experiences and classes excite you?
        </p>
        <div id="events-carousel">
          <EventsList events={normalizedEvents} />
        </div>
        <WaitlistSection />
      </div>
    </section>
  );
};

export default EventsSection;
