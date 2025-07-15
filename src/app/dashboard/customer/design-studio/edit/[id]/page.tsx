/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useDesign,
  useUpdateDesign,
  useExportDesign,
} from "@/hooks/use-design-studio";
import type {
  CanvasData,
  DesignResponse,
} from "@/lib/design-studio/types/design-studio.types";
import type {
  UpdateDesignDto,
  ExportDesignDto,
} from "@/lib/design-studio/dto/design-studio.dto";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoveLeft, Save, Download, Loader2, Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

// Import the design studio components (these would be the same ones used in the product design studio)
// For this example, I'll create placeholder components
const DesignTools = ({
  canvas,
  onCanvasChange,
  selectedLayerId,
  onLayerSelect,
  tool,
  onToolChange,
}: any) => (
  <div className="w-80 border-r p-4">
    <h3 className="font-semibold mb-4">Design Tools</h3>
    <div className="space-y-4">
      <div className="p-3 border rounded-lg">
        <h4 className="font-medium mb-2">Layers</h4>
        <p className="text-sm text-muted-foreground">
          {canvas.layers?.length || 0} layers
        </p>
      </div>
      <div className="p-3 border rounded-lg">
        <h4 className="font-medium mb-2">Canvas</h4>
        <p className="text-sm text-muted-foreground">
          {canvas.width} × {canvas.height}px
        </p>
      </div>
      <div className="p-3 border rounded-lg">
        <h4 className="font-medium mb-2">Background</h4>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 border rounded"
            style={{ backgroundColor: canvas.backgroundColor || "#ffffff" }}
          />
          <span className="text-sm text-muted-foreground">
            {canvas.backgroundColor || "#ffffff"}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const DesignCanvasComponent = ({
  canvas,
  onCanvasChange,
  selectedLayerId,
  onLayerSelect,
  zoom,
  setZoom,
  tool,
  onToolChange,
}: any) => (
  <div className="flex-1 p-4">
    <div className="border rounded-lg bg-muted/30 h-96 flex items-center justify-center">
      <div
        className="bg-white border shadow-sm flex items-center justify-center"
        style={{
          width: Math.min(canvas.width / 2, 400),
          height: Math.min(canvas.height / 2, 300),
        }}
      >
        <div className="text-center">
          <h3 className="font-semibold mb-2">Design Canvas</h3>
          <p className="text-sm text-muted-foreground">
            Canvas: {canvas.width} × {canvas.height}px
          </p>
          <p className="text-sm text-muted-foreground">
            Layers: {canvas.layers?.length || 0}
          </p>
          <p className="text-sm text-muted-foreground">
            Zoom: {Math.round(zoom * 100)}%
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            Click to start editing
          </div>
        </div>
      </div>
    </div>
    <div className="mt-4 flex justify-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setZoom(zoom * 0.9)}>
        Zoom Out
      </Button>
      <Button variant="outline" size="sm" onClick={() => setZoom(1)}>
        Reset Zoom
      </Button>
      <Button variant="outline" size="sm" onClick={() => setZoom(zoom * 1.1)}>
        Zoom In
      </Button>
    </div>
  </div>
);

const DesignPreviewComponent = ({ design }: any) => (
  <div className="p-4">
    <div className="border rounded-lg bg-white p-8 flex items-center justify-center">
      {design?.preview ? (
        <img
          src={design.preview}
          alt={design.name}
          className="max-w-full max-h-64 object-contain"
        />
      ) : (
        <div className="text-center text-muted-foreground">
          <Eye className="h-12 w-12 mx-auto mb-2" />
          <p>Preview will appear here</p>
          <p className="text-sm mt-1">Save your design to generate a preview</p>
        </div>
      )}
    </div>
  </div>
);

export default function EditDesignPage() {
  const { id } = useParams();
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch design data using design-studio hook
  const { data: design, isLoading, error } = useDesign(id as string);

  // Mutations using design-studio hooks
  const updateDesign = useUpdateDesign();
  const exportDesign = useExportDesign();

  // Load design data into canvas when design is fetched
  useEffect(() => {
    if (design) {
      setCanvas(design.customizations);
    }
  }, [design]);

  const handleCanvasChange = (newCanvas: CanvasData) => {
    setCanvas(newCanvas);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!design) return;

    try {
      const updateData: UpdateDesignDto = {
        customizations: canvas,
        name: design.name,
      };

      await updateDesign.mutateAsync({
        designId: design.id,
        values: updateData,
      });
      setHasUnsavedChanges(false);
      toast.success("Design saved successfully!");
    } catch (error) {
      console.error("Failed to save design:", error);
      toast.error("Failed to save design");
    }
  };

  const handleExport = async () => {
    if (!design) return;

    try {
      const exportData: ExportDesignDto = {
        format: "png",
        quality: "high",
        includeBleed: false,
        includeCropMarks: false,
      };

      await exportDesign.mutateAsync({
        designId: design.id,
        values: exportData,
      });
    } catch (error) {
      console.error("Failed to export design:", error);
      toast.error("Failed to export design");
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading design...</span>
        </div>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Design Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The design you&apos;re trying to edit doesn&apos;t exist or has been
          deleted.
        </p>
        <Button asChild>
          <Link href="/dashboard/customer/design-studio/saved-designs">
            Back to Designs
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-background border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <MoveLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{design.name}</h1>
              <Badge
                variant="outline"
                className={getStatusColor(design.status)}
              >
                {design.status}
              </Badge>
              {design.isTemplate && <Badge variant="secondary">Template</Badge>}
              {hasUnsavedChanges && <Badge variant="outline">Unsaved</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              {typeof design.product === "object" && design.product !== null
                ? (design.product as any).name || "Unknown Product"
                : "Unknown Product"}{" "}
              • Version {design.version}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/customer/design-studio/view/${design.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          <Button
            variant="secondary"
            onClick={handleSave}
            disabled={updateDesign.isPending || !hasUnsavedChanges}
          >
            {updateDesign.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
          <Button onClick={handleExport} disabled={exportDesign.isPending}>
            {exportDesign.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <DesignTools
          canvas={canvas}
          onCanvasChange={handleCanvasChange}
          selectedLayerId={selectedLayerId}
          onLayerSelect={setSelectedLayerId}
          tool={tool}
          onToolChange={setTool}
        />

        <main className="flex-1 overflow-auto">
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

      {/* Bottom Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="border-t">
        <TabsList className="rounded-none w-full justify-start">
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="p-4">
          <div className="text-center text-muted-foreground">
            <p>Design tools and controls are available in the left sidebar.</p>
            <p>Use the canvas above to edit your design.</p>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg inline-block">
              <p className="text-sm">
                💡 <strong>Tip:</strong> Use the zoom controls below the canvas
                to get a better view of your design.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="p-4">
          <DesignPreviewComponent design={design} />
        </TabsContent>

        <TabsContent value="history" className="p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Design History</h3>
            <div className="text-center text-muted-foreground py-8">
              <p>Version history will appear here</p>
              <p className="text-sm mt-2">Current version: {design.version}</p>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg inline-block">
                <p className="text-sm">
                  📝 <strong>Note:</strong> Version history tracking is coming
                  soon.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="p-4">
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-lg font-semibold">Design Settings</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Canvas Size</h4>
                <p className="text-sm text-muted-foreground">
                  {canvas.width} × {canvas.height}px
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Background</h4>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 border rounded"
                    style={{
                      backgroundColor: canvas.backgroundColor || "#ffffff",
                    }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {canvas.backgroundColor || "#ffffff"}
                  </span>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Layers</h4>
                <p className="text-sm text-muted-foreground">
                  {canvas.layers?.length || 0} layers
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Last Modified</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(design.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Design Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant="outline"
                    className={getStatusColor(design.status)}
                  >
                    {design.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Template:</span>
                  <span>{design.isTemplate ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Public:</span>
                  <span>{design.isPublic ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(design.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
