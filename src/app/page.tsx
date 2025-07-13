import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle,
  Globe,
  Phone,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-600 to-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Redbead</span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="#services"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Services
              </Link>
              <Link
                href="#about"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                About
              </Link>
              <Link
                href="#contact"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Contact
              </Link>
            </nav>

            <div className="flex items-center space-x-3">
              <ThemeToggle /> {/* Add the ThemeToggle here */}
              <Button variant="outline" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700"
              >
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-red-50" />

        {/* Background image with gradient overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1687757660328-d5b0bf6150e3?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Kenya wristband"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/30 to-red-600/30" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-red-100 text-sm font-medium text-gray-700 mb-6">
              <Award className="h-4 w-4 mr-2" />
              Kenya&apos;s Premier Corporate Merchandise Partner
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Premium Corporate
              <span className="bg-gradient-to-r from-green-600 to-red-600 bg-clip-text text-transparent">
                {" "}
                Merchandise
              </span>
              <br />
              for Your Events
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              From custom lanyards and wristbands to branded diaries and
              corporate gifts. We help Kenyan businesses make lasting
              impressions at every event.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700"
              >
                <Link href="/sign-up">
                  Start Your Order <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#products">View Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Product Range
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              High-quality corporate merchandise designed to elevate your brand
              presence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Custom Lanyards",
                description:
                  "Durable, branded lanyards for events, conferences, and daily use",
                image: "/placeholder.svg?height=200&width=300",
                features: ["Multiple colors", "Logo printing", "Bulk orders"],
              },
              {
                title: "Wristbands",
                description:
                  "Silicone and fabric wristbands for events and promotions",
                image: "/placeholder.svg?height=200&width=300",
                features: ["Waterproof", "Custom text", "Various sizes"],
              },
              {
                title: "Corporate Diaries",
                description:
                  "Professional diaries and notebooks with your company branding",
                image: "/placeholder.svg?height=200&width=300",
                features: ["Premium paper", "Custom covers", "Bulk pricing"],
              },
              {
                title: "Corporate Gifts",
                description:
                  "Branded merchandise including mugs, pens, and tech accessories",
                image: "/placeholder.svg?height=200&width=300",
                features: [
                  "Wide selection",
                  "Quality materials",
                  "Fast delivery",
                ],
              },
            ].map((product, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-green-100 to-red-100 flex items-center justify-center">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <ul className="space-y-1">
                    {product.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center text-sm text-gray-600"
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

      {/* Features Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Redbead?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We understand the Kenyan market and deliver excellence in every
              order
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Local Expertise",
                description:
                  "Deep understanding of Kenyan business culture and requirements",
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Quality Guarantee",
                description:
                  "Premium materials and rigorous quality control on every product",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Bulk Orders",
                description:
                  "Competitive pricing for large corporate orders and events",
              },
              {
                icon: <Phone className="h-8 w-8" />,
                title: "24/7 Support",
                description:
                  "Dedicated customer service team available around the clock",
              },
              {
                icon: <Star className="h-8 w-8" />,
                title: "Custom Design",
                description:
                  "Professional design services to bring your brand vision to life",
              },
              {
                icon: <ArrowRight className="h-8 w-8" />,
                title: "Fast Delivery",
                description:
                  "Quick turnaround times to meet your event deadlines",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="text-center p-6 hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-red-100 text-green-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Elevate Your Brand?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of Kenyan businesses who trust us with their corporate
            merchandise needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/sign-up">
                Create Account <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600 bg-transparent"
              asChild
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card text-card-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-600 to-red-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RB</span>
                </div>
                <span className="text-xl font-bold">Redbead</span>
              </div>
              <p className="text-muted-foreground">
                Kenya&apos;s premier corporate merchandise partner for events
                and branding.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Lanyards
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Wristbands
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Diaries
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Corporate Gifts
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Shipping Info
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Redbead. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
