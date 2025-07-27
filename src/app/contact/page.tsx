/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  ShoppingCart,
  Menu,
  X,
  MessageSquare,
  Headphones,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

type ContactPreference = "CALL" | "EMAIL" | "SMS";

interface EnquiryForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  contactPreference: ContactPreference;
  insuranceType: string;
}

export default function ContactPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<EnquiryForm>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    contactPreference: "EMAIL",
    insuranceType: "",
  });

  // FAQ data with duplicates for infinite scroll
  const faqData = [
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

  // Duplicate FAQ data for seamless infinite scroll
  const duplicatedFaqs = [...faqData, ...faqData, ...faqData];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/v1/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          contactPreference: "EMAIL",
          insuranceType: "",
        });
      } else {
        throw new Error("Failed to submit enquiry");
      }
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof EnquiryForm,
    value: string | ContactPreference
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-green-600 font-medium transition-colors"
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
                  className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-green-600 font-medium transition-colors px-2 py-1"
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

      {/* Contact Information & Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Address
                    </h3>
                    <p className="text-gray-600">
                      123 Business Park Road
                      <br />
                      Westlands, Nairobi
                      <br />
                      Kenya
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600">
                      +254 700 123 456
                      <br />
                      +254 20 123 4567
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">
                      hello@redbead.co.ke
                      <br />
                      quotes@redbead.co.ke
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Business Hours
                    </h3>
                    <p className="text-gray-600">
                      Mon - Fri: 8:00 AM - 6:00 PM
                      <br />
                      Sat: 9:00 AM - 4:00 PM
                      <br />
                      Sun: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Contact Cards */}
              <div className="mt-8 space-y-4">
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center space-x-3">
                    <Headphones className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">24/7 Support</p>
                      <p className="text-sm text-gray-600">
                        We&apos;re always here to help
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Quick Response
                      </p>
                      <p className="text-sm text-gray-600">
                        Usually reply within 2 hours
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Send Us a Message
                  </CardTitle>
                  <p className="text-gray-600">
                    Fill out the form below and we&apos;ll get back to you as
                    soon as possible.
                  </p>
                </CardHeader>

                <CardContent className="px-0 pb-0">
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Thank You!
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Thanks for contacting us. We will get back to you
                        shortly.
                      </p>
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        variant="outline"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Your full name"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+254 700 123 456"
                            value={formData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contactPreference">
                            Preferred Contact Method
                          </Label>
                          <Select
                            value={formData.contactPreference}
                            onValueChange={(value: ContactPreference) =>
                              handleInputChange("contactPreference", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EMAIL">Email</SelectItem>
                              <SelectItem value="CALL">Phone Call</SelectItem>
                              <SelectItem value="SMS">SMS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            id="subject"
                            type="text"
                            placeholder="What can we help you with?"
                            value={formData.subject}
                            onChange={(e) =>
                              handleInputChange("subject", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="insuranceType">Service Type</Label>
                          <Select
                            value={formData.insuranceType}
                            onValueChange={(value) =>
                              handleInputChange("insuranceType", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lanyards">
                                Custom Lanyards
                              </SelectItem>
                              <SelectItem value="wristbands">
                                Wristbands
                              </SelectItem>
                              <SelectItem value="badges">ID Badges</SelectItem>
                              <SelectItem value="keychains">
                                Keychains
                              </SelectItem>
                              <SelectItem value="stickers">
                                Stickers & Labels
                              </SelectItem>
                              <SelectItem value="apparel">
                                Custom Apparel
                              </SelectItem>
                              <SelectItem value="bulk">Bulk Orders</SelectItem>
                              <SelectItem value="design">
                                Design Services
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us more about your project requirements, quantities, timeline, etc."
                          rows={6}
                          value={formData.message}
                          onChange={(e) =>
                            handleInputChange("message", e.target.value)
                          }
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Sending..."
                        ) : (
                          <>
                            Send Message <Send className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section with Infinite Scroll */}
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

          {/* Infinite Scroll Container */}
          <div className="relative overflow-hidden">
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
            {faqData.map((faq, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Google Map Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Visit Our Office
            </h2>
            <p className="text-lg text-gray-600">
              Located in the heart of Westlands, Nairobi
            </p>
          </div>

          <div className="rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8199421324405!2d36.81006881475394!3d-1.2920659990588744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0x82001c23e7c43c4d!2sWestlands%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1690123456789!5m2!1sen!2ske"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Red Bead Office Location - Westlands, Nairobi"
            />
          </div>

          {/* Location Details Card */}
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Our Address
                    </h3>
                    <p className="text-gray-600">
                      123 Business Park Road
                      <br />
                      Westlands, Nairobi
                      <br />
                      Kenya
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Directions
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Easy access from Waiyaki Way and Ring Road. Parking
                      available on-site.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://www.google.com/maps/dir//Westlands,+Nairobi/@-1.2920659,36.8100688,17z"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Get Directions
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
