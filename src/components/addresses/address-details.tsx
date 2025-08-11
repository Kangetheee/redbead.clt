"use client";

import { AddressResponse } from "@/lib/address/types/address.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  User,
  Building,
  Phone,
  Star,
  Edit,
  Copy,
  CheckCircle,
  Navigation,
  Calendar,
  Globe,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddressDetailsProps {
  address: AddressResponse;
  showActions?: boolean;
  onEdit?: (address: AddressResponse) => void;
  variant?: "default" | "compact" | "inline" | "card" | "summary";
  className?: string;
  showTimestamps?: boolean;
  showMapLink?: boolean;
}

export function AddressDetails({
  address,
  showActions = false,
  onEdit,
  variant = "default",
  className = "",
  showTimestamps = false,
  showMapLink = false,
}: AddressDetailsProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
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
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  const openInMaps = () => {
    const query = encodeURIComponent(address.formattedAddress);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, "_blank");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Inline variant - minimal text format
  if (variant === "inline") {
    return (
      <div className={`text-sm space-y-1 ${className}`}>
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

  // Summary variant - one line format
  if (variant === "summary") {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {address.name || address.recipientName}
            </span>
            {address.isDefault && (
              <Badge variant="secondary" className="text-xs">
                <Star className="w-2.5 h-2.5 mr-1" />
                Default
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {address.addressType === "BOTH" ? "Both" : address.addressType}
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
    );
  }

  // Compact variant - smaller card format
  if (variant === "compact") {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm">
                  {address.name || address.recipientName}
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
                {showMapLink && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openInMaps}
                    className="h-7 w-7 p-0"
                  >
                    <Navigation className="h-3 w-3" />
                  </Button>
                )}
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
            {address.name && address.name !== address.recipientName && (
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span>{address.recipientName}</span>
              </div>
            )}

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

  // Card variant - medium detail card
  if (variant === "card") {
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
                {showMapLink && (
                  <Button variant="outline" size="sm" onClick={openInMaps}>
                    <Navigation className="w-4 h-4 mr-2" />
                    Map
                  </Button>
                )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium">{address.recipientName}</p>
                  <p className="text-sm text-muted-foreground">Recipient</p>
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
                    <p className="text-sm text-muted-foreground">Phone</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              <div>
                <div className="font-medium whitespace-pre-line">
                  {address.formattedAddress}
                </div>
                <p className="text-sm text-muted-foreground">Address</p>
              </div>
            </div>
          </div>

          {showTimestamps && (
            <>
              <Separator />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Created: {formatDate(address.createdAt)}
                </div>
                {address.updatedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Updated: {formatDate(address.updatedAt)}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant - full detailed view
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {address.name || "Address Details"}
              {address.isDefault && (
                <Badge variant="secondary">
                  <Star className="w-3 h-3 mr-1" />
                  Default
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {address.addressType === "BOTH"
                  ? "Shipping & Billing"
                  : address.addressType.toLowerCase()}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                ID: {address.id.slice(-8)}
              </Badge>
            </div>
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
              {showMapLink && (
                <Button variant="outline" size="sm" onClick={openInMaps}>
                  <Navigation className="w-4 h-4 mr-2" />
                  View on Map
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(address)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Address
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <User className="w-4 h-4" />
            Contact Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div>
                  <p className="font-medium">{address.recipientName}</p>
                  <p className="text-sm text-muted-foreground">
                    Recipient Name
                  </p>
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
            </div>

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

        <Separator />

        {/* Address Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address Information
          </h4>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="font-medium text-lg mb-2 whitespace-pre-line">
              {address.formattedAddress}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-3 h-3" />
              <span>Country: {address.country}</span>
            </div>
          </div>

          {/* Address Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Street Address
              </p>
              <div>
                <p className="font-medium">{address.street}</p>
                {address.street2 && (
                  <p className="text-muted-foreground">{address.street2}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">City</p>
              <p className="font-medium">{address.city}</p>
            </div>

            {address.state && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  State/Province
                </p>
                <p className="font-medium">{address.state}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Postal Code
              </p>
              <p className="font-medium">{address.postalCode}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Country Code
              </p>
              <p className="font-medium">{address.country}</p>
            </div>
          </div>
        </div>

        {showTimestamps && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timeline
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Created: {formatDate(address.createdAt)}</p>
                {address.updatedAt && (
                  <p>Last Updated: {formatDate(address.updatedAt)}</p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
