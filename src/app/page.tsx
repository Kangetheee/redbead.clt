import { FeaturedProductsSection } from "@/components/products/featured-products";
import { getSession } from "@/lib/session/session";
import { HeroSection } from "./(public)/landing/hero-section";
import { CTASection } from "./(public)/landing/cta-section";
// import { TrustIndicators } from "./(public)/landing/trust-indicators";
import { WhyChooseUs } from "./(public)/landing/why-choose-us";
import { TestimonialsSection } from "./(public)/landing/testimonials-section";
import { CustomerNavbar } from "@/components/layouts/customer-nav";
import Footer from "@/components/layouts/dashboard/footer";

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-background">
      <CustomerNavbar />

      <HeroSection session={session} />

      {/* <TrustIndicators /> */}

      <section className="py-20">
        <div className="container mx-auto px-4">
          <FeaturedProductsSection limit={8} className="max-w-7xl mx-auto" />
        </div>
      </section>

      <WhyChooseUs />

      {/* CTA Section */}
      <CTASection session={session} />

      <TestimonialsSection />
      <Footer />
    </div>
  );
}
