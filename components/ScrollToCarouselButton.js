"use client";

const ScrollToCarouselButton = () => {
  const handleScroll = () => {
    const target = document.getElementById("events-carousel");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="flex w-full flex-col items-start">
      <button type="button" className="btn btn-primary" onClick={handleScroll}>
        Get Started
      </button>
    </div>
  );
};

export default ScrollToCarouselButton;
