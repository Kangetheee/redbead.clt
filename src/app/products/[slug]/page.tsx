import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductTypeBySlugAction } from "@/lib/products/products.actions";
import { ProductDetailsView } from "@/components/products/product-details-view";

interface ProductDetailsPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const result = await getProductTypeBySlugAction(params.slug);

  if (!result.success || !result.data) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const product = result.data;

  return {
    title: product.metaTitle || `${product.name} | Custom Products`,
    description: product.metaDescription || product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.thumbnailImage ? [product.thumbnailImage] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: product.thumbnailImage ? [product.thumbnailImage] : undefined,
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const result = await getProductTypeBySlugAction(params.slug);

  if (!result.success || !result.data) {
    notFound();
  }

  return <ProductDetailsView product={result.data} />;
}
