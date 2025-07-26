"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AddToCartButton } from "./add-to-cart-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DesignTemplate {
  id: string;
  name: string;
  basePrice: number;
  sizeVariants: SizeVariant[];
}

interface SizeVariant {
  id: string;
  displayName: string;
  price: number;
}

interface QuickAddToCartButtonProps {
  templates: DesignTemplate[];
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  defaultTemplateId?: string;
  defaultSizeVariantId?: string;
}

export function QuickAddToCartButton({
  templates,
  variant = "default",
  size = "default",
  className,
  children,
  showIcon = true,
  fullWidth = false,
  disabled = false,
  defaultTemplateId,
  defaultSizeVariantId,
}: QuickAddToCartButtonProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    defaultTemplateId || templates[0]?.id || ""
  );
  const [selectedSizeVariantId, setSelectedSizeVariantId] = useState<string>(
    defaultSizeVariantId || ""
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const availableSizeVariants = selectedTemplate?.sizeVariants || [];

  // Auto-select first size variant when template changes
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template && template.sizeVariants.length > 0) {
      setSelectedSizeVariantId(template.sizeVariants[0].id);
    }
  };

  // If no templates available, show disabled state
  if (!templates || templates.length === 0) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled={true}
        className={cn(fullWidth && "w-full", className)}
      >
        {showIcon && <ShoppingCart className="h-4 w-4 mr-2" />}
        No Templates Available
      </Button>
    );
  }

  // If only one template with one size variant, show simple add to cart
  if (templates.length === 1 && templates[0].sizeVariants.length === 1) {
    return (
      <AddToCartButton
        templateId={templates[0].id}
        sizeVariantId={templates[0].sizeVariants[0].id}
        variant={variant}
        size={size}
        className={cn(fullWidth && "w-full", className)}
        disabled={disabled}
      >
        {children || (
          <>
            {showIcon && <ShoppingCart className="h-4 w-4 mr-2" />}
            Add to Cart
          </>
        )}
      </AddToCartButton>
    );
  }

  // Multiple options - show popover for selection
  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(fullWidth && "w-full", "relative", className)}
          disabled={disabled}
        >
          {showIcon && <Plus className="h-4 w-4 mr-2" />}
          {children || "Quick Add"}
          <Settings className="h-3 w-3 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Quick Add to Cart</h4>
            <p className="text-xs text-muted-foreground">
              Select template and size, then add to cart
            </p>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template-select" className="text-xs">
              Template
            </Label>
            <Select
              value={selectedTemplateId}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{template.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        KES {template.basePrice.toLocaleString()}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size Variant Selection */}
          {availableSizeVariants.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="size-select" className="text-xs">
                Size
              </Label>
              <Select
                value={selectedSizeVariantId}
                onValueChange={setSelectedSizeVariantId}
              >
                <SelectTrigger id="size-select">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {availableSizeVariants.map((sizeVariant) => (
                    <SelectItem key={sizeVariant.id} value={sizeVariant.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{sizeVariant.displayName}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          KES {sizeVariant.price.toLocaleString()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="pt-2">
            <AddToCartButton
              templateId={selectedTemplateId}
              sizeVariantId={selectedSizeVariantId}
              variant="default"
              size="sm"
              className="w-full"
              disabled={!selectedTemplateId || !selectedSizeVariantId}
              showSuccessState={true}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </AddToCartButton>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
