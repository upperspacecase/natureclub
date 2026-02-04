"use client";

const ScrollToCarouselButton = () => {
  const handleScroll = () => {
    const target = document.getElementById("events-carousel");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        window.scrollBy({ top: 220, left: 0, behavior: "smooth" });
      }, 150);
    }
  };

  return (
    <div className="flex w-full flex-col items-start">
      <button type="button" className="btn btn-primary ml-5" onClick={handleScroll}>
        Get Started
      </button>
    </div>
  );
};

export default ScrollToCarouselButton;
