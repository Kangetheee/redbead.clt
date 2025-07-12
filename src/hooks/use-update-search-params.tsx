import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function useUpdateSearchParams() {
  const router = useRouter();
  const pathname = usePathname() as Route;
  const searchParams = useSearchParams();

  const updateQueryString = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([name, value]) => {
        if (value !== undefined) params.set(name, value);
        else params.delete(name);
      });

      return params.toString();
    },
    [searchParams]
  );

  const setSearchParams = (updates: Record<string, string | undefined>) =>
    router.push(`${pathname}?${updateQueryString(updates)}`);

  const getSearchParams = () => {
    const page = searchParams.get("page");
    if (!!page && !Number.isNaN(parseInt(page, 10))) {
      const params = new URLSearchParams(searchParams);
      params.delete("page");
      params.set("pageIndex", (parseInt(page, 10) - 1).toString());

      return params.toString();
    }

    return searchParams.toString();
  };

  const getParsedSearchParams = () => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  };

  return { setSearchParams, getSearchParams, getParsedSearchParams };
}
