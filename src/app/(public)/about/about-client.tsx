"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Award,
  Target,
  Heart,
  CheckCircle,
  MapPin,
} from "lucide-react";
import Link from "next/link";

export default function AboutClient() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-background to-red-50 dark:from-green-950/30 dark:via-background dark:to-red-950/30 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800">
              🇰🇪 Proudly Kenyan Since 2019
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              About Red Bead
              <span className="block text-green-600">Our Story & Mission</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
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
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Our Journey
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Founded in 2019, Red Bead started as a small printing shop in
                  Nairobi with a simple mission: to provide high-quality custom
                  print solutions that help Kenyan businesses make lasting
                  impressions.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  What began as a two-person operation has grown into
                  Kenya&apos;s leading custom print solutions provider, serving
                  over 500 businesses across East Africa. Our commitment to
                  quality, innovation, and customer satisfaction has remained
                  unchanged.
                </p>
                <p className="text-lg text-muted-foreground">
                  Today, we&apos;re proud to be the trusted partner for
                  companies ranging from startups to multinational corporations,
                  helping them showcase their brands through premium custom
                  products.
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-red-100 dark:from-green-900/20 dark:to-red-900/20 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      2019
                    </div>
                    <div className="text-sm text-muted-foreground">Founded</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      500+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Happy Clients
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      50K+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Products Delivered
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      24/7
                    </div>
                    <div className="text-sm text-muted-foreground">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Values */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Mission, Vision & Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do at Red Bead
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <Target className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Our Mission
                </h3>
                <p className="text-muted-foreground">
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
                <h3 className="text-xl font-semibold text-foreground">
                  Our Vision
                </h3>
                <p className="text-muted-foreground">
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
                <h3 className="text-xl font-semibold text-foreground">
                  Our Values
                </h3>
                <p className="text-muted-foreground">
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
              <h2 className="text-3xl font-bold text-foreground mb-4">
                What Sets Us Apart
              </h2>
              <p className="text-lg text-muted-foreground">
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
                  className="flex items-start space-x-4 p-6 bg-card rounded-lg border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground">
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
                    <h3 className="text-xl font-semibold text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-green-600 font-medium">{member.role}</p>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {member.description}
                  </p>
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
