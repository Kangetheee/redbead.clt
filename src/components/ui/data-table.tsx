"use client";

import { useSearchParams } from "next/navigation";
import { JSX, useRef } from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader, Search } from "lucide-react";

import useTablePagination from "@/hooks/use-table-pagination";
import useUpdateSearchParams from "@/hooks/use-update-search-params";
import { getErrorMessage } from "@/lib/get-error-message";
import { cn } from "@/lib/utils";

import { Button } from "./button";
import DataTableDatePicker from "./data-table-date-picker";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableViewOptions } from "./data-table-view-options";
import { Input } from "./input";
import { Skeleton } from "./skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
  pageCount?: number;
  headerComponent?: JSX.Element;
  searchLabel?: string;
  skeletonCount?: number;
  isFetching?: boolean;
  isRefetching?: boolean;
  error?: unknown;
  filterByDate?: boolean;
  paginate?: boolean;
  showViewOptions?: boolean;
  allowSearch?: boolean;
  onRowClick?: (row: TData) => void;
  hideHeader?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data = [],
  pageCount = -1,
  error,
  headerComponent,
  isFetching = false,
  isRefetching = false,
  searchLabel,
  skeletonCount = 10,
  allowSearch = false,
  filterByDate = false,
  paginate = true,
  showViewOptions = false,
  onRowClick,
  hideHeader = false,
}: DataTableProps<TData, TValue>) {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "", 10) || 1;
  const pageSize = parseInt(searchParams.get("pageSize") || "", 10) || 10;
  const { setSearchParams } = useUpdateSearchParams();
  const pagination = { pageIndex: page - 1, pageSize };
  const { setPagination } = useTablePagination(pagination);
  const searchInput = useRef<HTMLInputElement>(null);
  const skeletons = Array.from({ length: skeletonCount }, (x, i) => i);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination },
    onPaginationChange: (updater) => {
      setPagination(table, updater);
    },
  });

  const columnCount = table.getAllColumns().length;

  return (
    <div className="space-y-8 rounded-md p-2">
      {(!!headerComponent ||
        !!allowSearch ||
        !!filterByDate ||
        !!showViewOptions) && (
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {headerComponent ?? null}

            {!!filterByDate && <DataTableDatePicker />}
            {!!allowSearch && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  if (searchInput.current)
                    setSearchParams({ s: searchInput.current.value });
                }}
                className="relative"
              >
                <Input
                  ref={searchInput}
                  defaultValue={searchParams.get("s") || ""}
                  placeholder={searchLabel ?? "Search..."}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-0 top-0"
                  variant="ghost"
                >
                  <Search />
                  <span className="sr-only">Search</span>
                </Button>
              </form>
            )}
          </div>

          {!!showViewOptions && <DataTableViewOptions table={table} />}
        </div>
      )}

      <div className="relative">
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 top-0 z-10 hidden place-items-center backdrop-blur-[1px]",
            isRefetching && "grid"
          )}
        >
          <Loader className="size-16 animate-spin text-muted-foreground" />
        </div>

        <Table className="overflow-x-auto">
          {!isFetching && !hideHeader && (
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={`header_${headerGroup.id}`}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-sm uppercase">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          )}

          <TableBody>
            {isFetching ? (
              skeletons.map((skeleton) => (
                <TableRow key={skeleton}>
                  {Array.from({ length: columnCount }, (x, i) => i).map(
                    (elm) => (
                      <TableCell key={elm}>
                        <Skeleton className="h-7 w-full bg-blue-100 dark:bg-muted" />
                      </TableCell>
                    )
                  )}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="text-center italic text-destructive"
                >
                  {getErrorMessage(error)}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={`row_${row.id}`}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "",
                    onRowClick && "cursor-pointer hover:bg-muted"
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={`cell_${cell.id}`}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && !error && !isFetching && paginate && (
        <DataTablePagination table={table} />
      )}
    </div>
  );
}
