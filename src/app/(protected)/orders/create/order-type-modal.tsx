"use client";

import React from "react";
import { Zap, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OrderTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: "full" | "quick") => void;
}

export default function OrderTypeModal({
  isOpen,
  onClose,
  onSelectType,
}: OrderTypeModalProps) {
  const handleSelectType = (type: "full" | "quick") => {
    onSelectType(type);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose Order Type</DialogTitle>
          <DialogDescription>
            Select the type of order you want to create
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div
            className="p-4 border rounded-lg cursor-pointer transition-colors hover:border-blue-300 hover:bg-blue-50"
            onClick={() => handleSelectType("quick")}
          >
            <div className="flex items-start gap-3">
              <Zap className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold">Quick Order</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Simple order creation with basic requirements
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    Fast
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Simple
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Recommended
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div
            className="p-4 border rounded-lg cursor-pointer transition-colors hover:border-purple-300 hover:bg-purple-50"
            onClick={() => handleSelectType("full")}
          >
            <div className="flex items-start gap-3">
              <Clock className="h-6 w-6 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold">Full Order Form</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Complete order form with detailed specifications
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    Detailed
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Comprehensive
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Advanced
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
