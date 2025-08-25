"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { gsap } from "gsap";
import { Faq } from "@/lib/faqs/types/faq.types";

export function FAQSection() {
  const [faqData, setFaqData] = useState<Faq[]>([]);
  const scrollContainer = useRef<HTMLDivElement>(null);

  // Get FAQs from the data provider on mount
  useEffect(() => {
    const faqDataContainer = document.getElementById("faq-data-container");
    if (faqDataContainer && faqDataContainer.dataset.faqs) {
      try {
        const parsedData = JSON.parse(faqDataContainer.dataset.faqs);
        // Make sure we're working with an array
        if (Array.isArray(parsedData)) {
          setFaqData(parsedData);
        } else {
          console.error("FAQ data is not an array:", parsedData);
          setFaqData([]);
        }
      } catch (error) {
        console.error("Failed to parse FAQ data:", error);
        setFaqData([]);
      }
    }
  }, []);

  // Duplicate FAQ data for seamless infinite scroll
  const duplicatedFaqs =
    faqData.length > 0 ? [...faqData, ...faqData, ...faqData] : [];

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
  }, [faqData]); // Re-run when faqData changes

  return (
    <section className="py-20 bg-muted/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Quick answers to common questions about our services
          </p>
        </div>

        {faqData.length > 0 ? (
          <>
            {/* Infinite Scroll Container - Desktop */}
            <div className="relative overflow-hidden hidden md:block">
              <div
                ref={scrollContainer}
                className="flex space-x-6"
                style={{ width: "max-content" }}
              >
                {duplicatedFaqs.map((faq, index) => (
                  <Card
                    key={`${faq.id}-${index}`}
                    className="faq-card p-6 flex-shrink-0 w-80 hover:shadow-lg transition-shadow duration-300"
                    style={{ opacity: 1, transform: "scale(1)" }}
                  >
                    <CardContent className="space-y-3">
                      <h3 className="font-semibold text-foreground text-lg leading-tight">
                        {faq.question}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-muted/50 via-muted/40 to-transparent pointer-events-none z-10" />
              <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-muted/50 via-muted/40 to-transparent pointer-events-none z-10" />
            </div>

            <div className="md:hidden mt-8 grid gap-6">
              {faqData.map((faq) => (
                <Card key={faq.id} className="p-6">
                  <CardContent className="space-y-3">
                    <h3 className="font-semibold text-foreground">
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading FAQs...</p>
          </div>
        )}
      </div>
    </section>
  );
}
