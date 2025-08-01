/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  CheckCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Eye,
  Menu,
  X,
} from "lucide-react";
import { ProductTypeResponse } from "@/lib/products/types/products.types";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { cn } from "@/lib/utils";

interface ProductDetailsViewProps {
  product: ProductTypeResponse;
  showBreadcrumbs?: boolean;
  showBackButton?: boolean;
  className?: string;
}

export function ProductDetailsView({
  product,
  showBreadcrumbs = true,
  showBackButton = true,
  className,
}: ProductDetailsViewProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const images =
    product.images?.length > 0
      ? product.images
      : [product.thumbnailImage].filter(Boolean);
  const currentImage = images[selectedImageIndex] || "/placeholder-product.jpg";

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  // Use the actual design templates without trying to add sizeVariants
  const templates = product.designTemplates || [];

  // Component to handle individual template add to cart
  const TemplateAddToCartItem = ({
    template,
  }: {
    template: (typeof templates)[0];
  }) => {
    // For now, we'll use a placeholder sizeVariantId since the ProductTypeDesignTemplate
    // doesn't include size variants. In a real implementation, you'd either:
    // 1. Fetch the full template details that include size variants
    // 2. Use a default size variant ID
    // 3. Navigate to a customization page first

    const defaultSizeVariantId = "default-size"; // This should come from your actual data

    return (
      <div className="flex items-center justify-between p-3 bg-white border border-green-200 rounded-lg">
        <div className="flex items-center gap-3">
          {template.previewImage && (
            <div className="w-8 h-8 rounded overflow-hidden bg-gray-100">
              <Image
                src={template.previewImage}
                alt={template.name}
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900 text-sm">{template.name}</p>
            <p className="text-xs text-green-600 font-medium">
              KES {template.basePrice.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Use AddToCartButton component for proper cart functionality */}
        <AddToCartButton
          templateId={template.id}
          sizeVariantId={defaultSizeVariantId}
          quantity={1}
          variant="default"
          size="sm"
          className="bg-green-600 hover:bg-green-700"
          showSuccessState={true}
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          Add to Cart
        </AddToCartButton>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar - Same as other pages */}
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
                <Link href="/sign-in">Sign In</Link>
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
                    <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
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

      <div className={cn("container mx-auto px-4 py-8", className)}>
        {/* Breadcrumbs */}
        {showBreadcrumbs && (
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
                <BreadcrumbLink asChild>
                  <Link
                    href="/products"
                    className="text-gray-600 hover:text-green-600 transition-colors"
                  >
                    Products
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {product.category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link
                        href={`/products?category=${product.category.slug}`}
                        className="text-gray-600 hover:text-green-600 transition-colors"
                      >
                        {product.category.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gray-900 font-medium">
                  {product.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Back Button */}
        {showBackButton && (
          <Button
            variant="outline"
            asChild
            className="mb-6 border-green-600 text-green-600 hover:bg-green-50"
          >
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <Card className="overflow-hidden border-gray-200">
              <div className="aspect-square relative bg-gradient-to-br from-green-50 to-gray-100">
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    isImageLoading ? "opacity-0" : "opacity-100"
                  )}
                  onLoad={() => setIsImageLoading(false)}
                  priority
                />

                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white border-green-200"
                      onClick={handlePreviousImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white border-green-200"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Loading State */}
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                  </div>
                )}
              </div>
            </Card>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors",
                      selectedImageIndex === index
                        ? "border-green-600"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {product.isFeatured && (
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {product.category && (
                  <Badge
                    variant="outline"
                    className="border-green-200 text-green-700"
                  >
                    {product.category.name}
                  </Badge>
                )}
                <Badge variant="secondary">{product.type}</Badge>
                <Badge variant="secondary">{product.material}</Badge>
              </div>

              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600">{product.description}</p>
            </div>

            <Separator />

            {/* Design Templates */}
            {templates.length > 0 && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Eye className="h-5 w-5 text-green-600" />
                    Available Templates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {template.previewImage && (
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                            <Image
                              src={template.previewImage}
                              alt={template.name}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {template.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Starting from KES{" "}
                            <span className="font-medium text-green-600">
                              {template.basePrice.toLocaleString()}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-600 text-green-600 hover:bg-green-50"
                          asChild
                        >
                          <Link href={`/templates/${template.slug}`}>
                            View Template
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Add to Cart Section */}
            {templates.length > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    Order This Product
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Choose from {templates.length} available template
                    {templates.length !== 1 ? "s" : ""} and customize your order
                  </div>

                  {/* Template Selection for Add to Cart */}
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-3 bg-white border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {template.previewImage && (
                            <div className="w-8 h-8 rounded overflow-hidden bg-gray-100">
                              <Image
                                src={template.previewImage}
                                alt={template.name}
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {template.name}
                            </p>
                            <p className="text-xs text-green-600 font-medium">
                              KES {template.basePrice.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          asChild
                        >
                          <Link
                            href={`/customize/${template.slug}?product=${product.slug}`}
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Add to Cart
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500 bg-white p-3 rounded border border-green-200">
                    💡 Each template can be customized with your logo, text, and
                    preferred colors during the ordering process.
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Features */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Info className="h-5 w-5 text-green-600" />
                  Product Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">
                      High-quality {product.material.toLowerCase()} material
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">
                      Professional {product.type.toLowerCase()} design
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Custom printing available</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Bulk ordering options</span>
                  </li>
                  {templates.length > 0 && (
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">
                        {templates.length} design template
                        {templates.length !== 1 ? "s" : ""} available
                      </span>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Additional Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                asChild
              >
                <Link href="/contact">Get Quote</Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                asChild
              >
                <Link href="/contact">Order Sample</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Information Sections */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          {/* Description Section */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-600">{product.description}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Type:</span>
                    <span className="capitalize text-gray-600">
                      {product.type.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Material:</span>
                    <span className="capitalize text-gray-600">
                      {product.material.toLowerCase()}
                    </span>
                  </div>
                  {product.category && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">
                        Category:
                      </span>
                      <span className="text-gray-600">
                        {product.category.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ordering Information */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">
                Ordering Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Custom Design Services
                  </h4>
                  <p className="text-sm text-blue-700">
                    Need a custom design? Our team can help create the perfect
                    design for your needs.
                  </p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">
                    Bulk Discounts Available
                  </h4>
                  <p className="text-sm text-green-700">
                    Contact us for special pricing on large quantity orders.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">
                    Fast Turnaround
                  </h4>
                  <p className="text-sm text-purple-700">
                    Most orders ship within 3-5 business days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
