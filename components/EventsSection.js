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
            title: event.title || event.headline || "Founding member",
            image: event.image,
            categoryTag: event.categoryTag || "",
            attributeTags: event.attributeTags || [],
            themes: event.themes || [],
            type: event.type || "experience",
            headline: event.headline || "",
            buttonText: event.buttonText || "",
          },
        },
        upsert: true,
      },
    }))
  );

  await Event.deleteMany({ eventId: { $nin: eventsSeed.map((event) => event.id) } });

  const events = await Event.find({}).sort({ createdAt: 1 }).lean();

  const normalizedEvents = events.map((event) => ({
    id: event.eventId,
    title: event.title,
    image: event.image,
    categoryTag: event.categoryTag || "",
    attributeTags: event.attributeTags || [],
    type: event.type || "experience",
    headline: event.headline,
    buttonText: event.buttonText,
  }));

  return (
    <section className="bg-base-100 px-6 py-16 text-base-content md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div
          className="text-center text-sm text-base-content/80 min-h-5"
          aria-hidden="true"
        />
        <h2 className="text-center font-serif text-2xl text-base-content sm:text-3xl">
          Which experiences excite you?
        </h2>
        <div id="events-carousel">
          <EventsList events={normalizedEvents} />
        </div>
        <div className="-mt-2 sm:-mt-4">
          <WaitlistSection />
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
