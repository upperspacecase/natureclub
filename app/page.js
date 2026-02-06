import EventsSection from "@/components/EventsSection";
import Footer from "@/components/Footer";
import HeroVideo from "@/components/HeroVideo";
import RecordVisit from "@/components/RecordVisit";
import ScrollToCarouselButton from "@/components/ScrollToCarouselButton";

export default function Page() {
  const heroVideoSrc = "/Nature%20Club%20%20Landing%20%28Video%29.mp4";

  return (
    <div className="bg-base-100 text-white">
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
      <Footer />
    </div>
  );
}
