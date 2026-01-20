"use client";

import { useEffect, useMemo, useState } from "react";
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

  if (!events?.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center text-sm text-[#f6f5f0]/70">
        No events yet.
      </div>
    );
  }

  return (
    <div
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      aria-busy={isLoading}
    >
      {isLoading && (
        <span className="sr-only" aria-live="polite">
          Loading likes
        </span>
      )}
      {events.map((event) => {
        const isLiked = likedSet.has(event.id);
        const isBusy = activeEventId === event.id;
        return (
          <article
            key={event.id}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 shadow-lg"
          >
            <div className="relative h-56 w-full">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <h3 className="text-xl font-serif text-[#f6f5f0]">
                  {event.title}
                </h3>
                <p className="text-sm text-[#f6f5f0]/80">{event.duration}</p>
              </div>
              <button
                type="button"
                aria-label={isLiked ? "Unlike event" : "Like event"}
                aria-pressed={isLiked}
                disabled={isLoading || isBusy}
                onClick={() => handleToggleLike(event.id)}
                className="rounded-full border border-white/30 bg-white/10 p-3 text-[#f6f5f0] transition hover:bg-white/20 disabled:opacity-50"
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
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M12.1 20.15 12 20.25l-.11-.1C7.14 15.8 4 12.96 4 9.5 4 7 5.99 5 8.5 5c1.54 0 3.04.73 4 1.88C13.46 5.73 14.96 5 16.5 5 19.01 5 21 7 21 9.5c0 3.46-3.14 6.3-8.9 10.65Z" />
                  </svg>
                )}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default EventsList;
