"use client";

const ScrollToCarouselButton = () => {
  const handleScroll = () => {
    const joinTarget = document.getElementById("join-now-button");
    const fallbackTarget = document.getElementById("events-carousel");
    const target = joinTarget || fallbackTarget;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const desiredBottom = window.innerHeight - 5;
    const nextTop = window.scrollY + (rect.bottom - desiredBottom);
    window.scrollTo({ top: Math.max(nextTop, 0), behavior: "smooth" });
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
