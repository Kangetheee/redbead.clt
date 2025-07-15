/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useDesign,
  useCreateDesign,
  useUpdateDesign,
  useExportDesign,
} from "@/hooks/use-design-studio";
import {
  CanvasData,
  DesignResponse,
} from "@/lib/design-studio/types/design-studio.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoveLeft, Save, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DesignTools from "./design-tools";
import DesignCanvasComponent from "./design-canvas";
import DesignPreviewComponent from "./design-preview";
import AssetLibraryComponent from "./asset-library";

export default function ProductDesignStudio() {
  const { productId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("design");
  const [canvas, setCanvas] = useState<CanvasData>({
    width: 800,
    height: 600,
    backgroundColor: "#ffffff",
    layers: [],
  });
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState("select");
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);

  // In a real app, you'd fetch the design based on productId
  const { data: design } = useDesign(
    currentDesignId || "mock-design-id",
    !!currentDesignId
  );

  // Use the design studio hooks for real functionality
  const createDesign = useCreateDesign();
  const updateDesign = useUpdateDesign();
  const exportDesign = useExportDesign();

  const handleCanvasChange = (newCanvas: CanvasData) => {
    setCanvas(newCanvas);
  };

  const handleAssetSelect = (asset: any) => {
    // Add the selected asset to the canvas
    const newLayer = {
      id: `layer-${Date.now()}`,
      type: asset.type,
      name: asset.name,
      x: 100,
      y: 100,
      width: asset.width || 200,
      height: asset.height || 200,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      data: asset,
    };

    const newCanvas = {
      ...canvas,
      layers: [...canvas.layers, newLayer],
    };

    setCanvas(newCanvas);
    setSelectedLayerId(newLayer.id);
  };

  const handleSave = async () => {
    try {
      // First create the design if it doesn't exist
      if (!currentDesignId) {
        const result = await createDesign.mutateAsync({
          name: `${productId} Design - ${new Date().toLocaleDateString()}`,
          productId: productId as string,
          customizations: canvas,
          isTemplate: false,
          isPublic: false,
        });

        if (result.success) {
          setCurrentDesignId(result.data.id);
          console.log("Design created:", result.data);
        }
      } else {
        // Update existing design
        await updateDesign.mutateAsync({
          designId: currentDesignId,
          values: {
            customizations: canvas,
            name: design?.name || `${productId} Design`,
          },
        });
      }
    } catch (error) {
      console.error("Failed to save design:", error);
    }
  };

  const handleExport = async () => {
    try {
      if (!currentDesignId) {
        toast.error("Please save the design first before exporting");
        return;
      }

      await exportDesign.mutateAsync({
        designId: currentDesignId,
        values: {
          format: "png",
          quality: "high",
          includeBleed: false,
          includeCropMarks: false,
        },
      });
    } catch (error) {
      console.error("Failed to export design:", error);
    }
  };

  const handleBack = () => {
    router.push("/design-studio");
  };

  // Mock design data for preview
  const mockDesign: DesignResponse = {
    id: currentDesignId || "mock-design-id",
    name: `${productId} Design`,
    description: undefined,
    preview: "/api/placeholder/400/300",
    customizations: canvas,
    metadata: {},
    product: {
      id: productId as string,
      name: productId as string,
      thumbnail: "/api/placeholder/100/100",
    },
    status: "draft",
    version: 1,
    isTemplate: false,
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-background border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <MoveLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Design Studio: {productId}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAssetLibrary(true)}>
            Asset Library
          </Button>
          <Button
            variant="secondary"
            onClick={handleSave}
            disabled={createDesign.isPending || updateDesign.isPending}
          >
            {createDesign.isPending || updateDesign.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
          <Button
            onClick={handleExport}
            disabled={exportDesign.isPending || !currentDesignId}
          >
            {exportDesign.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <DesignTools
          canvas={canvas}
          onCanvasChange={handleCanvasChange}
          selectedLayerId={selectedLayerId}
          onLayerSelect={setSelectedLayerId}
          tool={tool}
          onToolChange={setTool}
        />

        <main className="flex-1 overflow-auto p-4">
          <DesignCanvasComponent
            canvas={canvas}
            onCanvasChange={handleCanvasChange}
            selectedLayerId={selectedLayerId}
            onLayerSelect={setSelectedLayerId}
            zoom={zoom}
            setZoom={setZoom}
            tool={tool}
            onToolChange={setTool}
          />
        </main>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="border-t">
        <TabsList className="rounded-none w-full justify-start">
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="size">Size Variations</TabsTrigger>
          <TabsTrigger value="print">Print Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="p-4">
          <div className="text-center text-muted-foreground">
            <p>Design tools and controls are available in the left sidebar.</p>
            <p>Use the canvas above to create your design.</p>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="p-4">
          <DesignPreviewComponent design={design || mockDesign} />
        </TabsContent>

        <TabsContent value="size" className="p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Size Variations</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["Small", "Medium", "Large", "Custom"].map((size) => (
                <div key={size} className="border rounded-lg p-4 text-center">
                  <div className="aspect-video bg-muted mb-2 rounded flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">
                      {size}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Apply {size}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="print" className="p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Print Preview</h3>
            <div className="border rounded-lg p-8 bg-white max-w-2xl mx-auto">
              <div className="aspect-[8.5/11] border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>Print preview will appear here</p>
                  <p className="text-sm mt-2">8.5&quot; x 11&quot; format</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <Button variant="outline">Print Settings</Button>
              <Button>Print Preview</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {showAssetLibrary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <AssetLibraryComponent
              onClose={() => setShowAssetLibrary(false)}
              onAssetSelect={handleAssetSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
}
