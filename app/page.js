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
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Video with black fallback */}
        <HeroVideo src={heroVideoSrc} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-b from-transparent to-black md:h-32" />

        {/* Content Container */}
        <div className="relative z-20 min-h-screen">
          <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 md:gap-10 md:px-10 md:py-14">
            {/* Header/Logo */}
            <header>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-light.svg"
                alt="Nature Club"
                className="h-14 w-auto sm:h-16 md:h-20 lg:h-24"
              />
            </header>

            {/* Hero Content — aligned with carousel edges */}
            <main className="flex flex-1 items-start">
              <div className="w-full">
                {/* Main Headline */}
                <h1 className="mb-6 font-serif text-[clamp(31px,9.6vw,46px)] leading-[1.05] tracking-tight md:text-[clamp(36px,6.5vw,50px)]">
                  <span className="block max-w-[80vw] whitespace-nowrap md:max-w-none">
                    Spend more time
                  </span>
                  <span className="block whitespace-nowrap">in Nature.</span>
                </h1>

                {/* Subtext */}
                <div className="flex w-full flex-col gap-6">
                  <p className="max-w-md text-lg leading-relaxed text-white/90 md:text-lg">
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
