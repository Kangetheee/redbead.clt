"use client";

import { useFeaturedProducts } from "@/hooks/use-products";
import ProductCard from "../product-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function FeaturedProductsPage() {
  const { data: featuredProducts, isLoading, error } = useFeaturedProducts(20);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              Failed to load featured products.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Star className="h-8 w-8 text-yellow-400 fill-current" />
          <h1 className="text-3xl font-bold text-gray-900">
            Featured Products
          </h1>
        </div>
        <p className="text-lg text-gray-600 mb-8">
          Discover our handpicked selection of premium products, chosen for
          their exceptional quality and popularity.
        </p>

        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">
              Why These Products Are Special
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Top Rated</h3>
                <p className="text-sm opacity-90">
                  Highest customer satisfaction ratings
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Best Sellers</h3>
                <p className="text-sm opacity-90">
                  Most popular among our customers
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Premium Quality</h3>
                <p className="text-sm opacity-90">
                  Exceptional materials and craftsmanship
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {featuredProducts && featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} featured />
                ))}
              </div>
            ) : (
              <Card className="w-full max-w-md mx-auto">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600">
                    No featured products available at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
