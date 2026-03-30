"use client";

import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import config from "@/config";
import { AuthProvider } from "@/libs/useAuth";

const ClientLayout = ({ children }) => {
  return (
    <AuthProvider>
      <NextTopLoader color={config.colors.main} showSpinner={false} />

      {children}

      <Toaster toastOptions={{ duration: 3000 }} />

      <Tooltip
        id="tooltip"
        className="z-[60] !opacity-100 max-w-sm shadow-lg"
      />
    </AuthProvider>
  );
};

export default ClientLayout;
