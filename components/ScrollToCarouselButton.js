"use client";

const ScrollToCarouselButton = () => {
  const handleScroll = () => {
    const target = document.getElementById("events-carousel");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button type="button" className="btn btn-primary" onClick={handleScroll}>
        Join for free
      </button>
    </div>
  );
};

export default ScrollToCarouselButton;
