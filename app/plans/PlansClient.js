"use client";

import { useRouter } from "next/navigation";
import PhoneFrame from "@/components/nc-design/PhoneFrame";
import Plans from "@/components/nc-design/screens/Plans";
import { useNCNav } from "@/components/nc-design/useNav";

export default function PlansClient({ upcoming, hosting, drafts, past }) {
  const router = useRouter();
  const { go, openEvent } = useNCNav();

  async function handleMenuAction(action, ev) {
    const id = ev._id || ev.id;
    if (!id) return;

    if (action === "edit") {
      router.push(`/events/new?id=${id}`);
      return;
    }

    if (action === "publish") {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Publish failed");
        return;
      }
      router.refresh();
      return;
    }

    if (action === "cancel") {
      if (!confirm(`Cancel "${ev.title}"? This notifies everyone who RSVPed.`)) return;
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Cancel failed");
        return;
      }
      router.refresh();
      return;
    }

    if (action === "delete") {
      if (!confirm(`Delete "${ev.title || "this draft"}"? Can't undo.`)) return;
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Delete failed");
        return;
      }
      router.refresh();
      return;
    }

    if (action === "run-again") {
      const res = await fetch(`/api/events/${id}/duplicate`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Could not duplicate");
        return;
      }
      const { id: newId } = await res.json();
      router.push(`/events/new?id=${newId}`);
    }
  }

  return (
    <PhoneFrame>
      <Plans
        upcoming={upcoming}
        hosting={hosting}
        drafts={drafts}
        past={past}
        onOpenEvent={openEvent}
        onEditEvent={(e) => router.push(`/events/new?id=${e._id || e.id}`)}
        onNewEvent={() => router.push("/events/new")}
        onMenuAction={handleMenuAction}
        onNav={go}
      />
    </PhoneFrame>
  );
}
