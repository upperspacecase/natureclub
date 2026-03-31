import { redirect } from "next/navigation";
import { getAuthUser } from "@/libs/auth";
import { getUserJourneyData, serializeEvents } from "@/libs/user-stats";
import UserHome from "@/components/home/DashboardHome";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getAuthUser();
  if (!user) redirect("/signin");

  const { stats, upcomingEvents, pastEvents, hostedEvents } =
    await getUserJourneyData(user._id);

  return (
    <UserHome
      user={{
        name: user.name,
        username: user.username,
        photoUrl: user.photoUrl,
      }}
      stats={stats}
      upcomingEvents={serializeEvents(upcomingEvents)}
      pastEvents={serializeEvents(pastEvents)}
      hostedEvents={serializeEvents(hostedEvents)}
    />
  );
}
