"use client";

import { ProductDetailsView } from "@/components/products/product-details-view";
import { ProductResponse } from "@/lib/products/types/products.types";

interface ProductDetailsClientProps {
  product: ProductResponse;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  return <ProductDetailsView product={product} />;
}
