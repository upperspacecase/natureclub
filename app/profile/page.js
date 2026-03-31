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
      router.replace(`/profile/${user._id || user.id}`);
    }
  }, [user, loading, isAuthenticated, router]);

  return (
    <div className="flex h-[100dvh] items-center justify-center bg-black">
      <span className="text-white/30">Loading profile…</span>
    </div>
  );
}
