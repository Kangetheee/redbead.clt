/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { AddressResponse } from "@/lib/address/types/address.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  User,
  Building,
  Phone,
  Mail,
  Star,
  Edit,
  Copy,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddressDetailsProps {
  address: AddressResponse;
  showActions?: boolean;
  onEdit?: (address: AddressResponse) => void;
  variant?: "default" | "compact" | "inline";
  className?: string;
}

export function AddressDetails({
  address,
  showActions = false,
  onEdit,
  variant = "default",
  className = "",
}: AddressDetailsProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const addressText = `${address.recipientName}\n${
      address.companyName ? `${address.companyName}\n` : ""
    }${address.formattedAddress}${
      address.phone ? `\nPhone: ${address.phone}` : ""
    }`;

    try {
      await navigator.clipboard.writeText(addressText);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  if (variant === "inline") {
    return (
      <div className={`text-sm ${className}`}>
        <div className="font-medium">{address.recipientName}</div>
        {address.companyName && (
          <div className="text-muted-foreground">{address.companyName}</div>
        )}
        <div className="text-muted-foreground whitespace-pre-line">
          {address.formattedAddress}
        </div>
        {address.phone && (
          <div className="text-muted-foreground">Phone: {address.phone}</div>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm">
                  {address.name || "Address"}
                </h3>
                {address.isDefault && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    <Star className="w-2.5 h-2.5 mr-1" />
                    Default
                  </Badge>
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {address.addressType === "BOTH"
                  ? "Shipping & Billing"
                  : address.addressType.toLowerCase()}
              </Badge>
            </div>
            {showActions && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-7 w-7 p-0"
                >
                  {copied ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(address)}
                    className="h-7 w-7 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span>{address.recipientName}</span>
            </div>

            {address.companyName && (
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span>{address.companyName}</span>
              </div>
            )}

            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="whitespace-pre-line text-muted-foreground">
                {address.formattedAddress}
              </div>
            </div>

            {address.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span>{address.phone}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg flex items-center gap-2">
              {address.name || "Address Details"}
              {address.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Default
                </Badge>
              )}
            </CardTitle>
            <Badge variant="outline" className="text-sm w-fit">
              {address.addressType === "BOTH"
                ? "Shipping & Billing"
                : address.addressType.toLowerCase()}
            </Badge>
          </div>

          {showActions && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copied ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(address)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Recipient Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Recipient Information
          </h4>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="font-medium">{address.recipientName}</p>
                <p className="text-sm text-muted-foreground">Full Name</p>
              </div>
            </div>

            {address.companyName && (
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium">{address.companyName}</p>
                  <p className="text-sm text-muted-foreground">Company</p>
                </div>
              </div>
            )}

            {address.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium">{address.phone}</p>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Address Information
          </h4>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
            <div className="space-y-1">
              <div className="font-medium whitespace-pre-line">
                {address.formattedAddress}
              </div>
              <p className="text-sm text-muted-foreground">Full Address</p>
            </div>
          </div>
        </div>

        {/* Address Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Street</p>
            <div>
              <p>{address.street}</p>
              {address.street2 && (
                <p className="text-muted-foreground">{address.street2}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">City</p>
            <p>{address.city}</p>
          </div>

          {address.state && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                State/Province
              </p>
              <p>{address.state}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Postal Code
            </p>
            <p>{address.postalCode}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Country</p>
            <p>{address.country}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
