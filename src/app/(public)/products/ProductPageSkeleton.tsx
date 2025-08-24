import { Skeleton } from "@/components/ui/skeleton";

export function ProductPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar skeleton */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-32" />
            <div className="hidden md:flex space-x-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-6 w-20" />
              ))}
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>

      {/* Contact Information & Form section skeleton */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <Skeleton className="h-8 w-48 mb-8" />

              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                    <div className="w-full">
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="w-full h-20 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Skeleton className="w-full h-[600px] rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section skeleton */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        </div>
      </section>

      {/* Map Section skeleton */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-48 mx-auto mb-4" />
            <Skeleton className="h-6 w-80 mx-auto" />
          </div>

          <Skeleton className="h-[400px] w-full rounded-lg mb-8" />

          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
