"use client";

import { useParams } from "next/navigation";
import OptionForm from "../../option-form";
import { useCustomizationOption } from "@/hooks/use-customization";
import { Card, CardContent } from "@/components/ui/card";

export default function EditOptionPage() {
  const params = useParams();
  const optionId = params.optionId as string;

  const {
    data: optionResponse,
    isLoading,
    error,
  } = useCustomizationOption(optionId);
  const option = optionResponse?.success ? optionResponse.data : null;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !option) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Option not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <OptionForm mode="edit" option={option} />;
}
