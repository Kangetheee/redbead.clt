import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-12" />
        <span>/</span>
        <Skeleton className="h-4 w-20" />
        <span>/</span>
        <Skeleton className="h-4 w-24" />
        <span>/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images Skeleton */}
        <div className="space-y-4">
          {/* Main Image */}
          <Skeleton className="aspect-square w-full rounded-lg" />

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Price Card */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-32" />
              </div>
            </CardContent>
          </Card>

          {/* Configuration Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quantity */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>

              {/* Urgency */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Options */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-1">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
