import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Eye,
  MoreHorizontal,
  Mail,
  FileText,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Badge,
  Table,
} from "lucide-react";
import {
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TableHead, TableBody } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@radix-ui/react-alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";
import { Select } from "@radix-ui/react-select";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { formatDate } from "date-fns";
import { Button } from "react-day-picker";

// Mock email templates data
const mockTemplates = [
  {
    id: "1",
    name: "Gentle Reminder",
    subject: "Design Approval Needed - Order #{orderNumber}",
    type: "APPROVAL_REQUEST",
    isDefault: true,
    isActive: true,
    usageCount: 245,
    lastUsed: "2024-01-16T14:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    content: `Hi {customerName},

We're excited to move forward with your order #{orderNumber}! 

We've prepared your design and would love for you to review and approve it. Please take a moment to check the preview and let us know if everything looks perfect.

Best regards,
The Design Team`,
    variables: ["customerName", "orderNumber", "companyName"],
  },
  {
    id: "2",
    name: "Urgent Follow-up",
    subject: "Urgent: Design Approval Required - Order #{orderNumber}",
    type: "APPROVAL_REMINDER",
    isDefault: false,
    isActive: true,
    usageCount: 89,
    lastUsed: "2024-01-15T09:20:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    content: `Dear {customerName},

We need your design approval to keep your order #{orderNumber} on schedule for the promised delivery date.

Please review the attached design at your earliest convenience.

Time-sensitive - please respond within 24 hours.

Thank you,
The Production Team`,
    variables: ["customerName", "orderNumber"],
  },
  {
    id: "3",
    name: "Final Notice",
    subject: "Final Notice: Design Approval Required - Order #{orderNumber}",
    type: "APPROVAL_FINAL",
    isDefault: false,
    isActive: true,
    usageCount: 34,
    lastUsed: "2024-01-14T16:45:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    content: `Dear {customerName},

This is a final reminder that we need your approval for order #{orderNumber} to proceed with production.

Without approval within 24 hours, your order may be delayed or cancelled.

Please respond immediately.

Urgent regards,
The Management Team`,
    variables: ["customerName", "orderNumber"],
  },
  {
    id: "4",
    name: "Approval Confirmation",
    subject: "Thank You - Design Approved for Order #{orderNumber}",
    type: "APPROVAL_CONFIRMED",
    isDefault: true,
    isActive: true,
    usageCount: 156,
    lastUsed: "2024-01-16T11:15:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    content: `Hi {customerName},

Thank you for approving the design for order #{orderNumber}!

Your order is now moving into production. We'll keep you updated on the progress and notify you when it's ready for shipment.

Estimated completion: {estimatedCompletion}

Best regards,
The Production Team`,
    variables: ["customerName", "orderNumber", "estimatedCompletion"],
  },
];

const formatDistanceToNow = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

export default function EmailTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteTemplateId, setDeleteTemplateId] = useState(null);
  const [templates, setTemplates] = useState(mockTemplates);

  // Filter templates based on search and type
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || template.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type) => {
    const typeConfig = {
      APPROVAL_REQUEST: {
        label: "Request",
        color: "bg-blue-100 text-blue-800",
      },
      APPROVAL_REMINDER: {
        label: "Reminder",
        color: "bg-yellow-100 text-yellow-800",
      },
      APPROVAL_FINAL: { label: "Final", color: "bg-red-100 text-red-800" },
      APPROVAL_CONFIRMED: {
        label: "Confirmed",
        color: "bg-green-100 text-green-800",
      },
    };

    const config = typeConfig[type] || {
      label: type,
      color: "bg-gray-100 text-gray-800",
    };

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleDeleteTemplate = (templateId) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    setDeleteTemplateId(null);
  };

  const handleDuplicateTemplate = (template) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      usageCount: 0,
      lastUsed: null,
      createdAt: new Date().toISOString(),
    };

    setTemplates((prev) => [newTemplate, ...prev]);
  };

  const toggleTemplateStatus = (templateId) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId
          ? { ...template, isActive: !template.isActive }
          : template
      )
    );
  };

  const stats = {
    total: templates.length,
    active: templates.filter((t) => t.isActive).length,
    default: templates.filter((t) => t.isDefault).length,
    totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-gray-600">
            Manage email templates for design approval communications
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <a href="/dashboard/admin/communication/approvals/templates/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Templates
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Default</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.default}
                </p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold">{stats.totalUsage}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search templates by name or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <option value="all">All Types</option>
              <option value="APPROVAL_REQUEST">Approval Request</option>
              <option value="APPROVAL_REMINDER">Reminder</option>
              <option value="APPROVAL_FINAL">Final Notice</option>
              <option value="APPROVAL_CONFIRMED">Confirmation</option>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardContent className="p-0">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first email template to get started"}
              </p>
              <a href="/dashboard/admin/communication/approvals/templates/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </a>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{template.name}</span>
                          {template.isDefault && (
                            <Badge variant="outline" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate max-w-md">
                          {template.subject}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>{getTypeBadge(template.type)}</TableCell>

                    <TableCell>
                      <span className="font-medium">{template.usageCount}</span>
                      <span className="text-sm text-gray-600"> times</span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={template.isActive ? "success" : "outline"}
                        className={
                          template.isActive ? "bg-green-100 text-green-800" : ""
                        }
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {template.lastUsed ? (
                        <div>
                          <p className="text-sm">
                            {formatDistanceToNow(template.lastUsed)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatDate(template.lastUsed)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600">Never</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <p className="text-sm">
                        {formatDate(template.createdAt)}
                      </p>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/dashboard/admin/communication/approvals/templates/${template.id}`}
                        >
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </a>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>

                            <DropdownMenuItem
                              onClick={() =>
                                (window.location.href = `/dashboard/admin/communication/approvals/templates/${template.id}/edit`)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Template
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDuplicateTemplate(template)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => toggleTemplateStatus(template.id)}
                            >
                              {template.isActive ? (
                                <>
                                  <AlertTriangle className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {!template.isDefault && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeleteTemplateId(template.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTemplateId}
        onOpenChange={() => setDeleteTemplateId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this email template? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTemplateId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteTemplate(deleteTemplateId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
