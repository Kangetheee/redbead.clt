"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
} from "lucide-react";
import { useFeaturedProducts } from "@/hooks/use-products";
import { ProductResponse } from "@/lib/products/types/products.types";

// Component for rendering dynamic product links
function ProductLinks() {
  const { data: featuredProducts, isLoading, error } = useFeaturedProducts(5);

  const staticLinks = [
    { name: "Business Cards", id: "business-cards" },
    { name: "Name Badges", id: "name-badges" },
    { name: "Banners & Signs", id: "banners" },
    { name: "Brochures", id: "brochures" },
    { name: "Custom Stickers", id: "stickers" },
  ];

  const productLinks =
    isLoading || error || !featuredProducts
      ? staticLinks
      : featuredProducts.map((product: ProductResponse) => ({
          name: product.name,
          id: product.id,
        }));

  return (
    <ul className="space-y-3">
      {productLinks.slice(0, 5).map((product) => (
        <li key={product.id}>
          <Link
            href={`/products/${product.id}`}
            className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
          >
            {product.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-foreground">
                Red Bead
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Kenya&apos;s trusted design and printing partner, creating
                custom solutions for businesses and individuals with
                award-winning service since 2020.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-muted-foreground">+254 700 040 400</span>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-muted-foreground">
                  info@redbead.co.ke
                </span>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">123 Main, Nairobi</span>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <Clock className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Mon-Fri: 8AM-5PM, Sat: 9AM-2PM
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Design Products */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-foreground">
              Design Products
            </h4>
            <ProductLinks />
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-foreground">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/templates"
                  className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  Design Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-foreground">
              Legal
            </h4>
            <ul className="space-y-3 mb-6">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/refund-policy"
                  className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-policy"
                  className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  Shipping Policy
                </Link>
              </li> */}
            </ul>

            {/* Social Links */}
            <div>
              <h5 className="text-sm font-medium mb-3 text-foreground">
                Follow us:
              </h5>
              <div className="flex space-x-3">
                <Link
                  href="#"
                  className="w-8 h-8 bg-muted hover:bg-green-600 dark:hover:bg-green-600 hover:text-white rounded-full flex items-center justify-center transition-colors text-muted-foreground hover:text-white"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </Link>
                <Link
                  href="#"
                  className="w-8 h-8 bg-muted hover:bg-green-600 dark:hover:bg-green-600 hover:text-white rounded-full flex items-center justify-center transition-colors text-muted-foreground hover:text-white"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </Link>
                <Link
                  href="#"
                  className="w-8 h-8 bg-muted hover:bg-green-600 dark:hover:bg-green-600 hover:text-white rounded-full flex items-center justify-center transition-colors text-muted-foreground hover:text-white"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </Link>
                <Link
                  href="#"
                  className="w-8 h-8 bg-muted hover:bg-green-600 dark:hover:bg-green-600 hover:text-white rounded-full flex items-center justify-center transition-colors text-muted-foreground hover:text-white"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </Link>
                <Link
                  href="#"
                  className="w-8 h-8 bg-muted hover:bg-green-600 dark:hover:bg-green-600 hover:text-white rounded-full flex items-center justify-center transition-colors text-muted-foreground hover:text-white"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Red Bead. All rights reserved.
            </div>

            <div className="text-sm text-muted-foreground">
              Licensed by Communications Authority of Kenya
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
