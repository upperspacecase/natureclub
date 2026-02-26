import EventsSection from "@/components/EventsSection";
import DiscoverSection from "@/components/DiscoverSection";
import Footer from "@/components/Footer";
import HeroVideo from "@/components/HeroVideo";
import RecordVisit from "@/components/RecordVisit";
import ScrollToCarouselButton from "@/components/ScrollToCarouselButton";
import eventsSeed from "@/data/events";

export default function Page() {
  const heroVideoSrc = "/children_hero_vid.mp4";
  const spots = eventsSeed
    .filter((e) => e.type === "spot")
    .map((s) => ({
      id: s.id,
      title: s.title,
      categoryTag: s.categoryTag,
      attributeTags: s.attributeTags || [],
      description: s.description || "",
      region: s.region || "",
      location: s.location || null,
    }));

  return (
    <div className="bg-black text-white">
      <RecordVisit />
      <section className="hero-shell overflow-hidden">
        {/* Background Video with black fallback */}
        <HeroVideo src={heroVideoSrc} />
        <div className="hero-content">
          <header className="hero-logo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-light.svg"
              alt="Nature Club"
              className="h-14 w-auto sm:h-16 md:h-20 lg:h-24"
            />
          </header>
          <main className="hero-stack">
            <h1 className="hero-headline">
              <span className="block">Spend more time</span>
              <span className="block">in Nature.</span>
            </h1>
            <p className="hero-subhead">
              Access local <em>Nature</em> events, experiences, and classes with
              one membership.
            </p>
            <div className="hero-support-row">
              <span className="hero-support-text">
                <span>Every membership supports</span>
                <span>local ecosystem restoration</span>
              </span>
              <span className="hero-support-plus">+</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/1%25%20for%20the%20plant%20logo.svg"
                alt="1% for the Planet"
                className="hero-planet-logo"
              />
            </div>
            <ScrollToCarouselButton variant="hero" />
          </main>
        </div>
      </section>
      <div>
        <EventsSection />
      </div>
      <DiscoverSection spots={spots} />
      <Footer />
    </div>
  );
}

