import { Suspense } from "react";

import ProductsClient from "./products-client";
import { ProductPageSkeleton } from "./ProductPageSkeleton";

export default function ContactPage() {
  return (
    <>
      <Suspense fallback={<ProductPageSkeleton />}>
        <ProductsClient />
      </Suspense>
    </>
  );
}
