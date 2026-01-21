import EventsSection from "@/components/EventsSection";
import HeroVideo from "@/components/HeroVideo";
import RecordVisit from "@/components/RecordVisit";
import WaitlistSection from "@/components/WaitlistSection";

export default function Page() {
  const HERO_VIDEO = "forest";
  const heroVideoSrc =
    HERO_VIDEO === "beach" ? "/hero-bg-beach.mp4" : "/hero-bg-forest.mp4";

  return (
    <div className="bg-base-100 text-base-content">
      <RecordVisit />
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Video with black fallback */}
        <HeroVideo src={heroVideoSrc} />

        {/* Content Container */}
        <div className="relative z-10 min-h-screen">
          <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-16 md:px-10">
            {/* Header/Logo */}
			<header className="pt-6 md:pt-10">
				<picture>
					<source
						srcSet="/logo-dark.svg"
						media="(prefers-color-scheme: dark)"
					/>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="/logo-light.svg"
						alt="Nature Club"
						className="h-48 md:h-60 w-auto"
					/>
				</picture>
			</header>

            {/* Hero Content — aligned with carousel edges */}
            <main className="flex flex-1 items-start">
              <div className="w-full pt-6 md:pt-10">
                {/* Main Headline */}
                <h1
                  className="mb-8 font-serif leading-[1.05] text-base-content"
                  style={{ fontSize: "clamp(3.25rem, 9vw, 6.5rem)" }}
                >
                  Make time
                  <br />
                  for Nature.
                </h1>

                {/* Subtext and CTA */}
                <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-end">
                  <p className="max-w-sm text-base leading-relaxed text-base-content/90 md:text-lg">
                    Connect to a whole world of nature based experiences, events
                    and facilitators.
                  </p>

                  <button className="btn btn-primary self-start whitespace-nowrap sm:ml-auto sm:self-auto">
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
