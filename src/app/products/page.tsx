/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProductTypes } from "@/hooks/use-products";
import {
  ProductFilters,
  ProductFilterState,
} from "@/components/products/product-filters";
import { ProductGrid } from "@/components/products/product-grid";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Award,
  Clock,
  Users,
  ShoppingCart,
  CheckCircle,
  Filter,
  Grid3X3,
  List,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilterState>({});
  const [page, setPage] = useState(1);
  const limit = 12;

  const {
    data: productsData,
    isLoading,
    error,
  } = useProductTypes({
    page,
    limit,
    ...filters,
  });

  const handleFilterChange = (newFilters: ProductFilterState) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Red Bead</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-green-600 font-medium transition-colors"
              >
                Products
              </Link>
              <Link
                href="/design-studio"
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                Design Studio
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Desktop Auth & Cart */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              </Button>

              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>

              <Button className="bg-green-600 hover:bg-green-700" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="text-green-600 font-medium transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  href="/design-studio"
                  className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Design Studio
                </Link>
                <Link
                  href="/about"
                  className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/cart" onClick={() => setIsMenuOpen(false)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Cart
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    asChild
                  >
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-900 font-medium">
                Products
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Products Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
              <p className="text-gray-600 mt-1">
                {productsData?.meta.totalItems || 0} products available
              </p>
            </div>

            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Ready to Order
            </Badge>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-gray-900">
                      <Filter className="h-5 w-5 mr-2 text-green-600" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductFilters
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
                      className="border-green-600 text-green-600 hover:bg-green-50"
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
              {productsData && productsData.meta.totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                      className="border-gray-300 hover:border-green-600 hover:text-green-600"
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: productsData.meta.totalPages },
                        (_, i) => i + 1
                      )
                        .filter((pageNum) => {
                          // Show first page, last page, current page, and pages around current
                          return (
                            pageNum === 1 ||
                            pageNum === productsData.meta.totalPages ||
                            Math.abs(pageNum - page) <= 1
                          );
                        })
                        .map((pageNum, index, array) => (
                          <div key={pageNum} className="flex items-center">
                            {/* Add ellipsis if there's a gap */}
                            {index > 0 && array[index - 1] < pageNum - 1 && (
                              <span className="px-2 text-gray-500">...</span>
                            )}
                            <Button
                              variant={page === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className={
                                page === pageNum
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "border-gray-300 hover:border-green-600 hover:text-green-600"
                              }
                            >
                              {pageNum}
                            </Button>
                          </div>
                        ))}
                    </div>

                    <Button
                      variant="outline"
                      disabled={page === productsData.meta.totalPages}
                      onClick={() => handlePageChange(page + 1)}
                      className="border-gray-300 hover:border-green-600 hover:text-green-600"
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Red Bead?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re committed to delivering exceptional quality and service
              that helps your brand make a lasting impression.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-green-200">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-gray-900">
                  Custom Design Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Need a unique design? Our expert team can create custom
                  designs tailored to your specific requirements.
                </p>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-center text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Professional Design Team
                  </li>
                  <li className="flex items-center justify-center text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Unlimited Revisions
                  </li>
                  <li className="flex items-center justify-center text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Quick Turnaround
                  </li>
                </ul>

                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  asChild
                >
                  <Link href="/contact">Get Quote</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-green-200">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-gray-900">Bulk Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Planning a large event? Contact us for special pricing on bulk
                  orders and volume discounts.
                </p>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-center text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Volume Discounts
                  </li>
                  <li className="flex items-center justify-center text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Dedicated Account Manager
                  </li>
                  <li className="flex items-center justify-center text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Flexible Payment Terms
                  </li>
                </ul>

                <Button
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                  asChild
                >
                  <Link href="/bulk-orders">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-green-200">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-gray-900">
                  Quality Guarantee
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  We stand behind our products with a 100% satisfaction
                  guarantee and premium materials.
                </p>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-center text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    100% Satisfaction Guarantee
                  </li>
                  <li className="flex items-center justify-center text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Premium Materials Only
                  </li>
                  <li className="flex items-center justify-center text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    ISO Certified Process
                  </li>
                </ul>

                <Button
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                  asChild
                >
                  <Link href="/quality">Our Promise</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses that trust Red Bead for their custom
            printing needs. Let&apos;s bring your brand to life!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-50"
              asChild
            >
              <Link href="/contact">Get Custom Quote</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600"
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
