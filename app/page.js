import EventsSection from "@/components/EventsSection";
import HeroVideo from "@/components/HeroVideo";
import RecordVisit from "@/components/RecordVisit";
import WaitlistSection from "@/components/WaitlistSection";

export default function Page() {
  const HERO_VIDEO = "forest";
  const heroVideoSrc =
    HERO_VIDEO === "beach" ? "/hero-bg-beach.mp4" : "/hero-bg-forest.mp4";

  return (
    <div className="bg-[#1d1212] text-white">
      <RecordVisit />
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Video with black fallback */}
        <HeroVideo src={heroVideoSrc} />

        {/* Content Container */}
        <div className="relative z-10 min-h-screen">
          <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-16 md:px-10">
            {/* Header/Logo */}
            <header className="pt-6 md:pt-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="Nature Club"
                className="h-48 md:h-60 w-auto"
              />
            </header>

            {/* Hero Content — aligned with carousel edges */}
            <main className="flex flex-1 items-start">
              <div className="w-full pt-6 md:pt-10">
                {/* Main Headline */}
                <h1
                  className="mb-8 leading-[1.05] text-[#f6f5f0]"
                  style={{ fontSize: "clamp(3.25rem, 9vw, 6.5rem)" }}
                >
                  <span className="font-serif italic">Make time</span>
                  <br />
                  <span className="font-sans font-light">for </span>
                  <span className="font-serif italic">Nature.</span>
                </h1>

                {/* Subtext and CTA */}
                <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-end">
                  <p className="max-w-sm text-base leading-relaxed text-[#f6f5f0]/90 md:text-lg">
                    Connect to a whole world of{" "}
                    <em className="font-serif">Nature</em> based experiences,
                    events and facilitators.
                  </p>

                  <button className="self-start bg-neutral-900/60 border border-[#f6f5f0]/40 text-[#f6f5f0] hover:bg-[#f6f5f0] hover:text-neutral-900 hover:border-[#f6f5f0] rounded-full px-8 py-2.5 text-sm font-medium transition-all backdrop-blur-sm whitespace-nowrap sm:ml-auto sm:self-auto">
                    Explore Experiences
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>
      <EventsSection />
      <WaitlistSection />
    </div>
  );
}
