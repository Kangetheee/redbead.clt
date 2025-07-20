/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Plus, Trash2, Eye, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  useCustomizationOption,
  useCustomizationValues,
  useDeleteCustomizationValue,
} from "@/hooks/use-customization";
import { CustomizationOptionType } from "@/lib/customization/dto/options.dto";
import { ValueFormDialog } from "./ValueFormDialog";

interface OptionDetailPageProps {
  optionId: string;
}

const OPTION_TYPE_LABELS: Record<CustomizationOptionType, string> = {
  DROPDOWN: "Dropdown",
  COLOR_PICKER: "Color Picker",
  TEXT_INPUT: "Text Input",
  FILE_UPLOAD: "File Upload",
  NUMBER_INPUT: "Number Input",
  CHECKBOX: "Checkbox",
  RADIO: "Radio",
};

export default function OptionDetailPage({ optionId }: OptionDetailPageProps) {
  const router = useRouter();
  const [valueDialogOpen, setValueDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<string | null>(null);

  const { data: optionResponse, isLoading: optionLoading } =
    useCustomizationOption(optionId);
  const { data: valuesResponse, isLoading: valuesLoading } =
    useCustomizationValues({
      optionId,
      limit: 100, // Get all values for this option
    });
  const deleteValueMutation = useDeleteCustomizationValue();

  const option = optionResponse?.success ? optionResponse.data : null;
  const values = valuesResponse?.success ? valuesResponse.data.items : [];

  const handleDeleteValue = async (valueId: string, displayName: string) => {
    try {
      const result = await deleteValueMutation.mutateAsync(valueId);
      if (result.success) {
        toast.success(`Value "${displayName}" deleted successfully`);
      } else {
        toast.error(result.error || "Failed to delete value");
      }
    } catch (error) {
      toast.error("Failed to delete value");
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTypeColor = (type: CustomizationOptionType) => {
    const colorMap = {
      DROPDOWN: "bg-blue-100 text-blue-800",
      COLOR_PICKER: "bg-purple-100 text-purple-800",
      TEXT_INPUT: "bg-green-100 text-green-800",
      FILE_UPLOAD: "bg-orange-100 text-orange-800",
      NUMBER_INPUT: "bg-cyan-100 text-cyan-800",
      CHECKBOX: "bg-pink-100 text-pink-800",
      RADIO: "bg-yellow-100 text-yellow-800",
    };
    return colorMap[type] || "bg-gray-100 text-gray-800";
  };

  if (optionLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!option) {
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

  const canHaveValues = ["DROPDOWN", "COLOR_PICKER", "RADIO"].includes(
    option.type
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/customization/options")}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {option.displayName}
          </h1>
          <p className="text-muted-foreground">
            Customization option details and values
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(`/admin/customization/options/${option.id}/edit`)
          }
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Option
        </Button>
      </div>

      {/* Option Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Option Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Internal Name
              </label>
              <p className="font-mono text-sm mt-1">{option.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Display Name
              </label>
              <p className="mt-1">{option.displayName}</p>
            </div>
            {option.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="mt-1 text-sm">{option.description}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Type
              </label>
              <div className="mt-1">
                <Badge className={getTypeColor(option.type)}>
                  {OPTION_TYPE_LABELS[option.type]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Required
              </label>
              <div className="mt-1">
                <Badge variant={option.required ? "default" : "secondary"}>
                  {option.required ? "Required" : "Optional"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Sort Order
              </label>
              <p className="mt-1">{option.sortOrder}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Category ID
              </label>
              <p className="font-mono text-sm mt-1">{option.categoryId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created
              </label>
              <p className="text-sm mt-1">
                {new Date(option.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Values Section */}
      {canHaveValues && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Option Values ({values.length})</CardTitle>
                <CardDescription>
                  Manage the available values for this customization option
                </CardDescription>
              </div>
              <Button onClick={() => setValueDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Value
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {valuesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : values.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No values configured yet
                </p>
                <Button
                  onClick={() => setValueDialogOpen(true)}
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Value
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Value</TableHead>
                      <TableHead>Display Name</TableHead>
                      {option.type === "COLOR_PICKER" && (
                        <TableHead>Color</TableHead>
                      )}
                      <TableHead>Price Adjustment</TableHead>
                      <TableHead>Sort Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {values
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((value) => (
                        <TableRow key={value.id}>
                          <TableCell className="font-mono text-sm">
                            {value.value}
                          </TableCell>
                          <TableCell>{value.displayName}</TableCell>
                          {option.type === "COLOR_PICKER" && (
                            <TableCell>
                              {value.hexColor && (
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded border"
                                    style={{ backgroundColor: value.hexColor }}
                                  />
                                  <span className="font-mono text-sm">
                                    {value.hexColor}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                          )}
                          <TableCell>
                            {value.priceAdjustment > 0 ? (
                              <span className="text-green-600 flex items-center">
                                <DollarSign className="h-3 w-3" />+
                                {formatPrice(value.priceAdjustment)}
                              </span>
                            ) : value.priceAdjustment < 0 ? (
                              <span className="text-red-600 flex items-center">
                                <DollarSign className="h-3 w-3" />
                                {formatPrice(value.priceAdjustment)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                No change
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{value.sortOrder}</TableCell>
                          <TableCell>
                            <Badge
                              variant={value.isActive ? "default" : "secondary"}
                            >
                              {value.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingValue(value.id);
                                  setValueDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Value
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete the value
                                      &quot;{value.displayName}&quot;? This
                                      action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteValue(
                                          value.id,
                                          value.displayName
                                        )
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!canHaveValues && (
        <Card>
          <CardHeader>
            <CardTitle>Option Values</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This option type ({OPTION_TYPE_LABELS[option.type]}) does not use
              predefined values. Values are entered directly by customers.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Value Form Dialog */}
      <ValueFormDialog
        open={valueDialogOpen}
        onOpenChange={(open) => {
          setValueDialogOpen(open);
          if (!open) {
            setEditingValue(null);
          }
        }}
        optionId={option.id}
        optionType={option.type}
        valueId={editingValue}
      />
    </div>
  );
}
