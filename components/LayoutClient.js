"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Crisp } from "crisp-sdk-web";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import posthog from "posthog-js";
import config from "@/config";
import { AuthProvider } from "@/libs/useAuth";

let posthogInitialized = false;

const CrispChat = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (config?.crisp?.id) {
      Crisp.configure(config.crisp.id);

      if (
        config.crisp.onlyShowOnRoutes &&
        !config.crisp.onlyShowOnRoutes?.includes(pathname)
      ) {
        Crisp.chat.hide();
        Crisp.chat.onChatClosed(() => {
          Crisp.chat.hide();
        });
      }
    }
  }, [pathname]);

  return null;
};

const PostHogPageviewTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!posthogInitialized) return;
    const query = searchParams?.toString();
    const currentUrl = query ? `${pathname}?${query}` : pathname;
    posthog.capture("$pageview", { $current_url: currentUrl });
  }, [pathname, searchParams]);

  return null;
};

const ClientLayout = ({ children }) => {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!apiKey || posthogInitialized) return;

    posthog.init(apiKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      capture_pageview: false,
      autocapture: true,
    });

    posthogInitialized = true;
  }, []);

  return (
    <AuthProvider>
      <NextTopLoader color={config.colors.main} showSpinner={false} />

      {children}

      <Toaster toastOptions={{ duration: 3000 }} />

      <Tooltip
        id="tooltip"
        className="z-[60] !opacity-100 max-w-sm shadow-lg"
      />

      <Suspense fallback={null}>
        <PostHogPageviewTracker />
      </Suspense>

      <CrispChat />
    </AuthProvider>
  );
};

export default ClientLayout;
