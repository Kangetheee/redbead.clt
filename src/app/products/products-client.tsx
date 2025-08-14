/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/use-products";
import { ProductFilters } from "@/lib/products/types/products.types";
import { ProductFilters as ProductFiltersComponent } from "@/components/products/product-filters";
import { ProductGrid } from "@/components/products/product-grid";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Award, Users, ShoppingCart, CheckCircle, Filter } from "lucide-react";
import Link from "next/link";

export default function ProductsClient() {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [page, setPage] = useState(1);
  const limit = 12;

  const {
    data: productsData,
    isLoading,
    error,
  } = useProducts({
    page,
    limit,
    ...filters,
  });

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">
                Products
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Products Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                All Products
              </h2>
              <p className="text-muted-foreground mt-1">
                {productsData?.meta.itemsPerPage || 0} products available
              </p>
            </div>

            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Ready to Order
            </Badge>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <Card className="border-border shadow-sm bg-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-foreground">
                      <Filter className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductFiltersComponent
                      currentFilters={filters}
                      onFilterChange={handleFilterChange}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <ProductGrid
                products={productsData?.items || []}
                loading={isLoading}
                allowViewToggle={true}
                gridCols={{ sm: 1, md: 2, lg: 2, xl: 3 }}
                cardSize="md"
                showAddToCart={true}
                showTemplateList={true}
                showDescription={true}
                showCategory={true}
                showMaterial={true}
                emptyState={{
                  title: "No products found",
                  description:
                    "Try adjusting your filters or search terms to find what you're looking for.",
                  action: (
                    <Button
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30"
                      onClick={() => {
                        setFilters({});
                        setPage(1);
                      }}
                    >
                      Clear Filters
                    </Button>
                  ),
                }}
              />

              {/* Pagination */}
              {productsData && productsData.meta.itemsPerPage > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                      className="border-border hover:border-green-600 hover:text-green-600 dark:hover:border-green-400 dark:hover:text-green-400"
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: productsData.meta.itemsPerPage },
                        (_, i) => i + 1
                      )
                        .filter((pageNum) => {
                          // Show first page, last page, current page, and pages around current
                          return (
                            pageNum === 1 ||
                            pageNum === productsData.meta.itemsPerPage ||
                            Math.abs(pageNum - page) <= 1
                          );
                        })
                        .map((pageNum, index, array) => (
                          <div key={pageNum} className="flex items-center">
                            {/* Add ellipsis if there's a gap */}
                            {index > 0 && array[index - 1] < pageNum - 1 && (
                              <span className="px-2 text-muted-foreground">
                                ...
                              </span>
                            )}
                            <Button
                              variant={page === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className={
                                page === pageNum
                                  ? "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                                  : "border-border hover:border-green-600 hover:text-green-600 dark:hover:border-green-400 dark:hover:text-green-400"
                              }
                            >
                              {pageNum}
                            </Button>
                          </div>
                        ))}
                    </div>

                    <Button
                      variant="outline"
                      disabled={page === productsData.meta.itemsPerPage}
                      onClick={() => handlePageChange(page + 1)}
                      className="border-border hover:border-green-600 hover:text-green-600 dark:hover:border-green-400 dark:hover:text-green-400"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Additional Information Section */}
        <section className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Red Bead?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We&apos;re committed to delivering exceptional quality and service
              that helps your brand make a lasting impression.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 border-border hover:border-green-200 dark:hover:border-green-800 bg-card">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Award className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <CardTitle className="text-foreground">
                  Custom Design Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Need a unique design? Our expert team can create custom
                  designs tailored to your specific requirements.
                </p>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-center text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    Professional Design Team
                  </li>
                  <li className="flex items-center justify-center text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    Unlimited Revisions
                  </li>
                  <li className="flex items-center justify-center text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    Quick Turnaround
                  </li>
                </ul>

                <Button
                  className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                  asChild
                >
                  <Link href="/contact">Get Quote</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 border-border hover:border-green-200 dark:hover:border-green-800 bg-card">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <CardTitle className="text-foreground">Bulk Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Planning a large event? Contact us for special pricing on bulk
                  orders and volume discounts.
                </p>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-center text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    Volume Discounts
                  </li>
                  <li className="flex items-center justify-center text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    Dedicated Account Manager
                  </li>
                  <li className="flex items-center justify-center text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    Flexible Payment Terms
                  </li>
                </ul>

                <Button
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30"
                  asChild
                >
                  <Link href="/bulk-orders">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 border-border hover:border-green-200 dark:hover:border-green-800 bg-card">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <CardTitle className="text-foreground">
                  Quality Guarantee
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We stand behind our products with a 100% satisfaction
                  guarantee and premium materials.
                </p>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-center text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    100% Satisfaction Guarantee
                  </li>
                  <li className="flex items-center justify-center text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    Premium Materials Only
                  </li>
                  <li className="flex items-center justify-center text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    ISO Certified Process
                  </li>
                </ul>

                <Button
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30"
                  asChild
                >
                  <Link href="/quality">Our Promise</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-xl text-green-100 dark:text-green-200 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses that trust Red Bead for their custom
            printing needs. Let&apos;s bring your brand to life!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-50 dark:bg-gray-100 dark:text-green-700 dark:hover:bg-white"
              asChild
            >
              <Link href="/contact">Get Custom Quote</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600 dark:border-green-200 dark:text-green-100 dark:hover:bg-green-200 dark:hover:text-green-800"
              asChild
            >
              <Link href="/bulk-orders">Bulk Orders</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
