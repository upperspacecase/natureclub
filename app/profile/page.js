"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/libs/useAuth";

export default function ProfileRedirect() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/signin?returnUrl=/profile");
      return;
    }

    if (user?.username) {
      router.replace(`/profile/${user.username}`);
    } else {
      // User hasn't set a username yet — send to setup
      router.replace("/profile/setup");
    }
  }, [user, loading, isAuthenticated, router]);

  return (
    <div className="flex h-[100dvh] items-center justify-center bg-black">
      <span className="text-white/30">Loading profile…</span>
    </div>
  );
}

