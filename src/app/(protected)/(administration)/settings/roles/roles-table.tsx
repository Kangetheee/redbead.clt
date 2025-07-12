"use client";

import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { DataTable } from "@/components/ui/data-table";
import useUpdateSearchParams from "@/hooks/use-update-search-params";
import { getRolesAction } from "@/lib/roles/role.actions";
import { tags } from "@/lib/shared/constants";

import { RoleTableColumns } from "./role-table-columns";

export default function RolesTable() {
  const router = useRouter();
  const { getSearchParams } = useUpdateSearchParams();

  const searchParams = getSearchParams();

  const { data, error, isError, isLoading, isRefetching } = useQuery({
    queryKey: [tags.ROLE, { searchParams }],
    queryFn: async () => {
      const res = await getRolesAction();
      if (!res.success) throw new Error(res.error);
      return res;
    },
  });

  return (
    <DataTable
      columns={RoleTableColumns}
      data={data?.data.results}
      pageCount={data?.data.meta.pageCount}
      error={isError ? error : undefined}
      isFetching={isLoading}
      isRefetching={isRefetching}
      onRowClick={({ id }) => router.push(`/settings/roles/${id}`)}
    />
  );
}
