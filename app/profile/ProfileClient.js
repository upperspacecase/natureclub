"use client";

import { useRouter } from "next/navigation";
import PhoneFrame from "@/components/nc-design/PhoneFrame";
import You from "@/components/nc-design/screens/You";
import { useNCNav } from "@/components/nc-design/useNav";

export default function ProfileClient({ user, stats, memberCounts, activity }) {
  const router = useRouter();
  const { go } = useNCNav();

  async function signOut() {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/signin");
  }

  return (
    <PhoneFrame>
      <You
        user={user}
        stats={stats}
        memberCounts={memberCounts}
        activity={activity}
        onNav={go}
        onGoYourEvents={() => go("yourEvents")}
        onEditProfile={() => router.push("/profile/setup")}
        onSignOut={signOut}
      />
    </PhoneFrame>
  );
}
