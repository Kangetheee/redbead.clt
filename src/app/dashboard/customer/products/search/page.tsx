"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/use-products";
import { GetProductsDto } from "@/lib/products/dto/products.dto";
import ProductCard from "../product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function ProductSearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<GetProductsDto>({
    page: 1,
    limit: 12,
    search: initialQuery,
    isActive: true,
  });

  const { data: productsData, isLoading } = useProducts(filters);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      setFilters((prev) => ({ ...prev, search: initialQuery }));
    }
  }, [initialQuery]);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchQuery, page: 1 }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Search Products
        </h1>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {filters.search && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Search results for &quot;{filters.search}&quot;
              {productsData && (
                <span className="text-sm font-normal ml-2">
                  ({productsData.meta.totalItems}{" "}
                  {productsData.meta.totalItems === 1 ? "result" : "results"})
                </span>
              )}
            </h2>
          </div>
        )}

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
            {productsData?.items && productsData.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsData.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : filters.search ? (
              <Card className="w-full max-w-md mx-auto">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600">
                    No products found for &quot;{filters.search}&quot;. Try
                    different keywords.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="w-full max-w-md mx-auto">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600">
                    Enter a search term to find products.
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
