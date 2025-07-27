/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Award,
  Clock,
  Headphones,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import { FeaturedProductsSection } from "@/components/products/featured-products";
import Link from "next/link";
import { useState } from "react";
import { CustomerNavbar } from "@/components/layouts/customer-nav";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <CustomerNavbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-red-50 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-200">
              🎉 Kenya&apos;s Leading Custom Print Solutions
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Custom Print Solutions
              <span className="block text-green-600">Made in Kenya</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              From corporate lanyards to custom wristbands, we deliver
              high-quality branded products that make your business stand out.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                asChild
              >
                <Link href="/products">
                  Explore Products <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/quote">Get Custom Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-gray-50 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Happy Clients</div>
            </div>
            <div className="flex flex-col items-center">
              <Award className="h-8 w-8 text-green-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">5 Years</div>
              <div className="text-sm text-gray-600">Experience</div>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="h-8 w-8 text-green-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">48Hr</div>
              <div className="text-sm text-gray-600">Quick Delivery</div>
            </div>
            <div className="flex flex-col items-center">
              <Headphones className="h-8 w-8 text-green-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <FeaturedProductsSection
            limit={8}
            className="max-w-7xl mx-auto"
            showAddToCart={true}
          />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Red Bead?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re committed to delivering exceptional quality and service
              that helps your brand make a lasting impression.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Award className="h-12 w-12 text-green-600" />,
                title: "Premium Quality",
                description:
                  "We use only the finest materials and latest printing technology to ensure your products meet the highest standards.",
                features: [
                  "ISO Certified",
                  "Quality Guarantee",
                  "Premium Materials",
                ],
              },
              {
                icon: <Clock className="h-12 w-12 text-green-600" />,
                title: "Fast Turnaround",
                description:
                  "Need it urgently? Our streamlined production process ensures quick delivery without compromising quality.",
                features: [
                  "Express Options",
                  "Rush Orders",
                  "Real-time Tracking",
                ],
              },
              {
                icon: <Users className="h-12 w-12 text-green-600" />,
                title: "Expert Support",
                description:
                  "Our experienced team guides you through every step, from design consultation to final delivery.",
                features: [
                  "Design Support",
                  "Bulk Discounts",
                  "Account Management",
                ],
              },
            ].map((benefit, index) => (
              <Card
                key={index}
                className="text-center p-8 hover:shadow-lg transition-shadow"
              >
                <CardContent className="space-y-4">
                  <div className="flex justify-center">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                  <ul className="space-y-2">
                    {benefit.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-center text-sm text-gray-600"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses that trust Red Bead for their custom
            printing needs. Let&apos;s bring your brand to life!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-50"
              asChild
            >
              <Link href="/products">
                Browse Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600"
              asChild
            >
              <Link href="/contact">Contact Us Today</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Customer Testimonials (Optional) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600">
              Don&apos;t just take our word for it - hear from our satisfied
              clients
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Mwangi",
                company: "Tech Startup Kenya",
                review:
                  "Red Bead delivered exactly what we needed for our conference. The lanyards were perfect quality and arrived on time!",
                rating: 5,
              },
              {
                name: "John Kiprotich",
                company: "NGO Director",
                review:
                  "Outstanding service and quality. Our custom wristbands were a huge hit at our charity event. Highly recommended!",
                rating: 5,
              },
              {
                name: "Grace Wanjiku",
                company: "Corporate Events",
                review:
                  "Professional, reliable, and great value for money. Red Bead has become our go-to partner for all corporate merchandise.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">
                    &quot;{testimonial.review}&quot;
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
