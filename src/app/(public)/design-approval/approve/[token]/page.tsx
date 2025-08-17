import { DesignApprovalClient } from "../../approval-client";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function DesignApprovalPage({ params }: PageProps) {
  const { token } = await params;
  return <DesignApprovalClient token={token} action="approve" />;
}
