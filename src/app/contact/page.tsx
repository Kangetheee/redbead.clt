import { Suspense } from "react";
import ContactPageClient from "./ContactPageClient";
import { ContactPageSkeleton } from "./ContactPageSkeleton";
import { FaqDataProvider } from "./faq-provider";
import { CustomerNavbar } from "@/components/layouts/customer-nav";

export default function ContactPage() {
  return (
    <>
      <CustomerNavbar />

      <FaqDataProvider />

      <Suspense fallback={<ContactPageSkeleton />}>
        <ContactPageClient />
      </Suspense>
    </>
  );
}
