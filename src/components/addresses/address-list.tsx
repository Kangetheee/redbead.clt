/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/hooks/use-address";
import { AddressResponse } from "@/lib/address/types/address.types";
import { GetAddressesDto } from "@/lib/address/dto/address.dto";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  MoreHorizontal,
  Edit,
  Star,
  Trash2,
  Phone,
  Building,
  Loader2,
  Search,
  Plus,
  Filter,
  Copy,
  CheckCircle,
} from "lucide-react";
import { AddressType } from "@/lib/address/types/address.types";
import { toast } from "sonner";

interface AddressListProps {
  onEdit?: (address: AddressResponse) => void;
  onSelect?: (address: AddressResponse) => void;
  onAdd?: () => void;
  selectable?: boolean;
  selectedAddressId?: string;
  showHeader?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  variant?: "default" | "compact" | "grid";
  maxHeight?: string;
}

export function AddressList({
  onEdit,
  onSelect,
  onAdd,
  selectable = false,
  selectedAddressId,
  showHeader = true,
  showSearch = true,
  showFilters = true,
  variant = "default",
  maxHeight,
}: AddressListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<AddressType | "ALL">("ALL");
  const [filterDefault, setFilterDefault] = useState<
    "ALL" | "DEFAULT" | "NON_DEFAULT"
  >("ALL");
  const [params, setParams] = useState<GetAddressesDto>({ page: 1, limit: 50 });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: addressesResponse, isLoading, error } = useAddresses(params);
  const deleteAddressMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const addresses = addressesResponse?.success
    ? addressesResponse.data.items
    : [];

  // Filter addresses based on search and filters
  const filteredAddresses = addresses.filter((address) => {
    const matchesSearch =
      !searchTerm ||
      address.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.formattedAddress
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      address.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "ALL" ||
      address.addressType === filterType ||
      address.addressType === "BOTH";

    const matchesDefault =
      filterDefault === "ALL" ||
      (filterDefault === "DEFAULT" && address.isDefault) ||
      (filterDefault === "NON_DEFAULT" && !address.isDefault);

    return matchesSearch && matchesType && matchesDefault;
  });

  const handleDelete = async (addressId: string, addressName: string) => {
    setDeletingId(addressId);
    try {
      await deleteAddressMutation.mutateAsync(addressId);
      toast.success(`Address "${addressName}" deleted successfully`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId: string, addressName: string) => {
    try {
      await setDefaultMutation.mutateAsync(addressId);
      toast.success(`"${addressName}" set as default`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCopyAddress = async (address: AddressResponse) => {
    const addressText = [
      address.recipientName,
      address.companyName,
      address.street,
      address.street2,
      `${address.city}, ${address.state || ""} ${address.postalCode}`,
      address.country,
      address.phone,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(addressText);
      setCopiedId(address.id);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  const AddressCard = ({ address }: { address: AddressResponse }) => {
    const isSelected = selectedAddressId === address.id;
    const isCopied = copiedId === address.id;

    return (
      <Card
        className={`transition-all duration-200 ${
          selectable
            ? "cursor-pointer hover:shadow-md hover:border-primary/50"
            : ""
        } ${isSelected ? "ring-2 ring-primary shadow-md" : ""} ${
          variant === "compact" ? "p-2" : ""
        }`}
        onClick={() => selectable && onSelect?.(address)}
      >
        <CardHeader className={variant === "compact" ? "pb-2" : "pb-3"}>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle
                className={`${variant === "compact" ? "text-sm" : "text-base"} flex items-center gap-2`}
              >
                <span className="truncate">
                  {address.name || address.recipientName}
                </span>
                {address.isDefault && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    <Star className="w-3 h-3 mr-1" />
                    Default
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 text-xs">
                <Badge variant="outline" className="text-xs">
                  {address.addressType === "BOTH"
                    ? "Shipping & Billing"
                    : address.addressType.toLowerCase()}
                </Badge>
                {address.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {address.phone}
                  </span>
                )}
              </CardDescription>
            </div>

            {!selectable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(address);
                    }}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyAddress(address);
                    }}
                    className="cursor-pointer"
                  >
                    {isCopied ? (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    {isCopied ? "Copied!" : "Copy"}
                  </DropdownMenuItem>
                  {!address.isDefault && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(
                          address.id,
                          address.name || address.recipientName
                        );
                      }}
                      disabled={setDefaultMutation.isPending}
                      className="cursor-pointer"
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Set as Default
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Address</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;
                          {address.name || address.recipientName}&quot;? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDelete(
                              address.id,
                              address.name || address.recipientName
                            )
                          }
                          disabled={deletingId === address.id}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deletingId === address.id && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent
          className={`${variant === "compact" ? "pt-0 pb-2" : "pt-0"}`}
        >
          <div
            className={`text-sm text-muted-foreground space-y-1 ${variant === "compact" ? "text-xs" : ""}`}
          >
            {address.name && address.name !== address.recipientName && (
              <p className="font-medium text-foreground">
                {address.recipientName}
              </p>
            )}
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
        </CardContent>

        {selectable && isSelected && (
          <CardFooter className="pt-0">
            <Badge className="w-full justify-center bg-primary">
              ✓ Selected
            </Badge>
          </CardFooter>
        )}
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showHeader && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            {showSearch && <Skeleton className="h-10 w-full" />}
          </div>
        )}
        <div
          className={
            variant === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }
        >
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <MapPin className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Failed to load addresses</p>
            <p className="text-sm">Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          {/* <div>
            <h2 className="text-2xl font-bold">
              My Addresses ({filteredAddresses.length})
            </h2>
            <p className="text-muted-foreground">
              Manage your shipping and billing addresses
            </p>
          </div> */}
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          )}
        </div>
      )}

      {/* Search and Filters */}
      {(showSearch || showFilters) && addresses.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search addresses by name, recipient, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex gap-2">
              <Select
                value={filterType}
                onValueChange={(value: AddressType | "ALL") =>
                  setFilterType(value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="SHIPPING">Shipping</SelectItem>
                  <SelectItem value="BILLING">Billing</SelectItem>
                  <SelectItem value="BOTH">Both</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterDefault}
                onValueChange={(value: "ALL" | "DEFAULT" | "NON_DEFAULT") =>
                  setFilterDefault(value)
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="DEFAULT">Default</SelectItem>
                  <SelectItem value="NON_DEFAULT">Non-Default</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Address List */}
      {filteredAddresses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <MapPin className="mx-auto h-12 w-12 mb-4 opacity-50" />
              {addresses.length === 0 ? (
                <>
                  <p className="text-lg font-medium">No addresses found</p>
                  <p className="text-sm mb-4">
                    Add your first address to get started.
                  </p>
                  {onAdd && (
                    <Button onClick={onAdd}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Address
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-lg font-medium">No matching addresses</p>
                  <p className="text-sm">
                    Try adjusting your search or filters.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={`${
            variant === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          } ${maxHeight ? `overflow-y-auto` : ""}`}
          style={maxHeight ? { maxHeight } : undefined}
        >
          {filteredAddresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      )}

      {/* Loading overlay for mutations */}
      {(deleteAddressMutation.isPending || setDefaultMutation.isPending) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Updating addresses...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
