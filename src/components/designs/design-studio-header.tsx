import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  Share2,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DesignResponse } from "@/lib/design-studio/types/design-studio.types";
import { DesignTemplate } from "@/lib/design-templates/types/design-template.types";
import ExportDialog from "./export-dialog";

interface DesignStudioHeaderProps {
  selectedTemplate: DesignTemplate;
  currentDesign: DesignResponse | null;
  showBackToTemplates: boolean;
  isPreviewMode: boolean;
  onBack: () => void;
  onPreviewToggle: () => void;
  onValidate: () => void;
  onShare: () => void;
  onSave: () => void;
  onExport: () => void;
  isValidating: boolean;
  isSharing: boolean;
  isSaving: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exportForm: UseFormReturn<any>;
  isExporting: boolean;
}

export default function DesignStudioHeader({
  selectedTemplate,
  currentDesign,
  showBackToTemplates,
  isPreviewMode,
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
            <h1 className="text-lg font-semibold text-gray-900">
              {currentDesign?.name || selectedTemplate.name}
            </h1>
            <p className="text-sm text-gray-500">
              {selectedTemplate.category.name} • {selectedTemplate.product.name}
              {currentDesign && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  {currentDesign.status}
                </span>
              )}
            </p>
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
            disabled={isValidating}
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
            disabled={isSharing}
          >
            {isSharing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Share2 className="w-4 h-4 mr-2" />
            )}
            Share
          </Button>

          <Button variant="outline" onClick={onSave} disabled={isSaving}>
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
