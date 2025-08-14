import { getSession } from "@/lib/session/session";
import { CustomerNavbarClient } from "./customer-navbar-client";

interface NavbarProps {
  className?: string;
}

export async function CustomerNavbar({ className }: NavbarProps) {
  const session = await getSession();

  return <CustomerNavbarClient session={session} className={className} />;
}
