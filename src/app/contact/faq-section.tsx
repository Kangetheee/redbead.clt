import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { gsap } from "gsap";

const FAQ_DATA = [
  {
    question: "What's your minimum order quantity?",
    answer:
      "Our minimum order quantity varies by product. For most items like lanyards and wristbands, we start from 50 pieces. Contact us for specific requirements.",
  },
  {
    question: "How long does production take?",
    answer:
      "Standard production time is 3-7 business days depending on the product and quantity. Rush orders can be completed in 24-48 hours for an additional fee.",
  },
  {
    question: "Do you provide design services?",
    answer:
      "Yes! Our experienced design team can help create or refine your artwork. We offer free design consultations and revisions until you're completely satisfied.",
  },
  {
    question: "What file formats do you accept?",
    answer:
      "We accept AI, PDF, PNG, JPG, and EPS files. For best results, we recommend vector files (AI or PDF) with 300 DPI resolution.",
  },
  {
    question: "Do you offer samples before bulk orders?",
    answer:
      "Yes, we can provide samples for most products. Sample costs vary and can often be credited towards your final order.",
  },
  {
    question: "What are your payment terms?",
    answer:
      "We accept M-Pesa, bank transfers, and cash payments. For large orders, we typically require 50% upfront with the balance due upon completion.",
  },
];

export function FAQSection() {
  const scrollContainer = useRef<HTMLDivElement>(null);

  // Duplicate FAQ data for seamless infinite scroll
  const duplicatedFaqs = [...FAQ_DATA, ...FAQ_DATA, ...FAQ_DATA];

  useEffect(() => {
    if (scrollContainer.current) {
      const container = scrollContainer.current;
      const totalWidth = container.scrollWidth / 3; // Since we have 3 copies

      gsap.set(container, { x: 0 });

      const tl = gsap.timeline({ repeat: -1, ease: "none" });

      tl.to(container, {
        x: -totalWidth,
        duration: 30, // Adjust speed here - higher number = slower
        ease: "none",
      });

      // Pause animation on hover
      const handleMouseEnter = () => tl.pause();
      const handleMouseLeave = () => tl.resume();

      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);

      // Intersection Observer for visibility
      const cards = container.querySelectorAll(".faq-card");
      const observerOptions = {
        root: container.parentElement, // FAQ section container
        rootMargin: "-10% 0px -10% 0px", // Trigger when 10% visible
        threshold: [0, 0.1, 0.5, 1],
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const card = entry.target as HTMLElement;
          const visibilityRatio = entry.intersectionRatio;

          if (visibilityRatio === 0) {
            // Completely out of view
            gsap.to(card, {
              opacity: 0,
              scale: 0.95,
              duration: 0.3,
              ease: "power2.out",
            });
          } else if (visibilityRatio < 0.5) {
            // Partially visible - fade based on visibility
            gsap.to(card, {
              opacity: visibilityRatio * 2, // Scale up opacity
              scale: 0.95 + visibilityRatio * 0.05,
              duration: 0.3,
              ease: "power2.out",
            });
          } else {
            // Fully visible
            gsap.to(card, {
              opacity: 1,
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
            });
          }
        });
      }, observerOptions);

      // Observe all cards
      cards.forEach((card) => observer.observe(card));

      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
        observer.disconnect();
        tl.kill();
      };
    }
  }, []);

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Quick answers to common questions about our services
          </p>
        </div>

        {/* Infinite Scroll Container - Desktop */}
        <div className="relative overflow-hidden hidden md:block">
          <div
            ref={scrollContainer}
            className="flex space-x-6"
            style={{ width: "max-content" }}
          >
            {duplicatedFaqs.map((faq, index) => (
              <Card
                key={index}
                className="faq-card p-6 flex-shrink-0 w-80 hover:shadow-lg transition-shadow duration-300"
                style={{ opacity: 1, transform: "scale(1)" }}
              >
                <CardContent className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Gradient Overlays */}
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent pointer-events-none z-10" />
        </div>

        {/* Static FAQ Grid for Mobile */}
        <div className="md:hidden mt-8 grid gap-6">
          {FAQ_DATA.map((faq, index) => (
            <Card key={index} className="p-6">
              <CardContent className="space-y-3">
                <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
