import { Suspense } from "react";

import { CustomerNavbar } from "@/components/layouts/customer-nav";
import AboutClient from "./about-client";
import { AboutPageSkeleton } from "./AboutPageSkeleton";

export default function ContactPage() {
  return (
    <>
      <CustomerNavbar />

      <Suspense fallback={<AboutPageSkeleton />}>
        <AboutClient />
      </Suspense>
    </>
  );
}
