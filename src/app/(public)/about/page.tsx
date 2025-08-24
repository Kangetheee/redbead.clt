import { Suspense } from "react";

import AboutClient from "./about-client";
import { AboutPageSkeleton } from "./AboutPageSkeleton";

export default function ContactPage() {
  return (
    <>
      <Suspense fallback={<AboutPageSkeleton />}>
        <AboutClient />
      </Suspense>
    </>
  );
}
