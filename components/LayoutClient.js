"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Crisp } from "crisp-sdk-web";
import { SessionProvider } from "next-auth/react";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import posthog from "posthog-js";
import config from "@/config";

let posthogInitialized = false;

// Crisp customer chat support:
// This component is separated from ClientLayout because it needs to be wrapped with <SessionProvider> to use useSession() hook
const CrispChat = ({ session }) => {
  const pathname = usePathname();

  useEffect(() => {
    if (config?.crisp?.id) {
      // Set up Crisp
      Crisp.configure(config.crisp.id);

      // (Optional) If onlyShowOnRoutes array is not empty in config.js file, Crisp will be hidden on the routes in the array.
      // Use <AppButtonSupport> instead to show it (user clicks on the button to show Crisp—it cleans the UI)
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

  // Add User Unique ID to Crisp to easily identify users when reaching support (optional)
  useEffect(() => {
    if (session?.user && config?.crisp?.id) {
      Crisp.session.setData({ userId: session.user?.id });
    }
  }, [session]);

  return null;
};

// All the client wrappers are here (they can't be in server components)
// 1. SessionProvider: Allow the useSession from next-auth (find out if user is auth or not)
// 2. NextTopLoader: Show a progress bar at the top when navigating between pages
// 3. Toaster: Show Success/Error messages anywhere from the app with toast()
// 4. Tooltip: Show tooltips if any JSX elements has these 2 attributes: data-tooltip-id="tooltip" data-tooltip-content=""
// 5. CrispChat: Set Crisp customer chat support (see above)
// 6. PostHog: User identification when authenticated
const AuthCrispChat = () => {
  const { data } = useSession();

  // Identify user in PostHog when authenticated
  useEffect(() => {
    if (!posthogInitialized || !data?.user) return;
    const distinctId = data.user.id || data.user.email;
    if (distinctId) {
      posthog.identify(distinctId, {
        email: data.user.email || "",
        name: data.user.name || "",
      });
    }
  }, [data]);

  return <CrispChat session={data} />;
};

const ClientLayout = ({ children }) => {
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  useEffect(() => {
    if (!posthogInitialized) return;
    const query = searchParams?.toString();
    const currentUrl = query ? `${pathname}?${query}` : pathname;
    posthog.capture("$pageview", { $current_url: currentUrl });
  }, [pathname, searchParams]);

  const content = (
    <>
      {/* Show a progress bar at the top when navigating between pages */}
      <NextTopLoader color={config.colors.main} showSpinner={false} />

      {/* Content inside app/page.js files  */}
      {children}

      {/* Show Success/Error messages anywhere from the app with toast() */}
      <Toaster
        toastOptions={{
          duration: 3000,
        }}
      />

      {/* Show tooltips if any JSX elements has these 2 attributes: data-tooltip-id="tooltip" data-tooltip-content="" */}
      <Tooltip
        id="tooltip"
        className="z-[60] !opacity-100 max-w-sm shadow-lg"
      />
    </>
  );

  return (
    <>
      {authEnabled ? (
        <SessionProvider>
          {content}
          <AuthCrispChat />
        </SessionProvider>
      ) : (
        <>
          {content}
          <CrispChat />
        </>
      )}
    </>
  );
};

export default ClientLayout;
