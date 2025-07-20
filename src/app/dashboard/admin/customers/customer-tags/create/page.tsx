/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Separator } from "@/src/components/ui/separator";
import { ArrowLeft, Save, Tag, Palette, AlertCircle, Eye } from "lucide-react";
import Link from "next/link";

interface TagFormData {
  name: string;
  color: string;
}

interface TagFormErrors {
  name?: string;
  color?: string;
}

const predefinedColors = [
  "#FF6B35", // Orange
  "#F7931E", // Light Orange
  "#FFD700", // Gold
  "#2E8B57", // Sea Green
  "#4169E1", // Royal Blue
  "#8B4513", // Saddle Brown
  "#DC143C", // Crimson
  "#9932CC", // Dark Orchid
  "#FF1493", // Deep Pink
  "#00CED1", // Dark Turquoise
  "#32CD32", // Lime Green
  "#FF4500", // Red Orange
];

const getTagStyle = (color: string) => {
  if (!color) return "bg-gray-100 text-gray-800 border-gray-200";

  // Convert hex color to appropriate text color
  const brightness =
    parseInt(color.slice(1, 3), 16) * 0.299 +
    parseInt(color.slice(3, 5), 16) * 0.587 +
    parseInt(color.slice(5, 7), 16) * 0.114;

  const textColor = brightness > 128 ? "#000000" : "#FFFFFF";

  return {
    backgroundColor: color,
    color: textColor,
    borderColor: color,
  };
};

export default function CreateCustomerTagPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<TagFormData>({
    name: "",
    color: predefinedColors[0],
  });
  const [errors, setErrors] = useState<TagFormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: TagFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tag name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Tag name must be at least 2 characters";
    } else if (formData.name.length > 50) {
      newErrors.name = "Tag name must be less than 50 characters";
    }

    if (!formData.color || !formData.color.match(/^#[0-9A-Fa-f]{6}$/)) {
      newErrors.color = "Please select a valid color";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // API call to create tag
      const tagData = {
        name: formData.name.trim(),
        color: formData.color,
      };

      console.log("Creating tag:", tagData);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to tags list
      router.push("/admin/customer-tags");
    } catch (error) {
      console.error("Error creating tag:", error);
      setErrors({ name: "Failed to create tag. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleColorSelect = (color: string) => {
    setFormData((prev) => ({ ...prev, color }));
    if (errors.color) {
      setErrors((prev) => ({ ...prev, color: undefined }));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({ ...prev, name }));
    if (errors.name && name.trim()) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" asChild>
          <Link href="/admin/customer-tags">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tags
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create Customer Tag
          </h1>
          <p className="text-gray-600">
            Add a new tag to organize your customers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="w-5 h-5" />
                <span>Tag Information</span>
              </CardTitle>
              <CardDescription>
                Define the name and color for your new customer tag
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tag Name */}
                <div>
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Tag Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="Enter tag name (e.g., VIP Customer, High Volume)"
                    className={
                      errors.name ? "border-red-300 focus:border-red-500" : ""
                    }
                    maxLength={50}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.name.length}/50 characters
                  </p>
                </div>

                <Separator />

                {/* Color Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-4 block">
                    Tag Color <span className="text-red-500">*</span>
                  </Label>

                  {/* Predefined Colors */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-3">
                        Choose from predefined colors:
                      </p>
                      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => handleColorSelect(color)}
                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                              formData.color === color
                                ? "border-gray-900 shadow-lg"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Custom Color */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Or choose a custom color:
                      </p>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => handleColorSelect(e.target.value)}
                          className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.color}
                          onChange={(e) => handleColorSelect(e.target.value)}
                          placeholder="#FF6B35"
                          className="w-24 font-mono text-sm"
                          pattern="^#[0-9A-Fa-f]{6}$"
                        />
                      </div>
                      {errors.color && (
                        <p className="text-sm text-red-600 mt-1 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.color}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" asChild type="button">
                    <Link href="/admin/customer-tags">Cancel</Link>
                  </Button>

                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Save className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Tag
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Preview</span>
              </CardTitle>
              <CardDescription>See how your tag will look</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Tag Appearance
                  </Label>
                  <div className="mt-2">
                    {formData.name ? (
                      <Badge
                        className="font-medium px-3 py-1 text-sm"
                        style={getTagStyle(formData.color)}
                      >
                        {formData.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-400">
                        Enter tag name
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Color Details
                  </Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: formData.color }}
                      />
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {formData.color}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Guidelines</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900">Tag Naming</h4>
                  <ul className="text-gray-600 mt-1 space-y-1">
                    <li>• Keep it short and descriptive</li>
                    <li>• Use clear, actionable language</li>
                    <li>• Avoid special characters</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Color Selection</h4>
                  <ul className="text-gray-600 mt-1 space-y-1">
                    <li>• Choose distinct colors for easy identification</li>
                    <li>• Consider color accessibility</li>
                    <li>• Use consistent color meanings</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Example Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge
                  style={getTagStyle("#FFD700")}
                  className="font-medium px-3 py-1"
                >
                  VIP Customer
                </Badge>
                <Badge
                  style={getTagStyle("#FF6B35")}
                  className="font-medium px-3 py-1"
                >
                  High Volume
                </Badge>
                <Badge
                  style={getTagStyle("#2E8B57")}
                  className="font-medium px-3 py-1"
                >
                  Frequent Buyer
                </Badge>
                <Badge
                  style={getTagStyle("#DC143C")}
                  className="font-medium px-3 py-1"
                >
                  Needs Follow-up
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
