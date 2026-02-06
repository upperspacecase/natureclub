"use client";

const ScrollToCarouselButton = ({ variant = "default" }) => {
  const handleScroll = () => {
    const headingTarget = document.getElementById("events-heading");
    const joinTarget = document.getElementById("join-now-button");
    const fallbackTarget = document.getElementById("events-carousel");
    const target = headingTarget || joinTarget || fallbackTarget;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const offset = 24;
    const nextTop = window.scrollY + rect.top - offset;
    window.scrollTo({ top: Math.max(nextTop, 0), behavior: "smooth" });
  };

  const wrapperClass =
    variant === "hero"
      ? "flex w-full flex-col items-start"
      : "mt-6 flex w-full flex-col items-start md:mt-8";
  const buttonClass = variant === "hero" ? "hero-cta" : "btn btn-primary";

  return (
    <div className={wrapperClass}>
      <button type="button" className={buttonClass} onClick={handleScroll}>
        Get Started
      </button>
    </div>
  );
};

export default ScrollToCarouselButton;
