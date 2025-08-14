import { Suspense } from "react";

import { CustomerNavbar } from "@/components/layouts/customer-nav";
import AboutClient from "./products-client";
import { ProductPageSkeleton } from "./ProductPageSkeleton";

export default function ContactPage() {
  return (
    <>
      <CustomerNavbar />

      <Suspense fallback={<ProductPageSkeleton />}>
        <AboutClient />
      </Suspense>
    </>
  );
}
