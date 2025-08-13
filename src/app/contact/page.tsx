import { Suspense } from "react";
import ContactPageClient from "./ContactPageClient";
import { ContactPageSkeleton } from "./ContactPageSkeleton";

export default function ContactPage() {
  return (
    <Suspense fallback={<ContactPageSkeleton />}>
      <ContactPageClient />
    </Suspense>
  );
}
