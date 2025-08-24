import { getSession } from "@/lib/session/session";
import { redirect } from "next/navigation";
import { ProtectedLayoutClient } from "./protected-layout-client";
import { CustomerNavbar } from "@/components/layouts/customer-nav";
import Footer from "@/components/layouts/dashboard/footer";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerNavbar />
      <ProtectedLayoutClient session={session}>
        {children}
      </ProtectedLayoutClient>
      <Footer />
    </div>
  );
}
