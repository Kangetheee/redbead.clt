"use client";

import { ContactInfo } from "./contact-info";
import { ContactForm } from "./contact-form";
import { FAQSection } from "./faq-section";
import { MapSection } from "./map-section";

export default function ContactPageClient() {
  return (
    <div className="min-h-screen bg-white">
      {/* Contact Information & Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            <ContactInfo />
            <ContactForm />
          </div>
        </div>
      </section>

      {/* FAQ Section with Infinite Scroll */}
      <FAQSection />

      {/* Google Map Section */}
      <MapSection />
    </div>
  );
}
