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
  CanvasElement,
  CanvasData,
} from "@/lib/design-studio/types/design-studio.types";
import { useFonts } from "@/hooks/use-design-studio";
import { ColorPicker } from "./color-picker";

interface TextToolProps {
  canvas: CanvasData;
  onCanvasChange: (canvas: CanvasData) => void;
  selectedElementId?: string | null;
  onElementSelect: (elementId: string) => void;
}

export function TextTool({
  canvas,
  onCanvasChange,
  selectedElementId,
  onElementSelect,
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

  const selectedElement = selectedElementId
    ? canvas.elements.find(
        (e) => e.id === selectedElementId && e.type === "text"
      )
    : null;

  useEffect(() => {
    if (selectedElement) {
      setText(selectedElement.content || "");
      setFontSize([selectedElement.fontSize || 16]);
      setColor(selectedElement.color || "#000000");
      setFontFamily(selectedElement.font || "Arial");
      setFontWeight(selectedElement.fontWeight || "normal");
      setFontStyle((selectedElement.properties as any)?.fontStyle || "normal");
      setTextDecoration(
        (selectedElement.properties as any)?.textDecoration || "none"
      );
      setTextAlign((selectedElement.properties as any)?.textAlign || "left");
    }
  }, [selectedElement]);

  const addTextElement = () => {
    const newElement: CanvasElement = {
      id: `text_${Date.now()}`,
      type: "text",
      x: 50,
      y: 50,
      width: 200,
      height: 50,
      content: text,
      font: fontFamily,
      fontSize: fontSize[0],
      fontWeight,
      color,
      properties: {
        fontStyle,
        textDecoration,
        textAlign,
      },
    };

    const updatedElements = [...canvas.elements, newElement];
    onCanvasChange({ ...canvas, elements: updatedElements });
    onElementSelect(newElement.id);
  };

  const updateSelectedElement = (updates: Partial<CanvasElement>) => {
    if (!selectedElement) return;

    const updatedElements = canvas.elements.map((element) =>
      element.id === selectedElement.id ? { ...element, ...updates } : element
    );

    onCanvasChange({ ...canvas, elements: updatedElements });
  };

  const updateSelectedElementProperties = (properties: Record<string, any>) => {
    if (!selectedElement) return;

    const updatedElements = canvas.elements.map((element) =>
      element.id === selectedElement.id
        ? {
            ...element,
            properties: { ...element.properties, ...properties },
          }
        : element
    );

    onCanvasChange({ ...canvas, elements: updatedElements });
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (selectedElement) {
      updateSelectedElement({ content: newText });
    }
  };

  const handleFontSizeChange = (newSize: number[]) => {
    setFontSize(newSize);
    if (selectedElement) {
      updateSelectedElement({ fontSize: newSize[0] });
    }
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (selectedElement) {
      updateSelectedElement({ color: newColor });
    }
  };

  const handleFontFamilyChange = (newFamily: string) => {
    setFontFamily(newFamily);
    if (selectedElement) {
      updateSelectedElement({ font: newFamily });
    }
  };

  const toggleStyle = (style: "bold" | "italic" | "underline") => {
    if (style === "bold") {
      const newWeight = fontWeight === "bold" ? "normal" : "bold";
      setFontWeight(newWeight);
      if (selectedElement) {
        updateSelectedElement({ fontWeight: newWeight });
      }
    } else if (style === "italic") {
      const currentStyle =
        (selectedElement?.properties as any)?.fontStyle || "normal";
      const newStyle = currentStyle === "italic" ? "normal" : "italic";
      setFontStyle(newStyle);
      if (selectedElement) {
        updateSelectedElementProperties({ fontStyle: newStyle });
      }
    } else if (style === "underline") {
      const currentDecoration =
        (selectedElement?.properties as any)?.textDecoration || "none";
      const newDecoration =
        currentDecoration === "underline" ? "none" : "underline";
      setTextDecoration(newDecoration);
      if (selectedElement) {
        updateSelectedElementProperties({ textDecoration: newDecoration });
      }
    }
  };

  const handleAlignmentChange = (alignment: string) => {
    setTextAlign(alignment);
    if (selectedElement) {
      updateSelectedElementProperties({ textAlign: alignment });
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
        <Button onClick={addTextElement} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Text Element
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
              variant={
                (selectedElement?.properties as any)?.fontStyle === "italic" ||
                fontStyle === "italic"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => toggleStyle("italic")}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={
                (selectedElement?.properties as any)?.textDecoration ===
                  "underline" || textDecoration === "underline"
                  ? "default"
                  : "outline"
              }
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
              variant={
                (selectedElement?.properties as any)?.textAlign === "left" ||
                textAlign === "left"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => handleAlignmentChange("left")}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={
                (selectedElement?.properties as any)?.textAlign === "center" ||
                textAlign === "center"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => handleAlignmentChange("center")}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={
                (selectedElement?.properties as any)?.textAlign === "right" ||
                textAlign === "right"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => handleAlignmentChange("right")}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selected Element Info */}
        {selectedElement && (
          <div className="text-xs text-muted-foreground p-2 bg-accent rounded">
            Editing: {selectedElement.content || "Text Element"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
