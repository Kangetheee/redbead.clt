/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useAddress, useUpdateAddress } from "@/hooks/use-address";
import { AddressForm } from "./address-form";
import { AddressDetails } from "./address-details";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  ArrowLeft,
  Edit,
  Eye,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { AddressResponse } from "@/lib/address/types/address.types";

export default function EditAddressPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("edit");

  const { data: address, isLoading, error } = useAddress(id);
  const updateAddress = useUpdateAddress();

  const handleSuccess = (updatedAddress: AddressResponse) => {
    // Switch to preview tab to show the updated address
    setActiveTab("preview");

    // Optionally, you could redirect back to the addresses list
    // router.push("/addresses");

    // Or redirect to the address detail page
    // router.push(`/addresses/${updatedAddress.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Content skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error or no address found
  if (error || !address) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <MapPin className="h-6 w-6" />
                Edit Address
              </h1>
              <p className="text-sm text-muted-foreground">Address ID: {id}</p>
            </div>
          </div>

          {/* Error Alert */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <div>
                <strong>
                  {error ? "Failed to load address" : "Address not found"}
                </strong>
              </div>
              <div className="text-sm">
                {error?.message ||
                  "The address you're looking for doesn't exist or may have been deleted."}
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/addresses")}
                >
                  Go to Addresses
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Edit Address
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{address.name || address.recipientName}</span>
              {address.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  Default
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {address.addressType === "BOTH"
                  ? "Shipping & Billing"
                  : address.addressType}
              </Badge>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            Ready to edit
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Edit Tab */}
        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Address Information</span>
                <Badge variant="outline" className="text-xs">
                  ID: {address.id.slice(-8)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddressForm
                address={address}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
                showHeader={false}
                compact={false}
                autoFocus={true}
              />
            </CardContent>
          </Card>

          {/* Edit Tips */}
          <Card className="border-muted">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Editing Tips:
                </h4>
                <ul className="space-y-1 ml-6 list-disc">
                  <li>Changes are saved when you submit the form</li>
                  <li>
                    Setting as default will unset other default addresses of the
                    same type
                  </li>
                  <li>
                    You can switch to preview mode to see how the address will
                    look
                  </li>
                  <li>All fields marked with * are required</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Address Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                This is how your address will appear in orders and shipping
                labels
              </p>
            </CardHeader>
            <CardContent>
              <AddressDetails
                address={address}
                variant="default"
                showActions={false}
                showTimestamps={true}
                showMapLink={true}
              />
            </CardContent>
          </Card>

          {/* Switch back to edit */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setActiveTab("edit")}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Continue Editing
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <Button variant="outline" onClick={() => router.push("/addresses")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Addresses
        </Button>

        <div className="text-sm text-muted-foreground flex items-center gap-4">
          <span>
            Last updated:{" "}
            {new Date(
              address.updatedAt || address.createdAt
            ).toLocaleDateString()}
          </span>
          <Button variant="link" className="p-0 h-auto text-sm">
            Need help?
          </Button>
        </div>
      </div>
    </div>
  );
}
