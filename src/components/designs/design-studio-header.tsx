import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  Share2,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DesignResponse } from "@/lib/design-studio/types/design-studio.types";
import { DesignTemplate } from "@/lib/design-templates/types/design-template.types";
import { ExportDesignDto } from "@/lib/design-studio/dto/design-studio.dto";
import ExportDialog from "./export-dialog";

interface DesignStudioHeaderProps {
  selectedTemplate: DesignTemplate;
  currentDesign: DesignResponse | null;
  showBackToTemplates: boolean;
  isPreviewMode: boolean;
  lastSavedAt: Date | null;
  hasUnsavedChanges: boolean;
  enableAutoSave: boolean;
  onBack: () => void;
  onPreviewToggle: () => void;
  onValidate: () => void;
  onShare: () => void;
  onSave: () => void;
  onExport: () => void;
  isValidating: boolean;
  isSharing: boolean;
  isSaving: boolean;
  exportForm: UseFormReturn<ExportDesignDto>;
  isExporting: boolean;
}

export default function DesignStudioHeader({
  selectedTemplate,
  currentDesign,
  showBackToTemplates,
  isPreviewMode,
  lastSavedAt,
  hasUnsavedChanges,
  enableAutoSave,
  onBack,
  onPreviewToggle,
  onValidate,
  onShare,
  onSave,
  onExport,
  isValidating,
  isSharing,
  isSaving,
  exportForm,
  isExporting,
}: DesignStudioHeaderProps) {
  const formatLastSaved = (date: Date | null) => {
    if (!date) return "Never saved";

    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "Saved just now";
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `Saved ${Math.floor(diff / 3600)}h ago`;
    return `Saved ${date.toLocaleDateString()}`;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          {showBackToTemplates && (
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Templates
            </Button>
          )}
          <div
            className={`${showBackToTemplates ? "border-l border-gray-300 pl-4" : ""}`}
          >
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-gray-900">
                {currentDesign?.name || selectedTemplate.name}
              </h1>

              {/* Save Status Indicator */}
              <div className="flex items-center space-x-2">
                {enableAutoSave && (
                  <Badge
                    variant={hasUnsavedChanges ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {hasUnsavedChanges ? (
                      <>
                        <WifiOff className="w-3 h-3 mr-1" />
                        Auto-saving...
                      </>
                    ) : (
                      <>
                        <Wifi className="w-3 h-3 mr-1" />
                        Auto-saved
                      </>
                    )}
                  </Badge>
                )}

                {hasUnsavedChanges && !enableAutoSave && (
                  <Badge variant="destructive" className="text-xs">
                    Unsaved changes
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-1">
              <p className="text-sm text-gray-500">
                {selectedTemplate.category.name} •{" "}
                {selectedTemplate.product.name}
                {currentDesign && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {currentDesign.status}
                  </span>
                )}
              </p>

              {lastSavedAt && (
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatLastSaved(lastSavedAt)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={onPreviewToggle}>
            <Eye className="w-4 h-4 mr-2" />
            {isPreviewMode ? "Edit" : "Preview"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onValidate}
            disabled={isValidating || !currentDesign}
            title={
              !currentDesign
                ? "Save design first to validate"
                : "Validate design for print readiness"
            }
          >
            {isValidating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Validate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            disabled={isSharing || !currentDesign}
            title={
              !currentDesign
                ? "Save design first to share"
                : "Share design with others"
            }
          >
            {isSharing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Share2 className="w-4 h-4 mr-2" />
            )}
            Share
          </Button>

          <Button
            variant="outline"
            onClick={onSave}
            disabled={isSaving || (enableAutoSave && !hasUnsavedChanges)}
            title={
              enableAutoSave && !hasUnsavedChanges
                ? "All changes are auto-saved"
                : "Save your design"
            }
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>

          <ExportDialog
            exportForm={exportForm}
            onExport={onExport}
            isExporting={isExporting}
          />
        </div>
      </div>
    </header>
  );
}
