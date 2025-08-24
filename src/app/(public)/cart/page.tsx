import { Suspense } from "react";

import AboutClient from "./cart-client";
import { CartPageSkeleton } from "./CartPageSkeleton";

export default function ContactPage() {
  return (
    <>
      <Suspense fallback={<CartPageSkeleton />}>
        <AboutClient />
      </Suspense>
    </>
  );
}
