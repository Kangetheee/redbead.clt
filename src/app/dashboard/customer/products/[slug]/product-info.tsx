"use client";

import { ProductResponse } from "@/lib/products/types/products.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Package, Truck, Shield } from "lucide-react";

interface ProductInfoProps {
  product: ProductResponse;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          {product.isFeatured && <Badge variant="secondary">Featured</Badge>}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-3xl font-bold text-blue-600">
            {formatPrice(product.basePrice)}
          </span>
          {product.sku && (
            <span className="text-sm text-gray-500">SKU: {product.sku}</span>
          )}
        </div>

        {/* Rating Placeholder */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">(4.0) · 23 reviews</span>
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
        </CardContent>
      </Card>

      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-700">Stock:</span>
              <span
                className={`ml-2 ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {product.stock > 0
                  ? `${product.stock} available`
                  : "Out of stock"}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Min Order:</span>
              <span className="ml-2 text-gray-600">
                {product.minOrderQuantity}
              </span>
            </div>
            {product.maxOrderQuantity && (
              <div>
                <span className="font-medium text-gray-700">Max Order:</span>
                <span className="ml-2 text-gray-600">
                  {product.maxOrderQuantity}
                </span>
              </div>
            )}
            {product.weight && (
              <div>
                <span className="font-medium text-gray-700">Weight:</span>
                <span className="ml-2 text-gray-600">{product.weight} lbs</span>
              </div>
            )}
          </div>

          {product.category && (
            <div>
              <span className="font-medium text-gray-700">Category:</span>
              <Badge variant="outline" className="ml-2">
                {product.category.name}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features/Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Why Choose This Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Package className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Quality Materials</h4>
                <p className="text-sm text-gray-600">
                  Premium quality materials and construction
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Fast Shipping</h4>
                <p className="text-sm text-gray-600">
                  Quick processing and delivery
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">
                  Satisfaction Guarantee
                </h4>
                <p className="text-sm text-gray-600">
                  30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meta Information */}
      {(product.metaTitle || product.metaDescription) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {product.metaTitle && (
              <div>
                <span className="font-medium text-gray-700">Meta Title:</span>
                <span className="ml-2 text-gray-600">{product.metaTitle}</span>
              </div>
            )}
            {product.metaDescription && (
              <div>
                <span className="font-medium text-gray-700">
                  Meta Description:
                </span>
                <span className="ml-2 text-gray-600">
                  {product.metaDescription}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
