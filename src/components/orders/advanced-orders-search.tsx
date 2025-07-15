/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  Filter,
  X,
  Plus,
  Calendar,
  DollarSign,
  Package,
  User,
  MapPin,
  Clock,
  Tag,
  SlidersHorizontal,
  Save,
  Trash2,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

import { GetOrdersDto, getOrdersSchema } from "@/lib/orders/dto/orders.dto";

// Define the exact types from the schema
type OrderStatus =
  | "PENDING"
  | "DESIGN_PENDING"
  | "DESIGN_APPROVED"
  | "DESIGN_REJECTED"
  | "PAYMENT_PENDING"
  | "PAYMENT_CONFIRMED"
  | "PROCESSING"
  | "PRODUCTION"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

type UrgencyLevel = "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY";

type DesignApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

// Create the extended schema for the form
const extendedSearchSchema = z.object({
  // Base fields from GetOrdersDto
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  status: z
    .enum([
      "PENDING",
      "DESIGN_PENDING",
      "DESIGN_APPROVED",
      "DESIGN_REJECTED",
      "PAYMENT_PENDING",
      "PAYMENT_CONFIRMED",
      "PROCESSING",
      "PRODUCTION",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ])
    .optional(),
  designApprovalStatus: z
    .enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED", "CANCELLED"])
    .optional(),
  minTotal: z.number().optional(),
  maxTotal: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  urgencyLevel: z.enum(["NORMAL", "EXPEDITED", "RUSH", "EMERGENCY"]).optional(),

  // Extended fields for the form
  statusList: z
    .array(
      z.enum([
        "PENDING",
        "DESIGN_PENDING",
        "DESIGN_APPROVED",
        "DESIGN_REJECTED",
        "PAYMENT_PENDING",
        "PAYMENT_CONFIRMED",
        "PROCESSING",
        "PRODUCTION",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
      ])
    )
    .optional(),
  urgencyLevelList: z
    .array(z.enum(["NORMAL", "EXPEDITED", "RUSH", "EMERGENCY"]))
    .optional(),
  designApprovalStatusList: z
    .array(z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED", "CANCELLED"]))
    .optional(),
  paymentMethodList: z.array(z.string()).optional(),
  customerSearch: z.string().optional(),
  productSearch: z.string().optional(),
  orderNumber: z.string().optional(),
  trackingNumber: z.string().optional(),
  shippingCountry: z.string().optional(),
  hasNotes: z.boolean().optional(),
  hasDesignApproval: z.boolean().optional(),
});

// Search form values type
type SearchFormValues = z.infer<typeof extendedSearchSchema>;

interface SavedFilter {
  id: string;
  name: string;
  filters: Partial<SearchFormValues>;
  isDefault?: boolean;
}

interface AdvancedOrderSearchProps {
  onFiltersChange: (filters: GetOrdersDto) => void;
  initialFilters?: Partial<GetOrdersDto>;
}

const ORDER_STATUSES: Array<{ value: OrderStatus; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "DESIGN_PENDING", label: "Design Pending" },
  { value: "DESIGN_APPROVED", label: "Design Approved" },
  { value: "DESIGN_REJECTED", label: "Design Rejected" },
  { value: "PAYMENT_PENDING", label: "Payment Pending" },
  { value: "PAYMENT_CONFIRMED", label: "Payment Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PRODUCTION", label: "In Production" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

const URGENCY_LEVELS: Array<{ value: UrgencyLevel; label: string }> = [
  { value: "NORMAL", label: "Normal" },
  { value: "EXPEDITED", label: "Expedited" },
  { value: "RUSH", label: "Rush" },
  { value: "EMERGENCY", label: "Emergency" },
];

const DESIGN_APPROVAL_STATUSES: Array<{
  value: DesignApprovalStatus;
  label: string;
}> = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CANCELLED", label: "Cancelled" },
];

const COUNTRIES = [
  { value: "KE", label: "Kenya" },
  { value: "UG", label: "Uganda" },
  { value: "TZ", label: "Tanzania" },
  { value: "RW", label: "Rwanda" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
] as const;

// Mock saved filters
const MOCK_SAVED_FILTERS: SavedFilter[] = [
  {
    id: "1",
    name: "Pending Orders",
    filters: { statusList: ["PENDING", "DESIGN_PENDING"] },
    isDefault: true,
  },
  {
    id: "2",
    name: "High Value Orders",
    filters: { minTotal: 500 },
  },
  {
    id: "3",
    name: "Rush Orders",
    filters: { urgencyLevelList: ["RUSH", "EMERGENCY"] },
  },
];

export default function AdvancedOrderSearch({
  onFiltersChange,
  initialFilters = {},
}: AdvancedOrderSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedFilters, setSavedFilters] =
    useState<SavedFilter[]>(MOCK_SAVED_FILTERS);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(extendedSearchSchema),
    defaultValues: {
      search: initialFilters.search || "",
      statusList: [],
      urgencyLevelList: [],
      designApprovalStatusList: [],
      paymentMethodList: [],
      hasNotes: false,
      hasDesignApproval: false,
      page: 1,
      limit: 20,
    },
  });

  const watchedValues = watch();

  // Update active filter count
  useEffect(() => {
    const count = Object.entries(watchedValues).reduce((acc, [key, value]) => {
      if (key === "search" && value) return acc + 1;
      if (Array.isArray(value) && value.length > 0) return acc + 1;
      if (typeof value === "boolean" && value) return acc + 1;
      if (typeof value === "number" && value > 0) return acc + 1;
      if (typeof value === "string" && value && key !== "search")
        return acc + 1;
      return acc;
    }, 0);

    setActiveFilterCount(count);
  }, [watchedValues]);

  // Transform form data to GetOrdersDto
  const transformToDto = (data: SearchFormValues): GetOrdersDto => {
    return {
      search: data.search || undefined,
      status: data.statusList?.length ? data.statusList[0] : undefined,
      urgencyLevel: data.urgencyLevelList?.length
        ? data.urgencyLevelList[0]
        : undefined,
      designApprovalStatus: data.designApprovalStatusList?.length
        ? data.designApprovalStatusList[0]
        : undefined,
      minTotal: data.minTotal || undefined,
      maxTotal: data.maxTotal || undefined,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      page: data.page || 1,
      limit: data.limit || 20,
    };
  };

  // Apply filters
  const onSubmit = (data: SearchFormValues) => {
    const filters = transformToDto(data);
    onFiltersChange(filters);
  };

  // Clear all filters
  const clearFilters = () => {
    reset({
      page: 1,
      limit: 20,
      statusList: [],
      urgencyLevelList: [],
      designApprovalStatusList: [],
      paymentMethodList: [],
      hasNotes: false,
      hasDesignApproval: false,
    });
    onFiltersChange({ page: 1, limit: 20 });
  };

  // Apply saved filter
  const applySavedFilter = (filter: SavedFilter) => {
    reset(filter.filters);
    const transformedFilters = transformToDto(
      filter.filters as SearchFormValues
    );
    onFiltersChange(transformedFilters);
  };

  // Save current filter
  const saveCurrentFilter = () => {
    if (!filterName.trim()) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      filters: watchedValues,
    };

    setSavedFilters([...savedFilters, newFilter]);
    setFilterName("");
    setIsSaveDialogOpen(false);
  };

  // Delete saved filter
  const deleteSavedFilter = (filterId: string) => {
    setSavedFilters(savedFilters.filter((f) => f.id !== filterId));
  };

  // Quick search presets
  const quickSearches = [
    {
      label: "Today's Orders",
      action: () => {
        const today = new Date().toISOString().split("T")[0];
        setValue("startDate", today);
        setValue("endDate", today);
      },
    },
    {
      label: "This Week",
      action: () => {
        const today = new Date();
        const weekStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - today.getDay()
        );
        setValue("startDate", weekStart.toISOString().split("T")[0]);
        setValue("endDate", today.toISOString().split("T")[0]);
      },
    },
    {
      label: "High Value (>$200)",
      action: () => {
        setValue("minTotal", 200);
      },
    },
    {
      label: "Pending Payment",
      action: () => {
        setValue("statusList", ["PAYMENT_PENDING"]);
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Advanced Search
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount} active</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Search and filter orders with advanced criteria
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              {isExpanded ? "Simple" : "Advanced"}
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  {...register("search")}
                  placeholder="Order number, customer, product..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                {...register("orderNumber")}
                placeholder="e.g., ORD-12345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input
                id="trackingNumber"
                {...register("trackingNumber")}
                placeholder="Enter tracking number"
              />
            </div>
          </div>

          {/* Quick Search Buttons */}
          <div className="flex flex-wrap gap-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Quick filters:
            </Label>
            {quickSearches.map((quick, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={quick.action}
              >
                {quick.label}
              </Button>
            ))}
          </div>

          {/* Advanced Filters */}
          {isExpanded && (
            <div className="space-y-6 border-t pt-6">
              {/* Status and Urgency */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Status
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {ORDER_STATUSES.map((status) => (
                      <div
                        key={status.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`status-${status.value}`}
                          checked={watchedValues.statusList?.includes(
                            status.value
                          )}
                          onCheckedChange={(checked) => {
                            const current = watchedValues.statusList || [];
                            if (checked) {
                              setValue("statusList", [
                                ...current,
                                status.value,
                              ]);
                            } else {
                              setValue(
                                "statusList",
                                current.filter((s) => s !== status.value)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`status-${status.value}`}
                          className="text-sm"
                        >
                          {status.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Urgency Level
                  </Label>
                  <div className="space-y-2">
                    {URGENCY_LEVELS.map((urgency) => (
                      <div
                        key={urgency.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`urgency-${urgency.value}`}
                          checked={watchedValues.urgencyLevelList?.includes(
                            urgency.value
                          )}
                          onCheckedChange={(checked) => {
                            const current =
                              watchedValues.urgencyLevelList || [];
                            if (checked) {
                              setValue("urgencyLevelList", [
                                ...current,
                                urgency.value,
                              ]);
                            } else {
                              setValue(
                                "urgencyLevelList",
                                current.filter((u) => u !== urgency.value)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`urgency-${urgency.value}`}
                          className="text-sm"
                        >
                          {urgency.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Design Approval
                  </Label>
                  <div className="space-y-2">
                    {DESIGN_APPROVAL_STATUSES.map((status) => (
                      <div
                        key={status.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`design-${status.value}`}
                          checked={watchedValues.designApprovalStatusList?.includes(
                            status.value
                          )}
                          onCheckedChange={(checked) => {
                            const current =
                              watchedValues.designApprovalStatusList || [];
                            if (checked) {
                              setValue("designApprovalStatusList", [
                                ...current,
                                status.value,
                              ]);
                            } else {
                              setValue(
                                "designApprovalStatusList",
                                current.filter((s) => s !== status.value)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`design-${status.value}`}
                          className="text-sm"
                        >
                          {status.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Amount and Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Order Amount
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Min Amount
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register("minTotal", { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Max Amount
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register("maxTotal", { valueAsNumber: true })}
                        placeholder="1000.00"
                      />
                    </div>
                  </div>

                  {/* Price Range Slider */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Quick Range: ${priceRange[0]} - ${priceRange[1]}
                    </Label>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => {
                        setPriceRange(value as [number, number]);
                        setValue("minTotal", value[0]);
                        setValue("maxTotal", value[1]);
                      }}
                      max={1000}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Start Date
                      </Label>
                      <Input type="date" {...register("startDate")} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        End Date
                      </Label>
                      <Input type="date" {...register("endDate")} />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Additional Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="shippingCountry">Shipping Country</Label>
                  <Select
                    value={watchedValues.shippingCountry || ""}
                    onValueChange={(value) =>
                      setValue("shippingCountry", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any country</SelectItem>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Additional Criteria</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hasNotes" className="text-sm">
                        Has Notes
                      </Label>
                      <Switch
                        id="hasNotes"
                        checked={watchedValues.hasNotes}
                        onCheckedChange={(checked) =>
                          setValue("hasNotes", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hasDesignApproval" className="text-sm">
                        Design Approval Required
                      </Label>
                      <Switch
                        id="hasDesignApproval"
                        checked={watchedValues.hasDesignApproval}
                        onCheckedChange={(checked) =>
                          setValue("hasDesignApproval", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Customer and Product Search */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="customerSearch"
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Customer Search
                  </Label>
                  <Input
                    id="customerSearch"
                    {...register("customerSearch")}
                    placeholder="Customer name, email, or phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="productSearch"
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Product Search
                  </Label>
                  <Input
                    id="productSearch"
                    {...register("productSearch")}
                    placeholder="Product name or SKU"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search Orders
              </Button>

              <Dialog
                open={isSaveDialogOpen}
                onOpenChange={setIsSaveDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Save Filter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Search Filter</DialogTitle>
                    <DialogDescription>
                      Save your current search criteria for quick access later
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="filterName">Filter Name</Label>
                      <Input
                        id="filterName"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        placeholder="e.g., High Priority Orders"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsSaveDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveCurrentFilter}
                      disabled={!filterName.trim()}
                    >
                      Save Filter
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4 mr-1" />
                    Saved Filters ({savedFilters.length})
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">Saved Search Filters</h4>
                    <div className="space-y-2">
                      {savedFilters.map((filter) => (
                        <div
                          key={filter.id}
                          className="flex items-center justify-between p-2 border rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium">{filter.name}</p>
                            {filter.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => applySavedFilter(filter)}
                            >
                              Apply
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteSavedFilter(filter.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
