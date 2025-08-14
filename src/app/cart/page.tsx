import { Suspense } from "react";

import { CustomerNavbar } from "@/components/layouts/customer-nav";
import AboutClient from "./cart-client";
import { CartPageSkeleton } from "./CartPageSkeleton";

export default function ContactPage() {
  return (
    <>
      <CustomerNavbar />

      <Suspense fallback={<CartPageSkeleton />}>
        <AboutClient />
      </Suspense>
    </>
  );
}
