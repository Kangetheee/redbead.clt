"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presetColors = [
    "#000000",
    "#ffffff",
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
  ];

  const handleColorChange = (color: string) => {
    onChange(color);
  };

  const isValidHex = (hex: string) => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
  };

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: value }}
              />
              <span>{value}</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="space-y-4">
              <div>
                <Label>Color Presets</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        handleColorChange(color);
                        setIsOpen(false);
                      }}
                      className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: color,
                        borderColor: value === color ? "#3b82f6" : "#e5e7eb",
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div>
                <Label htmlFor="color-input">Color Picker</Label>
                <input
                  id="color-input"
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full h-10 rounded border cursor-pointer"
                />
              </div>

              <div>
                <Label htmlFor="hex-input">Hex Color</Label>
                <Input
                  id="hex-input"
                  type="text"
                  value={value}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue.startsWith("#") && newValue.length <= 7) {
                      if (newValue.length === 7 && isValidHex(newValue)) {
                        handleColorChange(newValue);
                      } else if (newValue.length < 7) {
                        // Allow typing
                        onChange(newValue);
                      }
                    }
                  }}
                  placeholder="#000000"
                  maxLength={7}
                />
              </div>

              {/* RGB Input */}
              <div>
                <Label>RGB Values</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="R"
                    min="0"
                    max="255"
                    onChange={(e) => {
                      const r = parseInt(e.target.value) || 0;
                      const hex = value.slice(1);
                      const g = parseInt(hex.slice(2, 4), 16) || 0;
                      const b = parseInt(hex.slice(4, 6), 16) || 0;
                      const newHex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
                      handleColorChange(newHex);
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="G"
                    min="0"
                    max="255"
                    onChange={(e) => {
                      const g = parseInt(e.target.value) || 0;
                      const hex = value.slice(1);
                      const r = parseInt(hex.slice(0, 2), 16) || 0;
                      const b = parseInt(hex.slice(4, 6), 16) || 0;
                      const newHex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
                      handleColorChange(newHex);
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="B"
                    min="0"
                    max="255"
                    onChange={(e) => {
                      const b = parseInt(e.target.value) || 0;
                      const hex = value.slice(1);
                      const r = parseInt(hex.slice(0, 2), 16) || 0;
                      const g = parseInt(hex.slice(2, 4), 16) || 0;
                      const newHex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
                      handleColorChange(newHex);
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
}
