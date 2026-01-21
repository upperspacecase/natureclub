import { unstable_noStore as noStore } from "next/cache";
import eventsSeed from "@/data/events";
import connectMongo from "@/libs/mongoose";
import Event from "@/models/Event";
import EventsList from "./EventsList";

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
  }));

  return (
    <section className="bg-base-100 px-6 py-16 text-base-content md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-serif">Browse events</h2>
          <p className="text-sm text-base-content/80">
            Explore upcoming experiences in nature.
          </p>
        </div>
        <EventsList events={normalizedEvents} />
      </div>
    </section>
  );
};

export default EventsSection;
