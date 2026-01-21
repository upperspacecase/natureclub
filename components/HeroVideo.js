"use client";

import { useState } from "react";

const HeroVideo = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="absolute inset-0 z-0 bg-black">
      <video
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          isPlaying ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
        onPlay={() => setIsPlaying(true)}
        onPlaying={() => setIsPlaying(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
};

export default HeroVideo;
