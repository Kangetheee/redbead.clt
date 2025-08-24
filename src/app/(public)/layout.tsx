import { getSession } from "@/lib/session/session";
import { PublicLayoutClient } from "./public-layout-client";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const session = await getSession();

  return <PublicLayoutClient session={session}>{children}</PublicLayoutClient>;
}
