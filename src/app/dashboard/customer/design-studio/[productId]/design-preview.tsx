"use client";

import { DesignPreview } from "@/components/design-studio/preview/design-preview";
import { DesignResponse } from "@/lib/design-studio/types/design-studio.types";

interface DesignPreviewProps {
  design: DesignResponse;
}

export default function DesignPreviewComponent({ design }: DesignPreviewProps) {
  return (
    <div className="p-4">
      <DesignPreview design={design} showControls={true} interactive={false} />
    </div>
  );
}
