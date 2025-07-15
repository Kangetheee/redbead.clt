/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { CanvasData } from "@/lib/design-studio/types/design-studio.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayerPanel } from "@/components/design-studio/canvas/layer-panel";
import { ImageTool } from "@/components/design-studio/tools/image-tool";
import { ShapeTool } from "@/components/design-studio/tools/shape-tool";
import { TextTool } from "@/components/design-studio/tools/text-tool";

interface DesignToolsProps {
  canvas: CanvasData;
  onCanvasChange: (canvas: CanvasData) => void;
  selectedLayerId?: string | null;
  onLayerSelect: (layerId: string | null) => void;
  tool: string;
  onToolChange: (tool: string) => void;
}

export default function DesignTools({
  canvas,
  onCanvasChange,
  selectedLayerId,
  onLayerSelect,
  tool,
  onToolChange,
}: DesignToolsProps) {
  const [activeTab, setActiveTab] = useState("layers");

  return (
    <div className="w-80 border-r flex flex-col">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col h-full"
      >
        <TabsList className="rounded-none grid grid-cols-3">
          <TabsTrigger value="layers">Layers</TabsTrigger>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="graphics">Graphics</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="layers" className="mt-0 h-full">
            <LayerPanel
              canvas={canvas}
              onCanvasChange={onCanvasChange}
              selectedLayerId={selectedLayerId}
              onLayerSelect={onLayerSelect}
            />
          </TabsContent>

          <TabsContent value="text" className="mt-0 h-full">
            <TextTool
              canvas={canvas}
              onCanvasChange={onCanvasChange}
              selectedLayerId={selectedLayerId}
              onLayerSelect={onLayerSelect}
            />
          </TabsContent>

          <TabsContent value="graphics" className="mt-0 h-full">
            <div className="space-y-4">
              <ImageTool
                canvas={canvas}
                onCanvasChange={onCanvasChange}
                selectedLayerId={selectedLayerId}
                onLayerSelect={onLayerSelect}
              />
              <ShapeTool
                canvas={canvas}
                onCanvasChange={onCanvasChange}
                selectedLayerId={selectedLayerId}
                onLayerSelect={onLayerSelect}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
