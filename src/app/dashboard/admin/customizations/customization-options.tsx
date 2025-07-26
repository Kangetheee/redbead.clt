/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  useCustomizationOptions,
  useDeleteCustomizationOption,
} from "@/hooks/use-customization";
import {
  GetCustomizationOptionsDto,
  CustomizationOptionType,
} from "@/lib/customization/dto/options.dto";

const OPTION_TYPES: { value: CustomizationOptionType; label: string }[] = [
  { value: "DROPDOWN", label: "Dropdown" },
  { value: "COLOR_PICKER", label: "Color Picker" },
  { value: "TEXT_INPUT", label: "Text Input" },
  { value: "FILE_UPLOAD", label: "File Upload" },
  { value: "NUMBER_INPUT", label: "Number Input" },
  { value: "CHECKBOX", label: "Checkbox" },
  { value: "RADIO", label: "Radio" },
];

export default function CustomizationOptionsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<
    CustomizationOptionType | ""
  >("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryParams: GetCustomizationOptionsDto = {
    page,
    limit,
    ...(searchQuery && { search: searchQuery }),
    ...(selectedType && { type: selectedType }),
  };

  const {
    data: optionsResponse,
    isLoading,
    error,
  } = useCustomizationOptions(queryParams);
  const deleteOptionMutation = useDeleteCustomizationOption();

  const options = optionsResponse?.success ? optionsResponse.data.items : [];
  const pagination = optionsResponse?.success
    ? optionsResponse.data.meta
    : null;

  const handleDeleteOption = async (optionId: string, optionName: string) => {
    try {
      const result = await deleteOptionMutation.mutateAsync(optionId);
      if (result.success) {
        toast.success(`Option "${optionName}" deleted successfully`);
      } else {
        toast.error(result.error || "Failed to delete option");
      }
    } catch (error) {
      toast.error("Failed to delete option");
    }
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

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Error loading customization options</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Customization Options
          </h1>
          <p className="text-muted-foreground">
            Manage product customization options and their values
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/customization/options/create")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Option
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter and search customization options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedType}
              onValueChange={(value) =>
                setSelectedType(value as CustomizationOptionType | "")
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {OPTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Options Table */}
      <Card>
        <CardHeader>
          <CardTitle>Options ({pagination?.totalPages || 0})</CardTitle>
          <CardDescription>
            {pagination &&
              `Showing ${(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-${Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalPages)} of ${pagination.totalPages} options`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : options.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No customization options found
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  router.push("/admin/customization/options/create")
                }
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Option
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {options.map((option) => (
                    <TableRow key={option.id}>
                      <TableCell className="font-medium">
                        {option.name}
                      </TableCell>
                      <TableCell>{option.displayName}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(option.type)}>
                          {OPTION_TYPES.find((t) => t.value === option.type)
                            ?.label || option.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={option.required ? "default" : "secondary"}
                        >
                          {option.required ? "Required" : "Optional"}
                        </Badge>
                      </TableCell>
                      <TableCell>{option.sortOrder}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {option.categoryId}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/admin/customization/options/${option.id}`
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/admin/customization/options/${option.id}/edit`
                              )
                            }
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
                                  Delete Option
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;
                                  {option.displayName}&quot;? This action cannot
                                  be undone and will also delete all associated
                                  values.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteOption(
                                      option.id,
                                      option.displayName
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

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
