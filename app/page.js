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
      <section
        className="relative min-h-screen overflow-hidden"
        style={{ "--hero-scale": "clamp(27px, 6.5vw, 50px)" }}
      >
        {/* Background Video with black fallback */}
        <HeroVideo src={heroVideoSrc} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-b from-transparent to-black md:h-32" />

        {/* Content Container */}
        <div className="relative z-20 min-h-screen">
          <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 md:px-10">
            {/* Header/Logo */}
            <header className="my-8 md:my-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-light.svg"
                alt="Nature Club"
                className="w-auto"
                style={{ height: "calc(var(--hero-scale) * 2)" }}
              />
            </header>

            {/* Hero Content — aligned with carousel edges */}
            <main className="flex flex-1 items-start">
              <div className="w-full pt-6 md:pt-10">
                {/* Main Headline */}
                <h1 className="mb-6 font-serif text-[clamp(26px,8vw,46px)] leading-[1.05] tracking-tight md:text-[clamp(36px,6.5vw,50px)]">
                  <span className="block max-w-[80vw] whitespace-nowrap md:max-w-none">
                    Spend more time
                  </span>
                  <span className="block whitespace-nowrap">in Nature.</span>
                </h1>

                {/* Subtext */}
                <div className="flex w-full flex-col gap-6">
                  <p className="max-w-md text-base leading-relaxed text-white/90 md:text-lg">
                    Access local Nature events, experiences, and classes with one
                    membership.
                  </p>
                  <div className="flex items-center gap-3 text-sm leading-tight text-white/70">
                    <span className="flex flex-col leading-tight">
                      <span>Every membership supports</span>
                      <span>local ecosystem restoration +</span>
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/1%25%20for%20the%20plant%20logo.svg"
                      alt="1% for the Planet"
                      className="h-24 w-auto opacity-80"
                    />
                  </div>
                  <ScrollToCarouselButton />
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>
      <div>
        <EventsSection />
      </div>
      <Footer />
    </div>
  );
}
