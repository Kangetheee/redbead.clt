/* eslint-disable @typescript-eslint/no-unused-vars */
import { Metadata } from "next";
import { ProductDetailPage } from "./product-detail-page";

interface PageProps {
  params: Promise<{
    productSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  return <ProductDetailPage />;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}): Promise<Metadata> {
  // ✅ Await the params
  const { productSlug } = await params;

  // Format the slug for display
  const productName = productSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${productName} - Product Details`,
    description: `View specifications, pricing, and customization options for ${productName}. Start designing or add to cart.`,
    keywords: `${productName.toLowerCase()}, printing, design, custom products, specifications`,
    openGraph: {
      title: `${productName} - Product Details`,
      description: `Customize and order ${productName.toLowerCase()} with professional printing services.`,
      type: "website",
    },
  };
}
