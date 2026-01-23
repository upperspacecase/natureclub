"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import apiClient from "@/libs/api";

const CLIENT_ID_KEY = "nc-client-id";

const getClientId = () => {
  if (typeof window === "undefined") return null;
  let clientId = localStorage.getItem(CLIENT_ID_KEY);
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }
  return clientId;
};

const EventsList = ({ events }) => {
  const [clientId, setClientId] = useState(null);
  const [likedIds, setLikedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeEventId, setActiveEventId] = useState(null);
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
  };

  const handleScroll = (direction) => {
    if (!scrollerRef.current) return;
    const scrollAmount = scrollerRef.current.clientWidth * 0.9;
    scrollerRef.current.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
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
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 scrollbar-hide"
      >
        {events.map((event) => {
          const isLiked = likedSet.has(event.id);
          const isBusy = activeEventId === event.id;
          return (
            <div
              key={event.id}
              className="flex w-[78vw] min-w-[78vw] snap-center flex-col items-center sm:w-[420px] sm:min-w-[420px]"
            >
              <article className="group relative h-[420px] w-full overflow-hidden rounded-[32px] border border-base-content/10 bg-base-200/40 shadow-xl sm:h-[520px]">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 80vw, 420px"
                />
                <div className="absolute inset-0 bg-base-100/10" />
                <div className="absolute left-6 top-6">
                  <p className="text-2xl font-serif text-base-content sm:text-3xl">
                    {event.title}
                  </p>
                  <p className="mt-1 text-sm tracking-[0.2em] text-base-content/80">
                    {event.duration}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={isLiked ? "Unlike event" : "Like event"}
                  aria-pressed={isLiked}
                  disabled={isLoading || isBusy}
                  onClick={() => handleToggleLike(event.id)}
                  className="btn btn-circle btn-ghost absolute bottom-6 right-6 disabled:opacity-50"
                >
                  {isLiked ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M11.999 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18.01 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54l-1.451 1.31Z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="h-5 w-5"
                    >
                      <path d="M12.1 20.15 12 20.25l-.11-.1C7.14 15.8 4 12.96 4 9.5 4 7 5.99 5 8.5 5c1.54 0 3.04.73 4 1.88C13.46 5.73 14.96 5 16.5 5 19.01 4 21 7 21 9.5c0 3.46-3.14 6.3-8.9 10.65Z" />
                    </svg>
                  )}
                </button>
              </article>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        aria-label="Previous events"
        onClick={() => handleScroll("prev")}
        className="btn btn-circle btn-ghost absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 sm:flex"
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
        className="btn btn-circle btn-ghost absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 sm:flex"
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
  );
};

export default EventsList;
