/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Link from "next/link";
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
  Loader2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useEmailTemplates,
  useDeleteEmailTemplate,
  useDuplicateEmailTemplate,
  useUpdateEmailTemplate,
} from "@/hooks/use-communication";
import {
  GetEmailTemplatesDto,
  EmailTemplateCategory,
} from "@/lib/communications/dto/email-template.dto";

interface TemplateFilters {
  search: string;
  category: EmailTemplateCategory | "all";
  isActive?: boolean;
  page: number;
  limit: number;
}

function TemplatesTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Template</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-16 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function EmailTemplatesPage() {
  const [filters, setFilters] = useState<TemplateFilters>({
    search: "",
    category: "all",
    isActive: undefined,
    page: 1,
    limit: 20,
  });
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

  // TanStack Query hooks
  const {
    data: templatesData,
    isLoading,
    error,
    refetch,
  } = useEmailTemplates({
    search: filters.search || undefined,
    category: filters.category !== "all" ? filters.category : undefined,
    isActive: filters.isActive,
    page: filters.page,
    limit: filters.limit,
  });

  const deleteTemplateMutation = useDeleteEmailTemplate();
  const duplicateTemplateMutation = useDuplicateEmailTemplate();
  const updateTemplateMutation = useUpdateEmailTemplate();

  let templates: any[] = [];
  let pagination: any = undefined;

  if (templatesData) {
    if (Array.isArray(templatesData)) {
      // If the API returns a direct array
      templates = templatesData;
    } else if (templatesData.items && Array.isArray(templatesData.items)) {
      // If the API returns { items: [...], meta: {...} }
      templates = templatesData.items;
      pagination = templatesData.meta;
    } else if (
      (templatesData as any).data &&
      Array.isArray((templatesData as any).data)
    ) {
      // If the API returns { data: [...], pagination: {...} }
      templates = (templatesData as any).data;
      pagination =
        (templatesData as any).pagination || (templatesData as any).meta;
    } else if (
      (templatesData as any).templates &&
      Array.isArray((templatesData as any).templates)
    ) {
      // If the API returns { templates: [...], pagination: {...} }
      templates = (templatesData as any).templates;
      pagination =
        (templatesData as any).pagination || (templatesData as any).meta;
    } else {
      // Try to find any array in the response
      const keys = Object.keys(templatesData);

      for (const key of keys) {
        if (Array.isArray((templatesData as any)[key])) {
          templates = (templatesData as any)[key];
          break;
        }
      }

      // Look for pagination in other keys
      for (const key of keys) {
        const value = (templatesData as any)[key];
        if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          (value.totalItems || value.totalPages)
        ) {
          pagination = value;
          break;
        }
      }
    }
  }
  // Calculate stats from templates
  const stats = {
    total: pagination?.totalItems || templates.length || 0,
    active: templates.filter((t) => t?.isActive).length || 0,
    inactive: templates.filter((t) => !t?.isActive).length || 0,
    system: templates.filter((t) => t?.isSystem).length || 0,
  };

  // Handle filter changes
  const updateFilters = (newFilters: Partial<TemplateFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  };

  const handleSearch = (search: string) => {
    updateFilters({ search });
  };

  const handleCategoryFilter = (category: string) => {
    updateFilters({
      category:
        category === "all" ? "all" : (category as EmailTemplateCategory),
    });
  };

  const handleStatusFilter = (status: string) => {
    let isActive: boolean | undefined;
    if (status === "active") isActive = true;
    else if (status === "inactive") isActive = false;
    else isActive = undefined;

    updateFilters({ isActive });
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplateMutation.mutateAsync(templateId);
      setDeleteTemplateId(null);
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      await duplicateTemplateMutation.mutateAsync(templateId);
    } catch (error) {
      console.error("Error duplicating template:", error);
    }
  };

  const toggleTemplateStatus = async (
    templateId: string,
    currentStatus: boolean
  ) => {
    try {
      await updateTemplateMutation.mutateAsync({
        templateId,
        values: { isActive: !currentStatus },
      });
    } catch (error) {
      console.error("Error updating template status:", error);
    }
  };

  const getCategoryBadge = (category: EmailTemplateCategory) => {
    const categoryConfig: Record<
      EmailTemplateCategory,
      { label: string; color: string }
    > = {
      DESIGN_APPROVAL_REQUEST: {
        label: "Request",
        color: "bg-blue-100 text-blue-800",
      },
      DESIGN_APPROVED: {
        label: "Approved",
        color: "bg-green-100 text-green-800",
      },
      DESIGN_REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
      ORDER_CONFIRMATION: {
        label: "Order",
        color: "bg-purple-100 text-purple-800",
      },
      ORDER_STATUS_UPDATE: {
        label: "Update",
        color: "bg-orange-100 text-orange-800",
      },
      SHIPPING_NOTIFICATION: {
        label: "Shipping",
        color: "bg-cyan-100 text-cyan-800",
      },
      PAYMENT_CONFIRMATION: {
        label: "Payment",
        color: "bg-emerald-100 text-emerald-800",
      },
      CUSTOM: { label: "Custom", color: "bg-gray-100 text-gray-800" },
    };

    const config = categoryConfig[category];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDistanceToNow = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Email Templates
            </h1>
            <p className="text-muted-foreground">
              Manage email templates for design approval communications
            </p>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <TemplatesTableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to load email templates: {error.message}
            <Button
              variant="link"
              onClick={() => refetch()}
              className="ml-2 p-0 h-auto"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground">
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

          <Link href="/dashboard/admin/communication/approvals/templates/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
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
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
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
                <p className="text-sm font-medium text-muted-foreground">
                  Inactive
                </p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.inactive}
                </p>
              </div>
              <Clock className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  System
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.system}
                </p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates by name or subject..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={filters.category}
              onValueChange={handleCategoryFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="DESIGN_APPROVAL_REQUEST">
                  Approval Request
                </SelectItem>
                <SelectItem value="DESIGN_APPROVED">Approved</SelectItem>
                <SelectItem value="DESIGN_REJECTED">Rejected</SelectItem>
                <SelectItem value="ORDER_CONFIRMATION">
                  Order Confirmation
                </SelectItem>
                <SelectItem value="SHIPPING_NOTIFICATION">Shipping</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={
                filters.isActive === true
                  ? "active"
                  : filters.isActive === false
                    ? "inactive"
                    : "all"
              }
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
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
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.category !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first email template to get started"}
              </p>
              <Link href="/dashboard/admin/communication/approvals/templates/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {templates.map((template, index) => (
                    <TableRow key={template?.id || index}>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {template?.name || "Untitled"}
                            </span>
                            {template?.isSystem && (
                              <Badge variant="outline" className="text-xs">
                                System
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate max-w-md">
                            {template?.subject || "No subject"}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        {template?.category ? (
                          getCategoryBadge(template.category)
                        ) : (
                          <Badge variant="outline">Unknown</Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={template?.isActive ? "default" : "outline"}
                          className={
                            template?.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {template?.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <p className="text-sm">
                          {template?.createdAt
                            ? new Date(template.createdAt).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </TableCell>

                      <TableCell>
                        <p className="text-sm">
                          {template?.updatedAt
                            ? formatDistanceToNow(template.updatedAt)
                            : "Unknown"}
                        </p>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/admin/communication/approvals/${template?.id || ""}/templates`}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!template?.id}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!template?.id}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>

                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/admin/communication/approvals/templates/${template?.id}/edit`}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Template
                                </Link>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() =>
                                  template?.id &&
                                  handleDuplicateTemplate(template.id)
                                }
                                disabled={
                                  duplicateTemplateMutation.isPending ||
                                  !template?.id
                                }
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() =>
                                  template?.id &&
                                  toggleTemplateStatus(
                                    template.id,
                                    template.isActive
                                  )
                                }
                                disabled={
                                  updateTemplateMutation.isPending ||
                                  !template?.id
                                }
                              >
                                {template?.isActive ? (
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

                              {!template?.isSystem && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    template?.id &&
                                    setDeleteTemplateId(template.id)
                                  }
                                  disabled={
                                    deleteTemplateMutation.isPending ||
                                    !template?.id
                                  }
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

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {templates.length} of {pagination.totalItems}{" "}
                    templates
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateFilters({ page: pagination.currentPage - 1 })
                      }
                      disabled={pagination.currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateFilters({ page: pagination.currentPage + 1 })
                      }
                      disabled={pagination.currentPage >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
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
              onClick={() =>
                deleteTemplateId && handleDeleteTemplate(deleteTemplateId)
              }
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteTemplateMutation.isPending}
            >
              {deleteTemplateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Template"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
