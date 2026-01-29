import EventsSection from "@/components/EventsSection";
import Footer from "@/components/Footer";
import HeroVideo from "@/components/HeroVideo";
import RecordVisit from "@/components/RecordVisit";
import ScrollToCarouselButton from "@/components/ScrollToCarouselButton";

export default function Page() {
  const heroVideoSrc = "/Nature%20Club%20%20Landing%20%28Video%29.mp4";

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
            <header className="my-8 md:my-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-light.svg"
                alt="Nature Club"
                className="h-22 md:h-28 w-auto"
              />
            </header>

            {/* Hero Content — aligned with carousel edges */}
            <main className="flex flex-1 items-start">
              <div className="w-full pt-6 md:pt-10">
                {/* Main Headline */}
                <h1
                  className="mb-6 font-serif leading-[1.05] text-base-content"
                  style={{ fontSize: "clamp(3.25rem, 9vw, 6.5rem)" }}
                >
                  Spend more time
                  <br />
                  in Nature.
                </h1>

                {/* Subtext */}
                <div className="flex w-full flex-col gap-6">
                  <p className="max-w-md text-base leading-relaxed text-base-content/90 md:text-lg">
                    Access local Nature events, experiences, and classes with one
                    membership.
                  </p>
                  <div className="flex items-center gap-3 text-sm leading-tight text-base-content/70">
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
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center text-base-content/70">
          <ScrollToCarouselButton />
        </div>
      </section>
      <div className="mt-16 md:mt-24">
        <EventsSection />
      </div>
      <Footer />
    </div>
  );
}
