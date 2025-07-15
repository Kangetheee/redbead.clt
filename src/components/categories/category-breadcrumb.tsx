"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import Link from "next/link";
import type { CategoryWithRelations } from "@/lib/categories/types/categories.types";

interface CategoryBreadcrumbProps {
  category: CategoryWithRelations;
  currentPage?: string;
}

export function CategoryBreadcrumb({
  category,
  currentPage,
}: CategoryBreadcrumbProps) {
  // Build breadcrumb path
  const breadcrumbPath = [];
  let current: CategoryWithRelations | undefined = category;

  while (current) {
    breadcrumbPath.unshift(current);
    current = current.parent as CategoryWithRelations | undefined;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard/customer">
              <Home className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard/customer/design-studio">Categories</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbPath.map((cat, index) => (
          <div key={cat.id} className="flex items-center">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === breadcrumbPath.length - 1 && !currentPage ? (
                <BreadcrumbPage>{cat.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={`/dashboard/customer/browse/${cat.slug}`}>
                    {cat.name}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}

        {currentPage && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
