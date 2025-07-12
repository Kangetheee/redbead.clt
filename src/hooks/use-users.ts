import { tags } from "@/lib/shared/constants";
import { getUserAction, getUsersAction } from "@/lib/users/users.actions";
import { useQuery } from "@tanstack/react-query";
import useUpdateSearchParams from "./use-update-search-params";

export function useUsers(query?: string) {
  const { getSearchParams } = useUpdateSearchParams();

  const searchParams = query || getSearchParams();

  const { data, error, isError, isLoading, isRefetching } = useQuery({
    queryKey: [tags.USER, ...(searchParams ? [searchParams] : [])],
    queryFn: async () => {
      const res = await getUsersAction(searchParams);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });

  return {
    data,
    error: isError ? error : undefined,
    isLoading,
    isRefetching,
  };
}

export function useUser(userId?: string) {
  return useQuery({
    queryKey: [tags.USER, { userId }],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const res = await getUserAction(userId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!userId,
  });
}

// Hook for searching users with debouncing
export function useUserSearch(
  { isAdmin }: { isAdmin: boolean } = { isAdmin: true }
) {
  const query = `pageSize=-1&isAdmin=${isAdmin}&fields=name`;
  const { data, isPending } = useQuery({
    queryKey: [tags.USER, query],
    queryFn: async () => {
      const res = await getUsersAction(query);
      if (!res.success) throw new Error(res.error);
      return res.data.results.map(({ id, name }) => ({
        value: id,
        label: name,
      }));
    },
  });

  return {
    users: data ?? [],
    isGettingUsers: isPending,
  };
}
