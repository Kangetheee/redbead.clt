import { FeaturedProductsSection } from "@/components/products/featured-products";
import { getSession } from "@/lib/session/session";
import { CTASection } from "./(public)/landing/cta-section";
import { TestimonialsSection } from "./(public)/landing/testimonials-section";
import { CustomerNavbar } from "@/components/layouts/customer-nav";
import Footer from "@/components/layouts/dashboard/footer";

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-background">
      <CustomerNavbar />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <FeaturedProductsSection limit={8} className="max-w-7xl mx-auto" />
        </div>
      </section>

      {/* CTA Section */}
      <CTASection session={session} />

      <TestimonialsSection />
      <Footer />
    </div>
  );
}
