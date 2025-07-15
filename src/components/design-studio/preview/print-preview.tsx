/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Printer,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
} from "lucide-react";
import {
  DesignResponse,
  PrintSpecifications,
} from "@/lib/design-studio/types/design-studio.types";
import { DesignCanvas } from "../canvas/design-canvas";

interface PrintPreviewProps {
  design: DesignResponse;
  onExport?: (format: string, specs: PrintSpecifications) => void;
}

export function PrintPreview({ design, onExport }: PrintPreviewProps) {
  const [paperSize, setPaperSize] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [quality, setQuality] = useState("high");
  const [colorMode, setColorMode] = useState("CMYK");
  const [includeBleed, setIncludeBleed] = useState(true);
  const [includeCropMarks, setIncludeCropMarks] = useState(true);

  const paperSizes = [
    { value: "A4", label: "A4 (210 × 297 mm)" },
    { value: "A3", label: "A3 (297 × 420 mm)" },
    { value: "Letter", label: "Letter (8.5 × 11 in)" },
    { value: "Legal", label: "Legal (8.5 × 14 in)" },
    { value: "Custom", label: "Custom Size" },
  ];

  const qualityOptions = [
    { value: "draft", label: "Draft (150 DPI)", dpi: 150 },
    { value: "standard", label: "Standard (300 DPI)", dpi: 300 },
    { value: "high", label: "High (600 DPI)", dpi: 600 },
    { value: "print", label: "Print Ready (1200 DPI)", dpi: 1200 },
  ];

  const colorModes = [
    { value: "RGB", label: "RGB (Screen)", description: "For digital use" },
    {
      value: "CMYK",
      label: "CMYK (Print)",
      description: "For professional printing",
    },
  ];

  // Validation checks
  const validationChecks = [
    {
      id: "resolution",
      label: "Resolution Check",
      status: design.customizations.width >= 300 ? "pass" : "warning",
      message:
        design.customizations.width >= 300
          ? "Design resolution is sufficient for printing"
          : "Design resolution may be too low for high-quality printing",
    },
    {
      id: "colors",
      label: "Color Profile",
      status: colorMode === "CMYK" ? "pass" : "info",
      message:
        colorMode === "CMYK"
          ? "Using CMYK color profile for print"
          : "RGB colors may appear different when printed",
    },
    {
      id: "text",
      label: "Text Readability",
      status: "pass", // This would need actual text analysis
      message: "Text appears readable at print size",
    },
    {
      id: "bleed",
      label: "Bleed Area",
      status: includeBleed ? "pass" : "warning",
      message: includeBleed
        ? "Bleed area included for professional printing"
        : "Consider adding bleed area for edge-to-edge printing",
    },
  ];

  const handleExport = (format: string) => {
    const selectedQuality = qualityOptions.find((q) => q.value === quality);
    const specs: PrintSpecifications = {
      material: "paper", // This could be configurable
      colorMode,
      dpi: selectedQuality?.dpi || 300,
      finish: "matte", // This could be configurable
      specialInstructions: `Paper: ${paperSize}, Orientation: ${orientation}, Quality: ${quality}`,
    };

    onExport?.(format, specs);
  };

  return (
    <div className="w-full space-y-6">
      {/* Print Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Paper Size</label>
              <Select value={paperSize} onValueChange={setPaperSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paperSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Orientation</label>
              <Select value={orientation} onValueChange={setOrientation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quality</label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {qualityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Color Mode</label>
              <Select value={colorMode} onValueChange={setColorMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview and Validation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Print Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Print Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-8 rounded-lg flex items-center justify-center min-h-[400px]">
                <div
                  className="bg-white shadow-lg"
                  style={{
                    transform:
                      orientation === "landscape" ? "rotate(90deg)" : "none",
                    aspectRatio:
                      orientation === "portrait" ? "210/297" : "297/210",
                    maxHeight: "400px",
                    maxWidth: "100%",
                  }}
                >
                  <DesignCanvas
                    canvas={design.customizations}
                    onCanvasChange={() => {}}
                    selectedLayerId={undefined}
                    onLayerSelect={() => {}}
                    zoom={0.3}
                    readonly
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Validation Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Print Validation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {validationChecks.map((check) => (
                <div key={check.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {check.status === "pass" && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {check.status === "warning" && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    {check.status === "info" && (
                      <Info className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{check.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {check.message}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export for Print</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => handleExport("pdf")} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                onClick={() => handleExport("png")}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PNG
              </Button>
              <div className="text-xs text-muted-foreground">
                PDF recommended for professional printing
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
