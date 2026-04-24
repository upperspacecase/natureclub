"use client";

import { useRouter } from "next/navigation";

const ROUTE_MAP = {
  landing: "/",
  home: "/home",
  discover: "/discovery",
  plans: "/plans",
  you: "/profile",
  yourEvents: "/plans",
  newEvent: "/events/new",
};

export function useNCNav() {
  const router = useRouter();
  return {
    go: (key) => {
      const norm = key === "calendar" ? "plans" : key === "profile" ? "you" : key;
      const path = ROUTE_MAP[norm];
      if (path) router.push(path);
    },
    openEvent: (id) => router.push(`/e/${id}`),
    back: () => router.back(),
  };
}
