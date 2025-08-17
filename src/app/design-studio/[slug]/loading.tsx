import React from "react";
import { Loader2, Palette } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <Palette className="w-16 h-16 text-muted-foreground mx-auto" />
          <Loader2 className="w-6 h-6 text-primary absolute -bottom-1 -right-1 animate-spin" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Loading Design Studio
          </h2>
          <p className="text-muted-foreground">
            Preparing your creative workspace...
          </p>
        </div>

        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
        </div>
      </div>
    </div>
  );
}
