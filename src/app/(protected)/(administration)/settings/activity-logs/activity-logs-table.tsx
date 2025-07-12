"use client";

import { useQuery } from "@tanstack/react-query";

import { DataTable } from "@/components/ui/data-table";
import useUpdateSearchParams from "@/hooks/use-update-search-params";
import { getActivityLogsAction } from "@/lib/activity/activity.actions";
import { tags } from "@/lib/shared/constants";

import { ActivityLogsTableColumns } from "./activity-logs-table-columns";

export default function ActivityLogsTable() {
  const { getSearchParams } = useUpdateSearchParams();

  const searchParams = getSearchParams();

  const { data, error, isError, isLoading, isRefetching } = useQuery({
    queryKey: [tags.ACTIVITY_LOG, { searchParams }],
    queryFn: async () => {
      const res = await getActivityLogsAction();
      if (!res.success) throw new Error(res.error);
      return res;
    },
  });

  return (
    <DataTable
      columns={ActivityLogsTableColumns}
      data={data?.data.results}
      pageCount={data?.data.meta.pageCount}
      error={isError ? error : undefined}
      isFetching={isLoading}
      isRefetching={isRefetching}
    />
  );
}
