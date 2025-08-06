/* eslint-disable @typescript-eslint/no-unused-vars */

import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid, List, ChevronRight } from "lucide-react";
import CategoriesContent from "./categories-content";

export const metadata: Metadata = {
  title: "Browse Categories - REDBEAD",
  description:
    "Explore our wide range of product categories and find the perfect items for your needs.",
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; view?: "grid" | "tree" }>;
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

      {/* Categories Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
