"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface OrdersPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export function OrdersPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
}: OrdersPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Calculate display values
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Create a new URLSearchParams instance for manipulation
  const createQueryString = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", page.toString());
    return newParams.toString();
  };

  // Navigate to specific page
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    router.push(`/admin/orders?${createQueryString(page)}`);
  };

  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="text-sm text-muted-foreground">
        {totalItems > 0 ? (
          <>
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{totalItems}</span> results
          </>
        ) : (
          <>No results found</>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {/* Page number buttons - only show if we have multiple pages */}
        {totalPages > 1 && (
          <div className="flex items-center space-x-1">
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              // Logic to determine which page numbers to show
              let pageNum: number;

              if (totalPages <= 5) {
                // If 5 or fewer pages, show all pages
                pageNum = index + 1;
              } else if (currentPage <= 3) {
                // If on pages 1-3, show pages 1-5
                pageNum = index + 1;
              } else if (currentPage >= totalPages - 2) {
                // If on last 3 pages, show last 5 pages
                pageNum = totalPages - 4 + index;
              } else {
                // Otherwise show 2 pages before and after current page
                pageNum = currentPage - 2 + index;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
