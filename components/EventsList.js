"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import apiClient from "@/libs/api";

const CLIENT_ID_KEY = "nc-client-id";
const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z";
const BURST_HEARTS = [
  { x: -26, y: -10, rotate: "-18deg", delay: 0 },
  { x: -18, y: -28, rotate: "-10deg", delay: 80 },
  { x: -6, y: -38, rotate: "-4deg", delay: 140 },
  { x: 8, y: -40, rotate: "6deg", delay: 200 },
  { x: 20, y: -30, rotate: "12deg", delay: 260 },
  { x: 26, y: -12, rotate: "18deg", delay: 320 },
  { x: -10, y: -22, rotate: "-8deg", delay: 380 },
  { x: 12, y: -20, rotate: "10deg", delay: 440 },
];

const getClientId = () => {
  if (typeof window === "undefined") return null;
  let clientId = localStorage.getItem(CLIENT_ID_KEY);
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }
  return clientId;
};

const HeartIcon = ({ filled, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "currentColor"}
    strokeWidth={filled ? 0 : 1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d={HEART_PATH} />
  </svg>
);

const EventsList = ({ events }) => {
  const [clientId, setClientId] = useState(null);
  const [likedIds, setLikedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeEventId, setActiveEventId] = useState(null);
  const [burstEventId, setBurstEventId] = useState(null);
  const [burstKey, setBurstKey] = useState(0);
  const scrollerRef = useRef(null);

  useEffect(() => {
    setClientId(getClientId());
  }, []);

  useEffect(() => {
    if (!clientId) return;
    const fetchLikes = async () => {
      try {
        const data = await apiClient.get("/event-like", {
          params: { clientId },
        });
        setLikedIds(data?.likedEventIds || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLikes();
  }, [clientId]);

  const likedSet = useMemo(() => new Set(likedIds), [likedIds]);


  const handleToggleLike = async (eventId) => {
    if (!clientId) return;
    setActiveEventId(eventId);
    setBurstEventId(eventId);
    setBurstKey((prev) => prev + 1);
    try {
      const data = await apiClient.post("/event-like", { eventId, clientId });
      setLikedIds((prev) => {
        if (data?.liked) return [...new Set([...prev, eventId])];
        return prev.filter((id) => id !== eventId);
      });
    } catch (error) {
      console.error(error);
    } finally {
      setActiveEventId(null);
    }
    window.setTimeout(() => {
      setBurstEventId((prev) => (prev === eventId ? null : prev));
    }, 1400);
  };

  const handleScroll = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cards = Array.from(scroller.querySelectorAll("[data-event-card]"));
    if (!cards.length) return;
    const scrollerCenter = scroller.scrollLeft + scroller.clientWidth / 2;
    const currentIndex = cards.reduce((closestIndex, card, index) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const closestCard = cards[closestIndex];
      const closestCenter =
        closestCard.offsetLeft + closestCard.clientWidth / 2;
      return Math.abs(cardCenter - scrollerCenter) <
        Math.abs(closestCenter - scrollerCenter)
        ? index
        : closestIndex;
    }, 0);
    const delta = direction === "next" ? 1 : -1;
    const targetIndex = Math.min(
      Math.max(currentIndex + delta, 0),
      cards.length - 1
    );
    cards[targetIndex].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  if (!events?.length) {
    return (
      <div className="rounded-2xl border border-base-content/10 bg-base-200/40 p-8 text-center text-sm text-base-content/70">
        No events yet.
      </div>
    );
  }

  return (
    <div className="relative" aria-busy={isLoading}>
      {isLoading && (
        <span className="sr-only" aria-live="polite">
          Loading likes
        </span>
      )}
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory snap-always gap-6 overflow-x-auto px-6 pb-6 scrollbar-hide sm:px-10"
      >
        {events.map((event) => {
          const isLiked = likedSet.has(event.id);
          const isBusy = activeEventId === event.id;
          return (
            <div
              key={event.id}
              data-event-card
              className="flex w-[70vw] min-w-[70vw] snap-center flex-col items-center sm:w-[360px] sm:min-w-[360px] lg:w-[380px] lg:min-w-[380px]"
            >
              <article className="group relative h-[420px] w-full overflow-hidden rounded-[6px] border border-base-content/10 bg-base-200/40 shadow-xl sm:h-[520px]">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 80vw, 420px"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
                <div className="absolute left-6 top-6">
                  <p className="text-3xl font-serif text-white drop-shadow sm:text-4xl">
                    {event.title}
                  </p>
                </div>
                {event.tags?.length > 0 && (
                  <div className="absolute bottom-6 left-6">
                    <span className="rounded-full border border-base-content/30 bg-base-100/80 px-3 py-1 text-xs text-base-content/80 backdrop-blur">
                      {event.tags[0]}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-6 right-6">
                  <div className="relative h-16 w-16">
                    {burstEventId === event.id && (
                      <div
                        key={burstKey}
                        className="pointer-events-none absolute inset-0"
                      >
                        {BURST_HEARTS.map((heart, index) => (
                          <span
                            key={index}
                            className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-heartBurst text-base-content"
                            style={{
                              "--heart-x": `${heart.x}px`,
                              "--heart-y": `${heart.y}px`,
                              "--heart-rotate": heart.rotate,
                              animationDelay: `${heart.delay}ms`,
                            }}
                          >
                            <HeartIcon filled className="h-4 w-4" />
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      aria-label={isLiked ? "Unlike event" : "Like event"}
                      aria-pressed={isLiked}
                      disabled={isLoading || isBusy}
                      onClick={() => handleToggleLike(event.id)}
                      className={`flex h-16 w-16 items-center justify-center bg-transparent disabled:opacity-50 ${
                        isLiked ? "text-white" : "text-white"
                      }`}
                    >
                      {isLiked ? (
                        <HeartIcon filled className="h-6 w-6" />
                      ) : (
                        <HeartIcon className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between px-6 sm:px-10">
        <button
          type="button"
          aria-label="Previous events"
          onClick={() => handleScroll("prev")}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-base-content bg-transparent text-base-content/80 shadow-lg backdrop-blur-sm transition-colors hover:bg-base-content hover:text-base-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-base-content/60"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path d="m15 19-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next events"
          onClick={() => handleScroll("next")}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-base-content bg-transparent text-base-content/80 shadow-lg backdrop-blur-sm transition-colors hover:bg-base-content hover:text-base-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-base-content/60"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path d="m9 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EventsList;
