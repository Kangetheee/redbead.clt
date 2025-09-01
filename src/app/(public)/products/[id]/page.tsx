import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductAction } from "@/lib/products/products.actions";
import { ProductDetailsClient } from "./product-details-client";

interface ProductDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getProductAction(id);

  if (!result.success || !result.data) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const product = result.data;

  const ogImages = product.thumbnailImage
    ? [{ url: product.thumbnailImage.src, alt: product.thumbnailImage.name }]
    : product.images.map((img) => ({
        url: img.src,
        alt: img.name,
      }));

  return {
    title: product.metadata?.metaTitle || `${product.name} | Custom Products`,
    description: product.metadata?.metaDescription || product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: ogImages,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: ogImages,
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params;

  const result = await getProductAction(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <>
      <ProductDetailsClient product={result.data} />
    </>
  );
}
