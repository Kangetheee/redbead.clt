/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Plus,
} from "lucide-react";
import {
  CanvasLayer,
  CanvasData,
} from "@/lib/design-studio/types/design-studio.types";
import { useFonts } from "@/hooks/use-design-studio";
import { ColorPicker } from "./color-picker";

interface TextToolProps {
  canvas: CanvasData;
  onCanvasChange: (canvas: CanvasData) => void;
  selectedLayerId?: string;
  onLayerSelect: (layerId: string) => void;
}

export function TextTool({
  canvas,
  onCanvasChange,
  selectedLayerId,
  onLayerSelect,
}: TextToolProps) {
  const [text, setText] = useState("Add your text here");
  const [fontSize, setFontSize] = useState([16]);
  const [color, setColor] = useState("#000000");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontStyle, setFontStyle] = useState("normal");
  const [textDecoration, setTextDecoration] = useState("none");
  const [textAlign, setTextAlign] = useState("left");

  const { data: fontsData } = useFonts();
  const fonts = fontsData || [];

  const selectedLayer = selectedLayerId
    ? canvas.layers.find((l) => l.id === selectedLayerId && l.type === "text")
    : null;

  useEffect(() => {
    if (selectedLayer) {
      const props = selectedLayer.properties as {
        text?: string;
        fontSize?: number;
        color?: string;
        fontFamily?: string;
        fontWeight?: string;
        fontStyle?: string;
        textDecoration?: string;
        textAlign?: string;
      };

      setText(props.text || "");
      setFontSize([props.fontSize || 16]);
      setColor(props.color || "#000000");
      setFontFamily(props.fontFamily || "Arial");
      setFontWeight(props.fontWeight || "normal");
      setFontStyle(props.fontStyle || "normal");
      setTextDecoration(props.textDecoration || "none");
      setTextAlign(props.textAlign || "left");
    }
  }, [selectedLayer]);

  const addTextLayer = () => {
    const newLayer: CanvasLayer = {
      id: `text_${Date.now()}`,
      type: "text",
      x: 50,
      y: 50,
      width: 200,
      height: 50,
      properties: {
        text,
        fontSize: fontSize[0],
        color,
        fontFamily,
        fontWeight,
        fontStyle,
        textDecoration,
        textAlign,
      },
    };

    const updatedLayers = [...canvas.layers, newLayer];
    onCanvasChange({ ...canvas, layers: updatedLayers });
    onLayerSelect(newLayer.id);
  };

  const updateSelectedLayer = (properties: Record<string, any>) => {
    if (!selectedLayer) return;

    const updatedLayers = canvas.layers.map((layer) =>
      layer.id === selectedLayer.id
        ? {
            ...layer,
            properties: { ...layer.properties, ...properties },
          }
        : layer
    );

    onCanvasChange({ ...canvas, layers: updatedLayers });
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (selectedLayer) {
      updateSelectedLayer({ text: newText });
    }
  };

  const handleFontSizeChange = (newSize: number[]) => {
    setFontSize(newSize);
    if (selectedLayer) {
      updateSelectedLayer({ fontSize: newSize[0] });
    }
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (selectedLayer) {
      updateSelectedLayer({ color: newColor });
    }
  };

  const handleFontFamilyChange = (newFamily: string) => {
    setFontFamily(newFamily);
    if (selectedLayer) {
      updateSelectedLayer({ fontFamily: newFamily });
    }
  };

  const toggleStyle = (style: "bold" | "italic" | "underline") => {
    if (style === "bold") {
      const newWeight = fontWeight === "bold" ? "normal" : "bold";
      setFontWeight(newWeight);
      if (selectedLayer) {
        updateSelectedLayer({ fontWeight: newWeight });
      }
    } else if (style === "italic") {
      const newStyle = fontStyle === "italic" ? "normal" : "italic";
      setFontStyle(newStyle);
      if (selectedLayer) {
        updateSelectedLayer({ fontStyle: newStyle });
      }
    } else if (style === "underline") {
      const newDecoration =
        textDecoration === "underline" ? "none" : "underline";
      setTextDecoration(newDecoration);
      if (selectedLayer) {
        updateSelectedLayer({ textDecoration: newDecoration });
      }
    }
  };

  const handleAlignmentChange = (alignment: string) => {
    setTextAlign(alignment);
    if (selectedLayer) {
      updateSelectedLayer({ textAlign: alignment });
    }
  };

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          Text Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Text Button */}
        <Button onClick={addTextLayer} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Text Layer
        </Button>

        {/* Text Content */}
        <div className="space-y-2">
          <Label htmlFor="text-content">Text Content</Label>
          <Textarea
            id="text-content"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter your text..."
            rows={3}
          />
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <Label>Font Family</Label>
          <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
              {fonts.map((font) => (
                <SelectItem key={font.id} value={font.family}>
                  {font.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <Label>Font Size: {fontSize[0]}px</Label>
          <Slider
            value={fontSize}
            onValueChange={handleFontSizeChange}
            min={8}
            max={120}
            step={1}
            className="w-full"
          />
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label>Text Color</Label>
          <ColorPicker value={color} onChange={handleColorChange} />
        </div>

        {/* Text Styles */}
        <div className="space-y-2">
          <Label>Text Style</Label>
          <div className="flex gap-1">
            <Button
              variant={fontWeight === "bold" ? "default" : "outline"}
              size="sm"
              onClick={() => toggleStyle("bold")}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={fontStyle === "italic" ? "default" : "outline"}
              size="sm"
              onClick={() => toggleStyle("italic")}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={textDecoration === "underline" ? "default" : "outline"}
              size="sm"
              onClick={() => toggleStyle("underline")}
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Text Alignment */}
        <div className="space-y-2">
          <Label>Text Alignment</Label>
          <div className="flex gap-1">
            <Button
              variant={textAlign === "left" ? "default" : "outline"}
              size="sm"
              onClick={() => handleAlignmentChange("left")}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={textAlign === "center" ? "default" : "outline"}
              size="sm"
              onClick={() => handleAlignmentChange("center")}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={textAlign === "right" ? "default" : "outline"}
              size="sm"
              onClick={() => handleAlignmentChange("right")}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selected Layer Info */}
        {selectedLayer && (
          <div className="text-xs text-muted-foreground p-2 bg-accent rounded">
            Editing:{" "}
            {(selectedLayer.properties as { text?: string })?.text ||
              "Image Layer"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
