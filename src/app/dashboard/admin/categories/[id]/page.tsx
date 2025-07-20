"use client";

import { useParams } from "next/navigation";
import CategoryDetailPage from "../category-details";

export default function CategoryDetailPageWrapper() {
  const params = useParams();
  const categoryId = params.id as string;

  return <CategoryDetailPage categoryId={categoryId} />;
}
