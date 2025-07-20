/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Send,
  Copy,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { EmailTemplate } from "@/src/lib/emails/types/emails.types";
import {
  PaginatedEmailLogsResponse,
  PaginatedEmailTemplatesResponse,
} from "@/src/lib/emails/types/emails.types";

const CATEGORY_LABELS = {
  DESIGN_APPROVAL_REQUEST: "Design Approval Request",
  DESIGN_APPROVED: "Design Approved",
  DESIGN_REJECTED: "Design Rejected",
  ORDER_CONFIRMATION: "Order Confirmation",
  ORDER_STATUS_UPDATE: "Order Status Update",
  SHIPPING_NOTIFICATION: "Shipping Notification",
  PAYMENT_CONFIRMATION: "Payment Confirmation",
  CUSTOM: "Custom",
};

const CATEGORY_COLORS = {
  DESIGN_APPROVAL_REQUEST: "bg-orange-100 text-orange-800",
  DESIGN_APPROVED: "bg-green-100 text-green-800",
  DESIGN_REJECTED: "bg-red-100 text-red-800",
  ORDER_CONFIRMATION: "bg-blue-100 text-blue-800",
  ORDER_STATUS_UPDATE: "bg-purple-100 text-purple-800",
  SHIPPING_NOTIFICATION: "bg-cyan-100 text-cyan-800",
  PAYMENT_CONFIRMATION: "bg-emerald-100 text-emerald-800",
  CUSTOM: "bg-gray-100 text-gray-800",
};

export default function EmailTemplatesPage() {
  const router = useRouter();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);

  // Mock data - replace with actual API call
  const mockTemplates: EmailTemplate[] = [
    {
      id: "tpl_design_approval_001",
      name: "Design Approval Request",
      subject: "Please Review and Approve Your Design - Order {{orderNumber}}",
      category: "DESIGN_APPROVAL_REQUEST",
      isActive: true,
      isSystem: true,
      variables: ["customerName", "orderNumber", "approvalLink", "expiryDate"],
      createdAt: "2024-01-15T10:30:00.000Z",
      updatedAt: "2024-01-15T10:30:00.000Z",
    },
    {
      id: "tpl_order_conf_001",
      name: "Order Confirmation",
      subject: "Order Confirmed - {{orderNumber}}",
      category: "ORDER_CONFIRMATION",
      isActive: true,
      isSystem: false,
      variables: ["customerName", "orderNumber", "totalAmount"],
      createdAt: "2024-01-10T08:15:00.000Z",
      updatedAt: "2024-01-12T14:22:00.000Z",
    },
    {
      id: "tpl_shipping_001",
      name: "Shipping Notification",
      subject: "Your Order is on its Way! - {{orderNumber}}",
      category: "SHIPPING_NOTIFICATION",
      isActive: true,
      isSystem: false,
      variables: [
        "customerName",
        "orderNumber",
        "trackingNumber",
        "trackingUrl",
      ],
      createdAt: "2024-01-08T16:45:00.000Z",
      updatedAt: "2024-01-08T16:45:00.000Z",
    },
  ];

  useEffect(() => {
    fetchTemplates();
  }, [currentPage, searchTerm, categoryFilter]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetch(`/api/email-templates?page=${currentPage}&search=${searchTerm}&category=${categoryFilter}`);
      // const data: PaginatedResponse = await response.json();

      // Mock implementation
      const filteredTemplates = mockTemplates.filter((template) => {
        const matchesSearch =
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          categoryFilter === "all" || template.category === categoryFilter;
        return matchesSearch && matchesCategory;
      });

      setTemplates(filteredTemplates);
      setTotalTemplates(filteredTemplates.length);
      setTotalPages(Math.ceil(filteredTemplates.length / 10));
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to fetch email templates");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      // Replace with actual API call
      // await fetch(`/api/email-templates/${templateId}`, { method: 'DELETE' });

      setTemplates(templates.filter((t) => t.id !== templateId));
      toast.success("Email template deleted successfully");
    } catch (error) {
      toast.error("Failed to delete email template");
    }
  };

  const handleDuplicate = async (templateId: string) => {
    try {
      // Replace with actual API call
      // await fetch(`/api/email-templates/${templateId}/duplicate`, { method: 'POST' });

      toast.success("Email template duplicated successfully");
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to duplicate email template");
    }
  };

  const handleToggleStatus = async (templateId: string, isActive: boolean) => {
    try {
      // Replace with actual API call
      // await fetch(`/api/email-templates/${templateId}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ isActive: !isActive })
      // });

      setTemplates(
        templates.map((t) =>
          t.id === templateId ? { ...t, isActive: !isActive } : t
        )
      );

      toast.success(
        `Template ${!isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      toast.error("Failed to update template status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground">
            Manage email templates for automated communications
          </p>
        </div>
        <Button onClick={() => router.push("/admin/email-templates/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTemplates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {templates.filter((t) => t.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              System Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {templates.filter((t) => t.isSystem).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Custom Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {templates.filter((t) => !t.isSystem).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      {template.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {template.subject}
                    </TableCell>
                    <TableCell>
                      <Badge className={CATEGORY_COLORS[template.category]}>
                        {CATEGORY_LABELS[template.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={template.isActive ? "default" : "secondary"}
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={template.isSystem ? "outline" : "secondary"}
                      >
                        {template.isSystem ? "System" : "Custom"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(template.updatedAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/admin/email-templates/${template.id}`
                              )
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/admin/email-templates/${template.id}/edit`
                              )
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(template.id)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleStatus(template.id, template.isActive)
                            }
                          >
                            {template.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(template.id)}
                            className="text-destructive"
                            disabled={template.isSystem}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
