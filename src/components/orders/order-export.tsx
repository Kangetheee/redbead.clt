/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Loader2,
  AlertTriangle,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

import { OrderListItem } from "@/lib/orders/types/orders.types";
import { GetOrdersDto } from "@/lib/orders/dto/orders.dto";

interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  format: "CSV" | "XLSX" | "PDF" | "JSON";
  fileExtension: string;
  maxRecords?: number;
}

interface ExportField {
  key: string;
  label: string;
  description?: string;
  category: "basic" | "items" | "advanced";
  required?: boolean;
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
  format: string;
  filters?: Partial<GetOrdersDto>;
}

interface OrderExportProps {
  orders?: OrderListItem[];
  filters?: GetOrdersDto;
  onExport?: (data: any) => void;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: "csv",
    name: "CSV Export",
    description: "Comma-separated values for spreadsheet applications",
    icon: FileSpreadsheet,
    format: "CSV",
    fileExtension: "csv",
  },
  {
    id: "xlsx",
    name: "Excel Export",
    description: "Microsoft Excel format with formatting",
    icon: FileSpreadsheet,
    format: "XLSX",
    fileExtension: "xlsx",
    maxRecords: 10000,
  },
  {
    id: "pdf",
    name: "PDF Report",
    description: "Formatted PDF document for printing",
    icon: FileText,
    format: "PDF",
    fileExtension: "pdf",
    maxRecords: 1000,
  },
  {
    id: "json",
    name: "JSON Export",
    description: "Machine-readable JSON format",
    icon: FileJson,
    format: "JSON",
    fileExtension: "json",
  },
];

// Updated fields to match OrderListItem structure
const EXPORT_FIELDS: ExportField[] = [
  // Basic fields
  {
    key: "orderNumber",
    label: "Order Number",
    category: "basic",
    required: true,
  },
  { key: "status", label: "Order Status", category: "basic", required: true },
  { key: "createdAt", label: "Order Date", category: "basic", required: true },
  {
    key: "totalAmount",
    label: "Total Amount",
    category: "basic",
    required: true,
  },
  { key: "templateId", label: "Template ID", category: "basic" },

  // Items fields
  { key: "itemCount", label: "Number of Items", category: "items" },
  { key: "totalQuantity", label: "Total Quantity", category: "items" },
  { key: "templateNames", label: "Template Names", category: "items" },

  // Advanced fields
  {
    key: "designApprovalRequired",
    label: "Design Approval Required",
    category: "advanced",
  },
  {
    key: "designApprovalStatus",
    label: "Design Approval Status",
    category: "advanced",
  },
];

const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: "basic_summary",
    name: "Basic Order Summary",
    description: "Essential order information for general reporting",
    fields: [
      "orderNumber",
      "status",
      "createdAt",
      "totalAmount",
      "templateId",
      "itemCount",
    ],
    format: "CSV",
  },
  {
    id: "design_approval_report",
    name: "Design Approval Report",
    description: "Orders requiring design approval",
    fields: [
      "orderNumber",
      "createdAt",
      "totalAmount",
      "designApprovalRequired",
      "designApprovalStatus",
    ],
    format: "XLSX",
  },
  {
    id: "template_analysis",
    name: "Template Analysis",
    description: "Order patterns by template",
    fields: [
      "orderNumber",
      "templateId",
      "createdAt",
      "totalAmount",
      "itemCount",
    ],
    format: "CSV",
  },
];

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function OrderExport({
  orders = [],
  filters,
  onExport,
}: OrderExportProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ExportOption>(
    EXPORT_OPTIONS[0]
  );
  const [selectedFields, setSelectedFields] = useState<string[]>(
    EXPORT_FIELDS.filter((f) => f.required).map((f) => f.key)
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customFilename, setCustomFilename] = useState("");
  const [emailExport, setEmailExport] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedFiles, setExportedFiles] = useState<
    Array<{
      name: string;
      size: string;
      timestamp: string;
      format: string;
    }>
  >([]);

  // Categorize fields
  const fieldsByCategory = useMemo(() => {
    return EXPORT_FIELDS.reduce(
      (acc, field) => {
        if (!acc[field.category]) {
          acc[field.category] = [];
        }
        acc[field.category].push(field);
        return acc;
      },
      {} as Record<string, ExportField[]>
    );
  }, []);

  // Calculate export size estimate
  const exportEstimate = useMemo(() => {
    const recordCount = orders.length;
    const fieldCount = selectedFields.length;
    const avgFieldSize = 20; // bytes
    const estimatedSize = recordCount * fieldCount * avgFieldSize;

    return {
      records: recordCount,
      fields: fieldCount,
      estimatedSize: formatBytes(estimatedSize),
    };
  }, [orders.length, selectedFields.length]);

  const handleTemplateSelect = (templateId: string) => {
    const template = EXPORT_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSelectedFields(template.fields);
      const format = EXPORT_OPTIONS.find((o) => o.format === template.format);
      if (format) {
        setSelectedOption(format);
      }
    }
  };

  const handleFieldToggle = (fieldKey: string) => {
    const field = EXPORT_FIELDS.find((f) => f.key === fieldKey);
    if (field?.required) return; // Can't deselect required fields

    if (selectedFields.includes(fieldKey)) {
      setSelectedFields(selectedFields.filter((f) => f !== fieldKey));
    } else {
      setSelectedFields([...selectedFields, fieldKey]);
    }
  };

  const transformOrderData = (order: OrderListItem) => {
    const data: Record<string, any> = {};

    selectedFields.forEach((fieldKey) => {
      switch (fieldKey) {
        case "orderNumber":
          data[fieldKey] = order.orderNumber;
          break;
        case "status":
          data[fieldKey] = order.status;
          break;
        case "createdAt":
          data[fieldKey] = format(
            new Date(order.createdAt),
            "yyyy-MM-dd HH:mm:ss"
          );
          break;
        case "totalAmount":
          data[fieldKey] = order.totalAmount;
          break;
        case "templateId":
          data[fieldKey] = order.templateId || "";
          break;
        case "itemCount":
          data[fieldKey] = order.orderItems.length;
          break;
        case "totalQuantity":
          data[fieldKey] = order.orderItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          break;
        case "templateNames":
          data[fieldKey] = order.orderItems
            .map((item) => item.template?.name || `Template ${item.template}`)
            .join(", ");
          break;
        case "designApprovalRequired":
          data[fieldKey] = order.designApprovalRequired ? "Yes" : "No";
          break;
        case "designApprovalStatus":
          data[fieldKey] = order.designApprovalStatus || "";
          break;
        default:
          data[fieldKey] = "";
      }
    });

    return data;
  };

  const generateFilename = () => {
    if (customFilename.trim()) {
      return `${customFilename}.${selectedOption.fileExtension}`;
    }

    const timestamp = format(new Date(), "yyyy-MM-dd-HHmm");
    const filterSuffix = filters?.status ? `-${filters.status}` : "";
    return `orders-export${filterSuffix}-${timestamp}.${selectedOption.fileExtension}`;
  };

  const executeExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Transform data
      const exportData = orders.map(transformOrderData);

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Generate file based on format
      const filename = generateFilename();
      let fileContent: string;
      let mimeType: string;

      switch (selectedOption.format) {
        case "CSV":
          fileContent = generateCSV(exportData);
          mimeType = "text/csv";
          break;
        case "JSON":
          fileContent = JSON.stringify(exportData, null, 2);
          mimeType = "application/json";
          break;
        case "XLSX":
        case "PDF":
          // In a real app, you'd use libraries like xlsx or jsPDF
          fileContent = generateCSV(exportData); // Fallback to CSV
          mimeType = "text/csv";
          break;
        default:
          throw new Error("Unsupported export format");
      }

      // Download file
      downloadFile(fileContent, filename, mimeType);

      // Add to exported files list
      setExportedFiles((prev) => [
        {
          name: filename,
          size: formatBytes(fileContent.length),
          timestamp: new Date().toISOString(),
          format: selectedOption.format,
        },
        ...prev,
      ]);

      // Send email if requested
      if (emailExport && emailAddress) {
        // In a real app, you'd call an API to send the email
        console.log(`Email export sent to: ${emailAddress}`);
      }

      onExport?.(exportData);
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const generateCSV = (data: any[]): string => {
    if (data.length === 0) return "";

    const headers = selectedFields.map((fieldKey) => {
      const field = EXPORT_FIELDS.find((f) => f.key === fieldKey);
      return field?.label || fieldKey;
    });

    const csvRows = [];

    if (includeHeaders) {
      csvRows.push(headers.join(","));
    }

    data.forEach((row) => {
      const values = selectedFields.map((fieldKey) => {
        const value = row[fieldKey] || "";
        // Escape commas and quotes
        return typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      });
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const canExport = selectedFields.length > 0 && orders.length > 0;
  const exceedsLimit =
    selectedOption.maxRecords && orders.length > selectedOption.maxRecords;

  return (
    <div className="space-y-4">
      {/* Quick Export Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExportDialogOpen(true)}
          disabled={orders.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Orders ({orders.length})
        </Button>

        {/* Quick export templates */}
        {EXPORT_TEMPLATES.slice(0, 2).map((template) => (
          <Button
            key={template.id}
            variant="ghost"
            size="sm"
            onClick={() => {
              handleTemplateSelect(template.id);
              setIsExportDialogOpen(true);
            }}
            disabled={orders.length === 0}
          >
            {template.name}
          </Button>
        ))}
      </div>

      {/* Recent Exports */}
      {exportedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Exports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exportedFiles.slice(0, 3).map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{file.name}</span>
                    <Badge variant="outline">{file.format}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{file.size}</span>
                    <span>•</span>
                    <span>{format(new Date(file.timestamp), "HH:mm")}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Export Orders</DialogTitle>
            <DialogDescription>
              Configure and download order data in your preferred format
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Export Options */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Export Format</Label>
              <div className="grid grid-cols-2 gap-3">
                {EXPORT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-colors ${
                        selectedOption.id === option.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedOption(option)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-medium">{option.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                            {option.maxRecords && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Max {option.maxRecords.toLocaleString()} records
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {exceedsLimit && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Selected format supports maximum{" "}
                  {selectedOption.maxRecords?.toLocaleString()} records, but you
                  have {orders.length.toLocaleString()} orders. Consider
                  filtering your data or choosing a different format.
                </AlertDescription>
              </Alert>
            )}

            {/* Templates */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Quick Templates</Label>
              <div className="grid grid-cols-2 gap-2">
                {EXPORT_TEMPLATES.map((template) => (
                  <Button
                    key={template.id}
                    variant={
                      selectedTemplate === template.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleTemplateSelect(template.id)}
                    className="justify-start"
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Field Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Fields to Export
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSelectedFields(EXPORT_FIELDS.map((f) => f.key))
                    }
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSelectedFields(
                        EXPORT_FIELDS.filter((f) => f.required).map(
                          (f) => f.key
                        )
                      )
                    }
                  >
                    Required Only
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {Object.entries(fieldsByCategory).map(([category, fields]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {category} Fields
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {fields.map((field) => (
                        <div
                          key={field.key}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={field.key}
                            checked={selectedFields.includes(field.key)}
                            onCheckedChange={() => handleFieldToggle(field.key)}
                            disabled={field.required}
                          />
                          <Label
                            htmlFor={field.key}
                            className={`text-sm ${field.required ? "font-medium" : ""}`}
                          >
                            {field.label}
                            {field.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Export Options */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Export Settings</Label>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeHeaders" className="text-sm">
                      Include Headers
                    </Label>
                    <Switch
                      id="includeHeaders"
                      checked={includeHeaders}
                      onCheckedChange={setIncludeHeaders}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customFilename" className="text-sm">
                      Custom Filename
                    </Label>
                    <Input
                      id="customFilename"
                      value={customFilename}
                      onChange={(e) => setCustomFilename(e.target.value)}
                      placeholder="orders-export"
                    />
                    <p className="text-xs text-muted-foreground">
                      Will be saved as: {generateFilename()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Delivery Options
                </Label>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailExport" className="text-sm">
                      Email Export
                    </Label>
                    <Switch
                      id="emailExport"
                      checked={emailExport}
                      onCheckedChange={setEmailExport}
                    />
                  </div>

                  {emailExport && (
                    <div className="space-y-2">
                      <Label htmlFor="emailAddress" className="text-sm">
                        Email Address
                      </Label>
                      <Input
                        id="emailAddress"
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Export Summary */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p>
                    <strong>Export Summary:</strong>
                  </p>
                  <p>• Records: {exportEstimate.records.toLocaleString()}</p>
                  <p>• Fields: {exportEstimate.fields}</p>
                  <p>• Estimated size: {exportEstimate.estimatedSize}</p>
                  <p>• Format: {selectedOption.format}</p>
                </div>
              </AlertDescription>
            </Alert>

            {/* Progress */}
            {isExporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Exporting orders...</span>
                  <span>{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={executeExport}
              disabled={!canExport || exceedsLimit || isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export {orders.length} Orders
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
