"use client";

import { useEffect, useRef, useState } from "react";

const HeroVideo = ({ src, poster }) => {
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = async () => {
      try {
        const result = video.play();
        if (result && typeof result.then === "function") {
          await result;
        }
        if (!video.paused) {
          setIsReady(true);
        }
      } catch (error) {
        console.error(error);
        setIsReady(true);
      }
    };

    tryPlay();
  }, [src]);

  return (
    <div className="absolute inset-0 z-0 bg-base-100">
      <video
        ref={videoRef}
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
        poster={poster}
        onLoadedData={() => setIsReady(true)}
        onCanPlay={() => setIsReady(true)}
        onPlaying={() => setIsReady(true)}
        onError={() => setIsReady(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-black/55 to-black" />
    </div>
  );
};

export default HeroVideo;
