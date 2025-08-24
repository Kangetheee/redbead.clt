import { Suspense } from "react";
import ContactPageClient from "./ContactPageClient";
import { ContactPageSkeleton } from "./ContactPageSkeleton";
import { FaqDataProvider } from "./faq-provider";

export default function ContactPage() {
  return (
    <>
      <FaqDataProvider />

      <Suspense fallback={<ContactPageSkeleton />}>
        <ContactPageClient />
      </Suspense>
    </>
  );
}
