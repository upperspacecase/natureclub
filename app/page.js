import EventsSection from "@/components/EventsSection";
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
        {/* Background Video with Overlay */}
        <div className="absolute inset-0 z-0">
          <video
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src={heroVideoSrc} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header/Logo */}
          <header className="p-6 md:p-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="Nature Club"
            className="h-48 md:h-60 w-auto"
          />
          </header>

          {/* Hero Content — left aligned like reference */}
          <main className="flex-1 flex items-start px-6 md:px-10 pb-16">
            <div className="w-full max-w-4xl pt-6 md:pt-10">
              {/* Main Headline */}
              <h1
                className="leading-[1.05] mb-8 text-[#f6f5f0]"
                style={{ fontSize: "clamp(3.25rem, 9vw, 6.5rem)" }}
              >
                <span className="font-serif italic">Make time</span>
                <br />
                <span className="font-sans font-light">for </span>
                <span className="font-serif italic">Nature.</span>
              </h1>

              {/* Subtext and CTA — flex with space-between */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 max-w-3xl">
                <p className="text-base md:text-lg text-[#f6f5f0]/90 leading-relaxed max-w-sm">
                  Connect to a whole world of{" "}
                  <em className="font-serif">Nature</em> based experiences,
                  events and facilitators.
                </p>

                <button className="self-start sm:self-auto bg-neutral-900/60 border border-[#f6f5f0]/40 text-[#f6f5f0] hover:bg-[#f6f5f0] hover:text-neutral-900 hover:border-[#f6f5f0] rounded-full px-8 py-2.5 text-sm font-medium transition-all backdrop-blur-sm whitespace-nowrap">
                  Explore Experiences
                </button>
              </div>
            </div>
          </main>
        </div>
      </section>
      <EventsSection />
      <WaitlistSection />
    </div>
  );
}
