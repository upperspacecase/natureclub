import { PostHog } from "posthog-node";

let posthogClient = null;

const noOpClient = {
  capture: () => {},
  identify: () => {},
  shutdown: async () => {},
};

export function getPostHogClient() {
  if (posthogClient) return posthogClient;

  const apiKey =
    process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host =
    process.env.POSTHOG_HOST ||
    process.env.NEXT_PUBLIC_POSTHOG_HOST ||
    "https://us.i.posthog.com";

  if (!apiKey) {
    posthogClient = noOpClient;
    return posthogClient;
  }

  posthogClient = new PostHog(apiKey, {
    host,
    flushAt: 1,
    flushInterval: 0,
  });

  return posthogClient;
}

