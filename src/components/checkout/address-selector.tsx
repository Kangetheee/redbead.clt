/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AddressResponse,
  AddressType,
} from "@/lib/address/types/address.types";
import { useAddresses } from "@/hooks/use-address";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddressSelectorProps {
  addresses: AddressResponse[];
  selectedAddressId: string;
  onAddressSelect: (addressId: string) => void;
  addressType: AddressType;
  sessionId?: string;
  disabled?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  maxHeight?: string;
  className?: string;
}

type AddressCategory = "ALL" | "HOME" | "WORK" | "OTHER";

const ADDRESS_CATEGORY_CONFIG = {
  ALL: { icon: MapPin, label: "All Addresses", color: "text-gray-600" },
  HOME: { icon: Home, label: "Home", color: "text-blue-600" },
  WORK: { icon: Briefcase, label: "Work", color: "text-purple-600" },
  OTHER: { icon: Users, label: "Other", color: "text-green-600" },
};

export function AddressSelector({
  addresses,
  selectedAddressId,
  onAddressSelect,
  addressType,
  sessionId,
  disabled = false,
  showSearch = true,
  showFilters = true,
  allowEdit = false,
  allowDelete = false,
  maxHeight = "400px",
  className,
}: AddressSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<AddressCategory>("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if we're returning from address creation with a new address
  const returnedAddressId = searchParams.get("selectedAddress");

  // Auto-select returned address
  useEffect(() => {
    if (returnedAddressId && !selectedAddressId) {
      onAddressSelect(returnedAddressId);
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("selectedAddress");
      window.history.replaceState({}, "", newUrl.toString());
      toast.success("New address created and selected!");
    }
  }, [returnedAddressId, selectedAddressId, onAddressSelect]);

  // Filter and search addresses
  const filteredAddresses = useMemo(() => {
    let filtered = addresses.filter(
      (address) =>
        address.addressType === addressType || address.addressType === "BOTH"
    );

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (address) =>
          address.name?.toLowerCase().includes(query) ||
          address.recipientName.toLowerCase().includes(query) ||
          address.street.toLowerCase().includes(query) ||
          address.city.toLowerCase().includes(query) ||
          address.formattedAddress.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter((address) => {
        const category = categorizeAddress(address);
        return category === selectedCategory;
      });
    }

    // Sort: default addresses first, then by name
    return filtered.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return (a.name || a.recipientName).localeCompare(
        b.name || b.recipientName
      );
    });
  }, [addresses, addressType, searchQuery, selectedCategory]);

  // Categorize address based on name or other indicators
  const categorizeAddress = (address: AddressResponse): AddressCategory => {
    const name = (address.name || "").toLowerCase();
    const recipient = address.recipientName.toLowerCase();

    if (
      name.includes("home") ||
      name.includes("house") ||
      name.includes("residence")
    ) {
      return "HOME";
    }
    if (
      name.includes("work") ||
      name.includes("office") ||
      name.includes("company") ||
      address.companyName
    ) {
      return "WORK";
    }
    return "OTHER";
  };

  const handleAddNewAddress = () => {
    setIsLoading(true);

    // Parse current URL and create the destination URL
    const createUrl = new URL(
      "/dashboard/customer/addresses/create",
      window.location.origin
    );

    // Add checkout context parameters
    if (sessionId) {
      // Clean the session ID to avoid parameter nesting
      const cleanSessionId = sessionId.split("?")[0];
      createUrl.searchParams.set("session", cleanSessionId);

      // Set the return URL correctly
      const returnUrl = new URL(
        window.location.pathname,
        window.location.origin
      );
      returnUrl.searchParams.set("session", cleanSessionId);
      createUrl.searchParams.set("returnTo", returnUrl.toString());
    }

    createUrl.searchParams.set("type", addressType);

    router.push(createUrl.toString());
  };

  const handleEditAddress = (addressId: string) => {
    const editUrl = new URL(
      `/dashboard/customer/addresses/${addressId}/edit`,
      window.location.origin
    );

    if (sessionId) {
      const cleanSessionId = sessionId.split("?")[0];
      editUrl.searchParams.set("session", cleanSessionId);

      const returnUrl = new URL(
        window.location.pathname,
        window.location.origin
      );
      returnUrl.searchParams.set("session", cleanSessionId);
      editUrl.searchParams.set("returnTo", returnUrl.toString());
    }

    router.push(editUrl.toString());
  };

  const handleCopyAddress = (address: AddressResponse) => {
    const addressText = `${address.recipientName}\n${address.formattedAddress}`;
    navigator.clipboard.writeText(addressText);
    toast.success("Address copied to clipboard");
  };

  const handleRefreshAddresses = async () => {
    setIsRefreshing(true);
    try {
      // This would typically trigger a refetch from the parent component
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
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
    // Simple phone number formatting
    if (phone.startsWith("+254")) {
      return phone.replace("+254", "0");
    }
    return phone;
  };

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts = { ALL: 0, HOME: 0, WORK: 0, OTHER: 0 };
    addresses.forEach((address) => {
      if (
        address.addressType === addressType ||
        address.addressType === "BOTH"
      ) {
        counts.ALL++;
        counts[categorizeAddress(address)]++;
      }
    });
    return counts;
  }, [addresses, addressType]);

  if (
    filteredAddresses.length === 0 &&
    !searchQuery &&
    selectedCategory === "ALL"
  ) {
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
              disabled={disabled || isLoading}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isLoading ? "Redirecting..." : `Add ${addressType} Address`}
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
            {filteredAddresses.length} of {addresses.length} addresses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAddresses}
            disabled={isRefreshing}
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
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
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
          >
            {filteredAddresses.map((address) => (
              <div key={address.id} className="relative group">
                <Label htmlFor={address.id} className="cursor-pointer block">
                  <Card
                    className={cn(
                      "transition-all hover:shadow-md",
                      selectedAddressId === address.id
                        ? "ring-2 ring-primary border-primary"
                        : "",
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
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getAddressIcon(address)}
                              <span className="font-medium truncate">
                                {address.name || "Unnamed Address"}
                              </span>
                              {address.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {address.addressType === "BOTH"
                                  ? "Shipping & Billing"
                                  : address.addressType.toLowerCase()}
                              </Badge>
                              {address.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {formatPhoneNumber(address.phone)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {selectedAddressId === address.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}

                          {/* Action Buttons (shown on hover) */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCopyAddress(address);
                              }}
                              className="p-1 h-6 w-6"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>

                            {allowEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleEditAddress(address.id);
                                }}
                                className="p-1 h-6 w-6"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
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
            ))}
          </RadioGroup>
        )}
      </div>

      {/* Add New Address Button */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <Button
            variant="ghost"
            onClick={handleAddNewAddress}
            disabled={disabled || isLoading}
            className="w-full h-auto py-4 flex-col space-y-2"
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

// Enhanced Loading skeleton component
export function AddressSelectorSkeleton({
  showSearch = true,
  showFilters = true,
  itemCount = 2,
}: {
  showSearch?: boolean;
  showFilters?: boolean;
  itemCount?: number;
}) {
  return (
    <div className="space-y-4">
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
    </div>
  );
}
