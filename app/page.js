import EventsSection from "@/components/EventsSection";
import Footer from "@/components/Footer";
import HeroVideo from "@/components/HeroVideo";
import RecordVisit from "@/components/RecordVisit";

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
            <header className="my-16 md:my-20">
              <picture>
                <source
                  srcSet="/logo-dark.svg"
                  media="(prefers-color-scheme: dark) and (min-width: 768px)"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-light.svg"
                  alt="Nature Club"
                  className="h-32 md:h-40 w-auto"
                />
              </picture>
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
                      <span>Every booking supports</span>
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
          <button
            type="button"
            className="animate-scrollHint opacity-50"
            aria-label="Scroll to experiences"
            onClick={() => {
              const target = document.getElementById("events-carousel");
              if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-15 w-15 rotate-180"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 15 6-6 6 6" />
            </svg>
          </button>
        </div>
      </section>
      <div className="mt-16 md:mt-24">
        <EventsSection />
      </div>
      <Footer />
    </div>
  );
}
