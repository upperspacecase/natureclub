"use client";

import { useRouter } from "next/navigation";
import RecordVisit from "@/components/RecordVisit";
import PhoneFrame from "@/components/nc-design/PhoneFrame";
import Landing from "@/components/nc-design/screens/Landing";

export default function Page() {
  const router = useRouter();
  return (
    <>
      <RecordVisit />
      <PhoneFrame>
        <Landing
          onEnter={() => router.push("/home")}
          onSignIn={() => router.push("/signin")}
        />
      </PhoneFrame>
    </>
  );
}
