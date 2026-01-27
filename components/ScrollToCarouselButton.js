"use client";

const ScrollToCarouselButton = () => {
  const handleScroll = () => {
    const target = document.getElementById("events-carousel");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button type="button" className="btn btn-primary" onClick={handleScroll}>
        Get Started
      </button>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-15 w-15 rotate-180 animate-scrollHint opacity-50"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m6 15 6-6 6 6" />
      </svg>
    </div>
  );
};

export default ScrollToCarouselButton;
