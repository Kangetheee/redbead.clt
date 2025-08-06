import CategoryBrowsePage from "./category-browse-page";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <CategoryBrowsePage
      slug={resolvedParams.slug}
      searchParams={resolvedSearchParams}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Category: ${resolvedParams.slug}`,
  };
}
