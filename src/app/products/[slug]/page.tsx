import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlugAction } from "@/lib/products/products.actions";
import { ProductDetailsView } from "@/components/products/product-details-view";

interface ProductDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductBySlugAction(slug);

  if (!result.success || !result.data) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const product = result.data;

  return {
    title: product.metadata?.metaTitle || `${product.name} | Custom Products`,
    description: product.metadata?.metaDescription || product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.thumbnailImage
        ? [product.thumbnailImage]
        : product.images,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: product.thumbnailImage
        ? [product.thumbnailImage]
        : product.images,
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { slug } = await params;

  const result = await getProductBySlugAction(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  return <ProductDetailsView product={result.data} />;
}
