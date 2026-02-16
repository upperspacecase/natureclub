// All dashboard pages require Clerk auth — can't be pre-rendered
export const dynamic = "force-dynamic";

export default async function LayoutPrivate({ children }) {
  return <>{children}</>;
}
