"use client";

const ScrollToCarouselButton = ({ variant = "default" }) => {
  const handleScroll = () => {
    window.dispatchEvent(new CustomEvent("nc:open-join"));
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
