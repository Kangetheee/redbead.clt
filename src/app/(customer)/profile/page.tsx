// page.tsx (Server Component)
import { getSession } from "@/lib/session/session";
import { redirect } from "next/navigation";
import ProfilePageClient from "./profile-page-client";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return <ProfilePageClient />;
}
