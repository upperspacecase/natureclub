"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import config from "@/config";
import { useAuth } from "@/libs/useAuth";

const ButtonSignin = ({ text = "Get started", extraStyle }) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleClick = () => {
    if (user) {
      router.push(config.auth.callbackUrl);
    } else {
      posthog.capture("signin_clicked", {
        button_text: text,
        page_url: typeof window !== "undefined" ? window.location.href : "",
        is_already_authenticated: false,
      });
      router.push("/signin");
    }
  };

  if (user) {
    return (
      <Link
        href={config.auth.callbackUrl}
        className={`btn ${extraStyle ? extraStyle : ""}`}
      >
        {user.photoUrl ? (
          <img
            src={user.photoUrl}
            alt={user.name || "Account"}
            className="w-6 h-6 rounded-full shrink-0"
            referrerPolicy="no-referrer"
            width={24}
            height={24}
          />
        ) : (
          <span className="w-6 h-6 bg-base-300 flex justify-center items-center rounded-full shrink-0">
            {user.name?.charAt(0) || user.email?.charAt(0)}
          </span>
        )}
        {user.name || user.email || "Account"}
      </Link>
    );
  }

  return (
    <button
      className={`btn ${extraStyle ? extraStyle : ""}`}
      onClick={handleClick}
      disabled={loading}
    >
      {text}
    </button>
  );
};

export default ButtonSignin;
