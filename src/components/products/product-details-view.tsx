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
} from "lucide-react";
import { ProductTypeResponse } from "@/lib/products/types/products.types";
import { QuickAddToCartButton } from "@/components/cart/quick-add-to-cart-button";
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

  const templates =
    product.designTemplates?.map((template) => ({
      id: template.id,
      name: template.name,
      basePrice: template.basePrice,
      sizeVariants: [], // Will be populated from actual template data
    })) || [];

  return (
    <div className={cn("container mx-auto px-4 py-8", className)}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/products">Products</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {product.category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/products?category=${product.category.slug}`}>
                      {product.category.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Back Button */}
      {showBackButton && (
        <Button variant="ghost" asChild className="mb-6">
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
          <Card className="overflow-hidden">
            <div className="aspect-square relative bg-gradient-to-br from-gray-50 to-gray-100">
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
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={handlePreviousImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
                      ? "border-primary"
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
                <Badge variant="outline">{product.category.name}</Badge>
              )}
              <Badge variant="secondary">{product.type}</Badge>
              <Badge variant="secondary">{product.material}</Badge>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-lg text-gray-600">{product.description}</p>
          </div>

          <Separator />

          {/* Design Templates */}
          {product.designTemplates && product.designTemplates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Available Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.designTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
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
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-500">
                          Starting from KES{" "}
                          {template.basePrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
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

          {/* Quick Add to Cart */}
          {templates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Quick Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuickAddToCartButton
                  templates={templates}
                  fullWidth={true}
                  variant="default"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </QuickAddToCartButton>
                <p className="text-sm text-gray-500 mt-2">
                  Select your preferred template and size to add to cart
                </p>
              </CardContent>
            </Card>
          )}

          {/* Product Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
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
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/contact">Get Quote</Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/samples">Order Sample</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Additional Information Sections */}
      <div className="mt-12 grid md:grid-cols-2 gap-8">
        {/* Description Section */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p>{product.description}</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <span className="capitalize">
                    {product.type.toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Material:</span>
                  <span className="capitalize">
                    {product.material.toLowerCase()}
                  </span>
                </div>
                {product.category && (
                  <div className="flex justify-between">
                    <span className="font-medium">Category:</span>
                    <span>{product.category.name}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ordering Information */}
        <Card>
          <CardHeader>
            <CardTitle>Ordering Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Custom Design Services
                </h4>
                <p className="text-sm text-blue-700">
                  Need a custom design? Our team can help create the perfect
                  design for your needs.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  Bulk Discounts Available
                </h4>
                <p className="text-sm text-green-700">
                  Contact us for special pricing on large quantity orders.
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
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
  );
}
