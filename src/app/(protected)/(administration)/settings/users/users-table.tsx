"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next-nprogress-bar";

import { DataTable } from "@/components/ui/data-table";
import DataTableSelect from "@/components/ui/data-table-select";
import useUpdateSearchParams from "@/hooks/use-update-search-params";
import { RoleResponse } from "@/lib/roles/types/roles.types";
import { tags } from "@/lib/shared/constants";
import { getUsersAction } from "@/lib/users/users.actions";

import { UserTableColumns } from "./user-table-columns";

interface Props {
  roles: RoleResponse[];
}

export default function UsersTable({ roles }: Props) {
  const router = useRouter();
  const { getSearchParams } = useUpdateSearchParams();
  const searchParams = getSearchParams();
  const query = `?isAdmin=1${searchParams ? `&${searchParams}` : ""}`;
  const { data, error, isError, isLoading, isRefetching } = useQuery({
    queryKey: [tags.USER, { query }],
    queryFn: async () => {
      const res = await getUsersAction(query);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });

  return (
    <DataTable
      columns={UserTableColumns}
      data={data?.results}
      pageCount={data?.meta.pageCount}
      error={isError ? error : undefined}
      isFetching={isLoading}
      isRefetching={isRefetching}
      allowSearch
      onRowClick={({ id }) => router.push(`/settings/users/${id}`)}
      headerComponent={
        <DataTableSelect
          name="role"
          placeholder="Select Role"
          options={roles.map((role) => ({
            value: role.id,
            label: role.name,
          }))}
        />
      }
    />
  );
}
