/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  createCustomizationOptionSchema,
  updateCustomizationOptionSchema,
  CreateCustomizationOptionDto,
  UpdateCustomizationOptionDto,
  CustomizationOptionType,
} from "@/lib/customization/dto/options.dto";
import {
  useCreateCustomizationOption,
  useUpdateCustomizationOption,
} from "@/hooks/use-customization";
import { useCategories } from "@/hooks/use-categories";
import { CustomizationOptionDetail } from "@/lib/customization/types/options.types";

const OPTION_TYPES: {
  value: CustomizationOptionType;
  label: string;
  description: string;
}[] = [
  {
    value: "DROPDOWN",
    label: "Dropdown",
    description: "Single selection from predefined options",
  },
  {
    value: "COLOR_PICKER",
    label: "Color Picker",
    description: "Color selection with hex values",
  },
  {
    value: "TEXT_INPUT",
    label: "Text Input",
    description: "Free text input field",
  },
  {
    value: "FILE_UPLOAD",
    label: "File Upload",
    description: "File upload for custom designs/images",
  },
  {
    value: "NUMBER_INPUT",
    label: "Number Input",
    description: "Numeric input with validation",
  },
  {
    value: "CHECKBOX",
    label: "Checkbox",
    description: "Boolean toggle option",
  },
  {
    value: "RADIO",
    label: "Radio",
    description: "Single selection from radio buttons",
  },
];

interface OptionFormProps {
  option?: CustomizationOptionDetail;
  mode: "create" | "edit";
}

export default function OptionForm({ option, mode }: OptionFormProps) {
  const router = useRouter();
  const createMutation = useCreateCustomizationOption();
  const updateMutation = useUpdateCustomizationOption();
  const { data: categoriesResponse } = useCategories();

  const categories = categoriesResponse?.items || [];
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const schema =
    mode === "create"
      ? createCustomizationOptionSchema
      : updateCustomizationOptionSchema;

  const form = useForm<
    CreateCustomizationOptionDto | UpdateCustomizationOptionDto
  >({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "edit" && option
        ? {
            name: option.name,
            displayName: option.displayName,
            description: option.description || "",
            type: option.type,
            required: option.required,
            sortOrder: option.sortOrder,
            categoryId: option.categoryId,
          }
        : {
            name: "",
            displayName: "",
            description: "",
            type: "DROPDOWN" as CustomizationOptionType,
            required: false,
            sortOrder: 0,
            categoryId: "",
          },
  });

  const onSubmit = async (
    values: CreateCustomizationOptionDto | UpdateCustomizationOptionDto
  ) => {
    try {
      if (mode === "create") {
        const result = await createMutation.mutateAsync(
          values as CreateCustomizationOptionDto
        );
        if (result.success) {
          toast.success("Option created successfully");
          router.push(`/admin/customization/options/${result.data.id}`);
        } else {
          toast.error(result.error || "Failed to create option");
        }
      } else if (mode === "edit" && option) {
        const result = await updateMutation.mutateAsync({
          optionId: option.id,
          data: values as UpdateCustomizationOptionDto,
        });
        if (result.success) {
          toast.success("Option updated successfully");
          router.push(`/admin/customization/options/${option.id}`);
        } else {
          toast.error(result.error || "Failed to update option");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  // Generate slug from name
  const handleNameChange = (name: string) => {
    form.setValue("name", name);
    // Auto-generate display name if it's empty
    if (!form.getValues("displayName")) {
      const displayName = name
        .split(/[-_]/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
      form.setValue("displayName", displayName);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === "create" ? "Create" : "Edit"} Customization Option
          </h1>
          <p className="text-muted-foreground">
            {mode === "create"
              ? "Add a new customization option for products"
              : `Editing "${option?.displayName}"`}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Configure the basic details of the customization option
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="color-selection"
                          {...field}
                          onChange={(e) => handleNameChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Used internally. Use lowercase letters, numbers, and
                        hyphens only.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Color Selection" {...field} />
                      </FormControl>
                      <FormDescription>Name shown to customers</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Choose your preferred color option..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description to help customers understand this
                      option
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The category this option belongs to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Set up how this option behaves and appears
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {OPTION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {type.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Determines how customers interact with this option
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Required Option
                        </FormLabel>
                        <FormDescription>
                          Customers must select this option
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Lower numbers appear first
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {mode === "create" ? "Create Option" : "Update Option"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
