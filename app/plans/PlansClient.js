"use client";

import PhoneFrame from "@/components/nc-design/PhoneFrame";
import Plans from "@/components/nc-design/screens/Plans";
import { useNCNav } from "@/components/nc-design/useNav";

export default function PlansClient({ upcoming, past }) {
  const { go, openEvent } = useNCNav();
  return (
    <PhoneFrame>
      <Plans
        upcoming={upcoming}
        past={past}
        onOpenEvent={openEvent}
        onNav={go}
      />
    </PhoneFrame>
  );
}
