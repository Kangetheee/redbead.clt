"use client";

import { CustomerNavbarClient } from "@/components/layouts/customer-navbar-client";
import Footer from "@/components/layouts/dashboard/footer";
import { Session } from "@/lib/session/session.types";

interface PublicLayoutClientProps {
  children: React.ReactNode;
  session: Session | null;
}

export function PublicLayoutClient({
  children,
  session,
}: PublicLayoutClientProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CustomerNavbarClient session={session} />
      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
