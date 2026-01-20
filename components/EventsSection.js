import events from "@/data/events";
import EventsList from "./EventsList";

const EventsSection = () => {
  return (
    <section className="bg-[#1d1212] px-6 py-16 text-[#f6f5f0] md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-serif">Browse events</h2>
          <p className="text-sm text-[#f6f5f0]/80">
            Explore upcoming experiences in nature.
          </p>
        </div>
        <EventsList events={events} />
      </div>
    </section>
  );
};

export default EventsSection;
