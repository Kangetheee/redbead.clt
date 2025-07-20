/* eslint-disable @typescript-eslint/no-unused-vars */
import { Metadata } from "next";
import { CategoryBrowsePage } from "./category-browse-page";

interface PageProps {
  params: Promise<{
    categorySlug: string;
  }>;
  searchParams: Promise<{
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    featured?: string;
    sortBy?: string;
    sortDirection?: string;
    page?: string;
  }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  return <CategoryBrowsePage />;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;

  // Format the slug for display
  const categoryName = categorySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${categoryName} Products - Design Studio`,
    description: `Browse and customize ${categoryName.toLowerCase()} products. Find the perfect design for your needs with our professional printing services.`,
    keywords: `${categoryName.toLowerCase()}, printing, design, custom products`,
    openGraph: {
      title: `${categoryName} Products`,
      description: `Discover professional ${categoryName.toLowerCase()} designs and start customizing today.`,
      type: "website",
    },
  };
}

// Generate static params for better performance (optional)
export async function generateStaticParams() {
  return [];
}
