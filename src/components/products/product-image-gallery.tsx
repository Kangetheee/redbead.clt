"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
  showThumbnails?: boolean;
  allowFullscreen?: boolean;
}

export function ProductImageGallery({
  images,
  productName,
  className,
  showThumbnails = true,
  allowFullscreen = true,
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const filteredImages = images.filter(Boolean);
  const currentImage =
    filteredImages[selectedImageIndex] || "/placeholder-product.jpg";

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? filteredImages.length - 1 : prev - 1
    );
    setIsImageLoading(true);
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === filteredImages.length - 1 ? 0 : prev + 1
    );
    setIsImageLoading(true);
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageLoading(true);
  };

  const handleFullscreenOpen = () => {
    if (allowFullscreen) {
      setIsFullscreenOpen(true);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image */}
      <Card className="overflow-hidden border-border bg-card">
        <div className="aspect-square relative bg-gradient-to-br from-muted/50 to-muted">
          <Image
            src={currentImage}
            alt={`${productName} - Image ${selectedImageIndex + 1}`}
            fill
            className={cn(
              "object-cover transition-opacity duration-300 cursor-pointer",
              isImageLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setIsImageLoading(false)}
            onClick={handleFullscreenOpen}
            priority
          />

          {/* Image Navigation */}
          {filteredImages.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background border-border"
                onClick={handlePreviousImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background border-border"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Fullscreen Button */}
          {allowFullscreen && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background border-border"
              onClick={handleFullscreenOpen}
            >
              <Expand className="h-4 w-4" />
            </Button>
          )}

          {/* Image Counter */}
          {filteredImages.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
              {selectedImageIndex + 1} / {filteredImages.length}
            </div>
          )}

          {/* Loading State */}
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}
        </div>
      </Card>

      {/* Image Thumbnails */}
      {showThumbnails && filteredImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filteredImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageSelect(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors",
                selectedImageIndex === index
                  ? "border-primary"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {allowFullscreen && (
        <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
          <DialogContent className="max-w-4xl w-full h-[90vh] bg-background border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span className="text-foreground">{productName}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreenOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="relative flex-1 min-h-0">
              <div className="relative w-full h-full">
                <Image
                  src={currentImage}
                  alt={`${productName} - Fullscreen view`}
                  fill
                  className="object-contain"
                />

                {/* Fullscreen Navigation */}
                {filteredImages.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background border-border"
                      onClick={handlePreviousImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background border-border"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    {/* Fullscreen Counter */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded">
                      {selectedImageIndex + 1} of {filteredImages.length}
                    </div>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
