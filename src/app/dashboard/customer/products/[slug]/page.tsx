/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useProductBySlug } from "@/hooks/use-products";
import { CustomizationChoiceDto } from "@/lib/cart/dto/cart.dto";
import ProductGallery from "./product-gallery";
import ProductInfo from "./product-info";
import CustomizationPanel from "./customization-panel";
import AddToCartForm from "./add-to-cart-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share, Heart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [customizations, setCustomizations] = useState<
    CustomizationChoiceDto[]
  >([]);
  const [selectedDesignId, setSelectedDesignId] = useState<string>();

  const { data: product, isLoading, error } = useProductBySlug(params.slug);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share product");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            {/* Back button skeleton */}
            <div className="h-10 w-32 bg-gray-300 rounded"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gallery skeleton */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-300 rounded-lg"></div>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-20 h-20 bg-gray-300 rounded"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Info skeleton */}
              <div className="space-y-6">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
                <div className="h-40 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Product Not Found
                </h1>
                <p className="text-gray-600">
                  The product you&apos;re looking for doesn&apos;t exist or has
                  been removed.
                </p>
                <Link href="/products">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Products
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb/Back Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard/customer/products">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Gallery */}
          <div className="lg:col-span-1">
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Middle Column - Product Info and Customization */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <ProductInfo product={product} />

              {/* Customization Panel */}
              {product.categoryId && (
                <CustomizationPanel
                  productId={product.id}
                  categoryId={product.categoryId}
                  onCustomizationChange={setCustomizations}
                  initialCustomizations={customizations}
                />
              )}
            </div>
          </div>

          {/* Right Column - Add to Cart */}
          <div className="lg:col-span-1">
            <AddToCartForm
              product={product}
              customizations={customizations}
              designId={selectedDesignId}
            />
          </div>
        </div>

        {/* Additional Product Information Sections */}
        <div className="mt-12 space-y-8">
          {/* Related Products */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Related Products
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Placeholder for related products */}
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-300 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Customer Reviews
              </h2>
              <div className="space-y-6">
                {/* Review Summary */}
                <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">4.0</div>
                    <div className="text-sm text-gray-600">out of 5</div>
                  </div>
                  <div className="flex-1">
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-sm w-8">{rating}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{
                                width: `${rating === 4 ? 60 : rating === 5 ? 30 : 10}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">
                            {rating === 4 ? 12 : rating === 5 ? 8 : 3}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-4">
                  {[
                    {
                      name: "Sarah Johnson",
                      rating: 5,
                      date: "2 weeks ago",
                      comment:
                        "Excellent quality and fast delivery. Exactly what I was looking for!",
                    },
                    {
                      name: "Mike Chen",
                      rating: 4,
                      date: "1 month ago",
                      comment:
                        "Good product overall. The customization options are great.",
                    },
                  ].map((review, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{review.name}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-sm ${
                                    i < review.rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {review.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full">
                  View All Reviews
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
