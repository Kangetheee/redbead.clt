"use client";

import { useParams } from "next/navigation";
import CategoryForm from "../../category-form";
import { useCategory } from "@/hooks/use-categories";
import { Card, CardContent } from "@/components/ui/card";

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;

  const { data: category, isLoading, error } = useCategory(categoryId);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Category not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <CategoryForm mode="edit" category={category} />;
}
