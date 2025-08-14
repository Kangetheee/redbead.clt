import { FeaturedProductsSection } from "@/components/products/featured-products";
import { getSession } from "@/lib/session/session";
import { HeroSection } from "./landing/hero-section";
import { CTASection } from "./landing/cta-section";
import { TrustIndicators } from "./landing/trust-indicators";
import { WhyChooseUs } from "./landing/why-choose-us";
import { TestimonialsSection } from "./landing/testimonials-section";
import { CustomerNavbar } from "@/components/layouts/customer-nav";

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-background">
      <CustomerNavbar />

      {/* Hero Section */}
      <HeroSection session={session} />

      {/* Trust Indicators */}
      <TrustIndicators />

      {/* Featured Products Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <FeaturedProductsSection limit={8} className="max-w-7xl mx-auto" />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* CTA Section */}
      <CTASection session={session} />

      {/* Customer Testimonials */}
      <TestimonialsSection />
    </div>
  );
}
