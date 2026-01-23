import EventsSection from "@/components/EventsSection";
import HeroVideo from "@/components/HeroVideo";
import RecordVisit from "@/components/RecordVisit";

export default function Page() {
  const heroVideoSrc = "/hero-bg-forest.mp4";

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
                  media="(prefers-color-scheme: dark) and (min-width: 768px)"
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
                  <div className="flex max-w-xs items-center gap-2 text-sm leading-relaxed text-base-content/70">
                    <span>Every booking supports local ecosystem restoration +</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/1%25%20for%20the%20plant%20logo.svg"
                      alt="1% for the Planet"
                      className="h-6 w-auto opacity-80"
                    />
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
          <span className="rounded-full border border-base-content/30 px-4 py-2 text-xs uppercase tracking-[0.3em] text-base-content/70">
            Scroll
          </span>
        </div>
      </section>
      <EventsSection />
      <section className="bg-base-200 px-6 py-16 text-base-content md:px-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <h2 className="text-3xl font-serif">About</h2>
          <div className="space-y-4">
            <div className="collapse collapse-arrow border border-base-content/10 bg-base-100/40">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-semibold">About Us</div>
              <div className="collapse-content space-y-3 text-base-content/80">
                <p>Just a couple of unique monkeys building the best tools we can.</p>
                <p>With Love. Tay &amp; River</p>
                <p>
                  Reach out if you want to build with us -{" "}
                  <a className="link link-hover" href="mailto:hi@life-time.co">
                    hi@life-time.co
                  </a>
                </p>
              </div>
            </div>
            <div className="collapse collapse-arrow border border-base-content/10 bg-base-100/40">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-semibold">Vision</div>
              <div className="collapse-content text-base-content/80">
                <p>
                  We imagine a world where technology gracefully serves life instead
                  of consuming it—where people have more time for genuine
                  connection, unexpected joy, and the pursuits that make them truly
                  feel alive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
