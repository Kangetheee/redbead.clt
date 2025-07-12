import { ReactNode } from "react";

import DashboardLayout from "@/components/layouts/dashboard/dashboard-layout";
import env from "@/config/server.env";

import { getSession } from "@/lib/session/session";
import SessionManager from "./session-manager";
import { SocketProvider } from "@/providers/socket-provider";

type Props = Readonly<{ children: ReactNode }>;

export default async function Layout({ children }: Props) {
  const session = await getSession();
  return (
    <SessionManager timeout={parseInt(env.INACTIVITY_TIME)}>
      <DashboardLayout>
        <SocketProvider apiUrl={env.API_URL} token={session?.accessToken}>
          {children}
        </SocketProvider>
      </DashboardLayout>
    </SessionManager>
  );
}
