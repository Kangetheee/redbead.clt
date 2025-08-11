import { Suspense } from "react";
import { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CategoriesContent from "./categories-content";

export const metadata: Metadata = {
  title: "Browse Categories - REDBEAD",
  description:
    "Explore our wide range of product categories and find the perfect items for your needs.",
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; view?: "grid" | "list" }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Browse Categories
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Discover our comprehensive range of customizable products organized by
          category. Find exactly what you&apos;re looking for or explore new
          possibilities.
        </p>
      </div>

      <Suspense fallback={<CategoriesPageSkeleton />}>
        <CategoriesContent
          searchQuery={resolvedSearchParams.search}
          viewMode={resolvedSearchParams.view || "grid"}
        />
      </Suspense>
    </div>
  );
}

function CategoriesPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search and Controls Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Skeleton className="h-10 w-full sm:w-80" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-26" />
      </div>

      {/* Categories Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full mb-4" />
              <div className="space-y-2 mb-4">
                <Skeleton className="h-3 w-20" />
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
