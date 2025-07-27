/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Award,
  Users,
  Target,
  Heart,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  Headphones,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AboutPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar - Same as landing page */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Red Bead</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                Products
              </Link>
              <Link
                href="/design-studio"
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                Design Studio
              </Link>
              <Link
                href="/about"
                className="text-green-600 font-medium transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Desktop Auth & Cart */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              </Button>

              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>

              <Button className="bg-green-600 hover:bg-green-700" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  href="/design-studio"
                  className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Design Studio
                </Link>
                <Link
                  href="/about"
                  className="text-green-600 font-medium transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/cart" onClick={() => setIsMenuOpen(false)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Cart
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    asChild
                  >
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-red-50 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-200">
              🇰🇪 Proudly Kenyan Since 2019
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About Red Bead
              <span className="block text-green-600">Our Story & Mission</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              We&apos;re passionate about helping Kenyan businesses shine
              through premium custom print solutions that tell their unique
              stories.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Journey
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Founded in 2019, Red Bead started as a small printing shop in
                  Nairobi with a simple mission: to provide high-quality custom
                  print solutions that help Kenyan businesses make lasting
                  impressions.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  What began as a two-person operation has grown into
                  Kenya&apos;s leading custom print solutions provider, serving
                  over 500 businesses across East Africa. Our commitment to
                  quality, innovation, and customer satisfaction has remained
                  unchanged.
                </p>
                <p className="text-lg text-gray-600">
                  Today, we&apos;re proud to be the trusted partner for
                  companies ranging from startups to multinational corporations,
                  helping them showcase their brands through premium custom
                  products.
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-red-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      2019
                    </div>
                    <div className="text-sm text-gray-600">Founded</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      500+
                    </div>
                    <div className="text-sm text-gray-600">Happy Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      50K+
                    </div>
                    <div className="text-sm text-gray-600">
                      Products Delivered
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      24/7
                    </div>
                    <div className="text-sm text-gray-600">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Mission, Vision & Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do at Red Bead
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <Target className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Our Mission
                </h3>
                <p className="text-gray-600">
                  To empower Kenyan businesses with premium custom print
                  solutions that enhance their brand visibility and help them
                  stand out in competitive markets.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <Award className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Our Vision
                </h3>
                <p className="text-gray-600">
                  To be East Africa&apos;s leading custom print solutions
                  provider, recognized for exceptional quality, innovation, and
                  customer service excellence.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <Heart className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Our Values
                </h3>
                <p className="text-gray-600">
                  Quality craftsmanship, customer-first approach, innovation,
                  integrity, and contributing to the growth of Kenyan businesses
                  and communities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What Sets Us Apart
              </h2>
              <p className="text-lg text-gray-600">
                Here&apos;s why businesses across Kenya choose Red Bead
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  title: "Local Expertise, Global Standards",
                  description:
                    "We understand the Kenyan market while maintaining international quality standards in all our products.",
                  icon: <MapPin className="h-6 w-6 text-green-600" />,
                },
                {
                  title: "End-to-End Solutions",
                  description:
                    "From design consultation to final delivery, we handle every aspect of your custom printing needs.",
                  icon: <CheckCircle className="h-6 w-6 text-green-600" />,
                },
                {
                  title: "Sustainable Practices",
                  description:
                    "We&apos;re committed to environmentally responsible printing practices and supporting local suppliers.",
                  icon: <Heart className="h-6 w-6 text-green-600" />,
                },
                {
                  title: "Innovation Focus",
                  description:
                    "We continuously invest in the latest printing technology and techniques to deliver cutting-edge solutions.",
                  icon: <Award className="h-6 w-6 text-green-600" />,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600">
              The passionate professionals behind Red Bead&apos;s success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "David Kamau",
                role: "Founder & CEO",
                description:
                  "With 8+ years in printing industry, David leads our vision of excellence.",
              },
              {
                name: "Grace Wanjiku",
                role: "Head of Design",
                description:
                  "Creative director ensuring every design meets our quality standards.",
              },
              {
                name: "Peter Otieno",
                role: "Operations Manager",
                description:
                  "Ensures smooth operations and timely delivery of all orders.",
              },
            ].map((member, index) => (
              <Card key={index} className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-red-600 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {member.name}
                    </h3>
                    <p className="text-green-600 font-medium">{member.role}</p>
                  </div>
                  <p className="text-gray-600 text-sm">{member.description}</p>
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
            Ready to Work With Us?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join our growing family of satisfied customers and let us help bring
            your brand vision to life.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-50"
              asChild
            >
              <Link href="/products">
                View Our Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600"
              asChild
            >
              <Link href="/contact">Get In Touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
