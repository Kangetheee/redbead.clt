/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddressResponse,
  AddressType,
} from "@/lib/address/types/address.types";
import {
  useAddresses,
  useDefaultAddress,
  useSetDefaultAddress,
  useDeleteAddress,
} from "@/hooks/use-address";
import {
  createAddressSchema,
  updateAddressSchema,
} from "@/lib/address/dto/address.dto";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  MapPin,
  Plus,
  Star,
  Building,
  Phone,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Navigation,
  Home,
  Briefcase,
  Users,
  RefreshCw,
  MoreVertical,
  MapIcon,
  Globe,
  Heart,
  X,
  StarOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { z } from "zod";

interface AddressSelectorProps {
  selectedAddressId: string;
  onAddressSelect: (addressId: string) => void;
  addressType: AddressType;
  sessionId?: string;
  disabled?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowSetDefault?: boolean;
  maxHeight?: string;
  className?: string;
  showAddressForm?: boolean;
  onAddressCreate?: (address: AddressResponse) => void;
}

type AddressCategory = "ALL" | "HOME" | "WORK" | "OTHER";

const ADDRESS_CATEGORY_CONFIG = {
  ALL: {
    icon: MapPin,
    label: "All Addresses",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
  HOME: {
    icon: Home,
    label: "Home",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  WORK: {
    icon: Briefcase,
    label: "Work",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  OTHER: {
    icon: Users,
    label: "Other",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
};

const COUNTRIES = [
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "UG", name: "Uganda", flag: "🇺🇬" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
];

export function AddressSelector({
  selectedAddressId,
  onAddressSelect,
  addressType,
  sessionId,
  disabled = false,
  showSearch = true,
  showFilters = true,
  allowEdit = true,
  allowDelete = true,
  allowSetDefault = true,
  maxHeight = "400px",
  className,
  showAddressForm = false,
  onAddressCreate,
}: AddressSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<AddressCategory>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(showAddressForm);
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(
    null
  );

  // Hooks
  const {
    data: addressesResponse,
    isLoading: loadingAddresses,
    refetch: refetchAddresses,
  } = useAddresses({ page: 1, limit: 50 });

  const { data: defaultAddress } = useDefaultAddress(addressType);
  const setDefaultAddressMutation = useSetDefaultAddress();
  const deleteAddressMutation = useDeleteAddress();

  // Check if we're returning from address creation
  const returnedAddressId = searchParams.get("selectedAddress");

  // Categorize address based on name or other indicators
  const categorizeAddress = useCallback(
    (address: AddressResponse): AddressCategory => {
      const name = (address.name || "").toLowerCase();
      const recipient = address.recipientName.toLowerCase();

      if (
        name.includes("home") ||
        name.includes("house") ||
        name.includes("residence") ||
        name.includes("personal")
      ) {
        return "HOME";
      }
      if (
        name.includes("work") ||
        name.includes("office") ||
        name.includes("business") ||
        name.includes("company") ||
        address.companyName
      ) {
        return "WORK";
      }
      return "OTHER";
    },
    []
  );

  // Auto-select returned or default address
  useEffect(() => {
    if (returnedAddressId && !selectedAddressId) {
      onAddressSelect(returnedAddressId);
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("selectedAddress");
      window.history.replaceState({}, "", newUrl.toString());
      toast.success("New address created and selected!");
    } else if (defaultAddress && !selectedAddressId) {
      // defaultAddress is already the extracted data (AddressResponse | undefined)
      onAddressSelect(defaultAddress.id);
    }
  }, [returnedAddressId, defaultAddress, selectedAddressId, onAddressSelect]);

  // Filter and search addresses
  const { filteredAddresses, categoryCounts } = useMemo(() => {
    // Extract addresses from the response structure
    let addresses: AddressResponse[] = [];

    if (addressesResponse?.success && addressesResponse.data) {
      // Handle both paginated and non-paginated responses
      if ("items" in addressesResponse.data) {
        // Paginated response
        addresses = addressesResponse.data.items;
      } else if (Array.isArray(addressesResponse.data)) {
        // Array response
        addresses = addressesResponse.data;
      }
    }

    let filtered = addresses.filter(
      (address: AddressResponse) =>
        address.addressType === addressType || address.addressType === "BOTH"
    );

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (address: AddressResponse) =>
          address.name?.toLowerCase().includes(query) ||
          address.recipientName.toLowerCase().includes(query) ||
          address.street.toLowerCase().includes(query) ||
          address.city.toLowerCase().includes(query) ||
          address.formattedAddress.toLowerCase().includes(query) ||
          address.companyName?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter((address: AddressResponse) => {
        const category = categorizeAddress(address);
        return category === selectedCategory;
      });
    }

    // Sort: default addresses first, then by recently updated, then by name
    filtered.sort((a: AddressResponse, b: AddressResponse) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;

      // Then by updated date
      const aDate = new Date(a.updatedAt || a.createdAt);
      const bDate = new Date(b.updatedAt || b.createdAt);
      if (aDate > bDate) return -1;
      if (aDate < bDate) return 1;

      // Finally by name
      return (a.name || a.recipientName).localeCompare(
        b.name || b.recipientName
      );
    });

    // Calculate category counts
    const counts: Record<AddressCategory, number> = {
      ALL: 0,
      HOME: 0,
      WORK: 0,
      OTHER: 0,
    };
    addresses.forEach((address: AddressResponse) => {
      if (
        address.addressType === addressType ||
        address.addressType === "BOTH"
      ) {
        counts.ALL++;
        counts[categorizeAddress(address)]++;
      }
    });

    return { filteredAddresses: filtered, categoryCounts: counts };
  }, [
    addressesResponse,
    addressType,
    searchQuery,
    selectedCategory,
    categorizeAddress,
  ]);

  const handleAddNewAddress = () => {
    if (sessionId) {
      // Navigate to address creation page with checkout context
      const createUrl = new URL(
        "/dashboard/customer/addresses/create",
        window.location.origin
      );

      const cleanSessionId = sessionId.split("?")[0];
      createUrl.searchParams.set("session", cleanSessionId);

      const returnUrl = new URL(
        window.location.pathname,
        window.location.origin
      );
      returnUrl.searchParams.set("session", cleanSessionId);
      createUrl.searchParams.set("returnTo", returnUrl.toString());
      createUrl.searchParams.set("type", addressType);

      router.push(createUrl.toString());
    } else {
      setShowAddForm(true);
    }
  };

  const handleEditAddress = (address: AddressResponse) => {
    if (sessionId) {
      // Navigate to edit page with checkout context
      const editUrl = new URL(
        `/dashboard/customer/addresses/${address.id}/edit`,
        window.location.origin
      );

      const cleanSessionId = sessionId.split("?")[0];
      editUrl.searchParams.set("session", cleanSessionId);

      const returnUrl = new URL(
        window.location.pathname,
        window.location.origin
      );
      returnUrl.searchParams.set("session", cleanSessionId);
      editUrl.searchParams.set("returnTo", returnUrl.toString());

      router.push(editUrl.toString());
    } else {
      setEditingAddress(address);
    }
  };

  const handleCopyAddress = (address: AddressResponse) => {
    const addressText = `${address.recipientName}\n${address.formattedAddress}`;
    navigator.clipboard.writeText(addressText);
    toast.success("Address copied to clipboard");
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultAddressMutation.mutateAsync(addressId);
      await refetchAddresses();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDeleteAddress = async (
    addressId: string,
    addressName: string
  ) => {
    if (confirm(`Are you sure you want to delete "${addressName}"?`)) {
      try {
        await deleteAddressMutation.mutateAsync(addressId);
        if (selectedAddressId === addressId) {
          // Select another address if available
          const remainingAddresses = filteredAddresses.filter(
            (addr: AddressResponse) => addr.id !== addressId
          );
          if (remainingAddresses.length > 0) {
            onAddressSelect(remainingAddresses[0].id);
          }
        }
        await refetchAddresses();
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleRefreshAddresses = async () => {
    setIsRefreshing(true);
    try {
      await refetchAddresses();
      toast.success("Addresses refreshed");
    } catch (error) {
      toast.error("Failed to refresh addresses");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getAddressIcon = (address: AddressResponse) => {
    const category = categorizeAddress(address);
    const config = ADDRESS_CATEGORY_CONFIG[category];
    const IconComponent = config.icon;
    return <IconComponent className={cn("h-4 w-4", config.color)} />;
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith("+254")) {
      return phone.replace("+254", "0");
    }
    return phone;
  };

  const getCountryFlag = (countryCode: string) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    return country?.flag || "🌍";
  };

  const isAddressSelected = (addressId: string) =>
    selectedAddressId === addressId;

  // Loading state
  if (loadingAddresses) {
    return <AddressSelectorSkeleton className={className} />;
  }

  // No addresses available
  if (categoryCounts.ALL === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">
                No {addressType.toLowerCase()} addresses found
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add a {addressType.toLowerCase()} address to continue with
                checkout
              </p>
            </div>
            <Button
              onClick={handleAddNewAddress}
              disabled={disabled}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {addressType} Address
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">
            Select {addressType.toLowerCase()} address
          </h3>
          <p className="text-sm text-muted-foreground">
            {filteredAddresses.length} of {categoryCounts.ALL} addresses
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAddresses}
            disabled={isRefreshing || disabled}
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="space-y-3">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search addresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={disabled}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {showFilters && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {(Object.keys(ADDRESS_CATEGORY_CONFIG) as AddressCategory[]).map(
                (category) => {
                  const config = ADDRESS_CATEGORY_CONFIG[category];
                  const IconComponent = config.icon;
                  const count = categoryCounts[category];

                  return (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      disabled={disabled || count === 0}
                      className="flex items-center gap-1 whitespace-nowrap"
                    >
                      <IconComponent className="h-3 w-3" />
                      {config.label}
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </Button>
                  );
                }
              )}
            </div>
          )}
        </div>
      )}

      {/* Success message for returned address */}
      {returnedAddressId && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Address created successfully and selected for your order.
          </AlertDescription>
        </Alert>
      )}

      {/* Address List */}
      <div className="space-y-3 overflow-y-auto" style={{ maxHeight }}>
        {filteredAddresses.length === 0 ? (
          <div className="text-center py-8">
            <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No addresses match your search criteria
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <RadioGroup
            value={selectedAddressId}
            onValueChange={onAddressSelect}
            disabled={disabled}
            className="space-y-3"
          >
            {filteredAddresses.map((address) => {
              const isSelected = isAddressSelected(address.id);

              return (
                <div key={address.id} className="relative group">
                  <Label htmlFor={address.id} className="cursor-pointer block">
                    <Card
                      className={cn(
                        "transition-all hover:shadow-md border-2",
                        isSelected
                          ? "ring-2 ring-primary border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                        disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <RadioGroupItem
                              value={address.id}
                              id={address.id}
                              className="mt-1"
                              disabled={disabled}
                            />
                            <div className="space-y-2 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                {getAddressIcon(address)}
                                <span className="font-medium truncate">
                                  {address.name || "Unnamed Address"}
                                </span>
                                {address.isDefault && (
                                  <Badge variant="default" className="text-xs">
                                    <Star className="w-3 h-3 mr-1 fill-current" />
                                    Default
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {address.addressType === "BOTH"
                                    ? "Shipping & Billing"
                                    : address.addressType.toLowerCase()}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                {address.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {formatPhoneNumber(address.phone)}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {getCountryFlag(address.country)}{" "}
                                  {address.country}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Updated{" "}
                                  {new Date(
                                    address.updatedAt || address.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {isSelected && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}

                            {/* Action Menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleCopyAddress(address);
                                  }}
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy Address
                                </DropdownMenuItem>

                                {allowEdit && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleEditAddress(address);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Address
                                  </DropdownMenuItem>
                                )}

                                {allowSetDefault && !address.isDefault && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleSetDefault(address.id);
                                    }}
                                  >
                                    <Star className="mr-2 h-4 w-4" />
                                    Set as Default
                                  </DropdownMenuItem>
                                )}

                                {allowSetDefault && address.isDefault && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();
                                      // Could implement remove default functionality
                                    }}
                                    disabled
                                  >
                                    <StarOff className="mr-2 h-4 w-4" />
                                    Default Address
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                {allowDelete && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDeleteAddress(
                                        address.id,
                                        address.name || address.recipientName
                                      );
                                    }}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Address
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p className="font-medium text-foreground">
                            {address.recipientName}
                          </p>
                          {address.companyName && (
                            <p className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {address.companyName}
                            </p>
                          )}
                          <div className="whitespace-pre-line">
                            {address.formattedAddress}
                          </div>
                        </div>

                        {/* Additional Address Details */}
                        {(address.street2 || address.state) && (
                          <div className="mt-2 pt-2 border-t">
                            <div className="text-xs text-muted-foreground space-y-1">
                              {address.street2 && (
                                <div>Additional: {address.street2}</div>
                              )}
                              {address.state && (
                                <div>State/Province: {address.state}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        )}
      </div>

      {/* Add New Address Button */}
      <Card className="border-dashed border-2">
        <CardContent className="pt-6">
          <Button
            variant="ghost"
            onClick={handleAddNewAddress}
            disabled={disabled}
            className="w-full h-auto py-4 flex-col space-y-2 hover:bg-primary/5"
          >
            <Plus className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Add New Address</div>
              <div className="text-xs text-muted-foreground">
                Create a new {addressType.toLowerCase()} address
              </div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function AddressSelectorSkeleton({
  showSearch = true,
  showFilters = true,
  itemCount = 2,
  className,
}: {
  showSearch?: boolean;
  showFilters?: boolean;
  itemCount?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="space-y-3">
          {showSearch && <Skeleton className="h-10 w-full" />}
          {showFilters && (
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Address Items */}
      <div className="space-y-3">
        {Array.from({ length: itemCount }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-start space-x-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Address Button */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-2 py-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
