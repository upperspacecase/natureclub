import HexagonLogo from "@/components/HexagonLogo";

export default function Page() {
  return (
    <div className="min-h-screen bg-neutral-800 text-white">
      {/* Header */}
      <header className="p-6 md:p-8">
        <div className="flex items-center gap-3">
          <HexagonLogo className="w-10 h-10 text-neutral-400" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium tracking-wide">Nature</span>
            <span className="text-sm font-medium tracking-wide">Club</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-6 md:px-8 pb-16 md:pb-24">
        <div className="max-w-4xl">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl leading-[1.1] mb-8">
            <span className="font-serif italic text-stone-100">Make time</span>
            <br />
            <span className="font-sans font-light text-stone-100">for </span>
            <span className="font-serif italic text-stone-100">Nature.</span>
          </h1>

          {/* Subtext and CTA Row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mt-12">
            <p className="text-lg md:text-xl text-stone-300 max-w-md leading-relaxed">
              Connect to a whole world of <em className="font-serif">Nature</em> based
              experiences, events and facilitators.
            </p>

            <button className="btn btn-outline border-stone-400 text-stone-100 hover:bg-stone-100 hover:text-neutral-800 hover:border-stone-100 rounded-full px-8 py-3 text-base font-medium transition-all">
              Explore Experiences
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
