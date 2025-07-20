/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Mail,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

// Types based on API specification
interface DesignApproval {
  id: string;
  orderId: string;
  orderNumber?: string;
  customerName?: string;
  customerEmail: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "CANCELLED";
  designSummary: {
    productName: string;
    quantity: number;
    [key: string]: any;
  };
  previewImages: string[];
  requestedAt: string;
  respondedAt?: string;
  expiresAt: string;
  approvedBy?: string;
  rejectionReason?: string;
  emailSent: boolean;
  remindersSent: number;
}

interface DesignApprovalsStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
  averageResponseTime: number;
}

const getStatusColor = (status: DesignApproval["status"]) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "APPROVED":
      return "bg-green-100 text-green-800 border-green-200";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200";
    case "EXPIRED":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "CANCELLED":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: DesignApproval["status"]) => {
  switch (status) {
    case "PENDING":
      return <Clock className="w-4 h-4" />;
    case "APPROVED":
      return <CheckCircle className="w-4 h-4" />;
    case "REJECTED":
      return <XCircle className="w-4 h-4" />;
    case "EXPIRED":
      return <AlertTriangle className="w-4 h-4" />;
    case "CANCELLED":
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getUrgencyLevel = (expiresAt: string) => {
  const hoursLeft =
    (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60);
  if (hoursLeft < 0) return "expired";
  if (hoursLeft < 6) return "urgent";
  if (hoursLeft < 24) return "warning";
  return "normal";
};

export default function DesignApprovalsPage() {
  const [approvals, setApprovals] = useState<DesignApproval[]>([]);
  const [stats, setStats] = useState<DesignApprovalsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchApprovals = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        const mockApprovals: DesignApproval[] = [
          {
            id: "da-001",
            orderId: "ord-001",
            orderNumber: "ORD-2024-0001",
            customerName: "John Doe",
            customerEmail: "john.doe@example.com",
            status: "PENDING",
            designSummary: {
              productName: "Custom Polyester Lanyard",
              quantity: 100,
              material: "Polyester",
              colors: ["Blue", "White"],
            },
            previewImages: ["/api/placeholder/300/200"],
            requestedAt: "2024-01-15T10:30:00.000Z",
            expiresAt: "2024-01-18T10:30:00.000Z",
            emailSent: true,
            remindersSent: 1,
          },
          {
            id: "da-002",
            orderId: "ord-002",
            orderNumber: "ORD-2024-0002",
            customerName: "Jane Smith",
            customerEmail: "jane.smith@company.com",
            status: "APPROVED",
            designSummary: {
              productName: "Woven Badge Reel",
              quantity: 250,
              material: "Woven",
              colors: ["Red", "Gold"],
            },
            previewImages: ["/api/placeholder/300/200"],
            requestedAt: "2024-01-14T14:20:00.000Z",
            respondedAt: "2024-01-15T09:15:00.000Z",
            expiresAt: "2024-01-17T14:20:00.000Z",
            approvedBy: "jane.smith@company.com",
            emailSent: true,
            remindersSent: 0,
          },
          {
            id: "da-003",
            orderId: "ord-003",
            orderNumber: "ORD-2024-0003",
            customerName: "Bob Wilson",
            customerEmail: "bob.wilson@startup.io",
            status: "REJECTED",
            designSummary: {
              productName: "Custom Name Badge",
              quantity: 50,
              material: "Plastic",
              colors: ["Black", "Silver"],
            },
            previewImages: ["/api/placeholder/300/200"],
            requestedAt: "2024-01-13T16:45:00.000Z",
            respondedAt: "2024-01-14T11:30:00.000Z",
            expiresAt: "2024-01-16T16:45:00.000Z",
            rejectionReason: "Logo needs to be higher resolution",
            emailSent: true,
            remindersSent: 0,
          },
        ];

        const mockStats: DesignApprovalsStats = {
          total: 15,
          pending: 5,
          approved: 8,
          rejected: 1,
          expired: 1,
          averageResponseTime: 18.5,
        };

        setApprovals(mockApprovals);
        setStats(mockStats);
        setTotalPages(1);
      } catch (error) {
        console.error("Error fetching design approvals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, [currentPage, statusFilter, searchTerm]);

  const filteredApprovals = approvals.filter((approval) => {
    const matchesSearch =
      approval.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || approval.status === statusFilter;

    const urgencyLevel = getUrgencyLevel(approval.expiresAt);
    const matchesUrgency =
      urgencyFilter === "all" || urgencyLevel === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const handleResendEmail = async (approvalId: string) => {
    try {
      // API call to resend email
      console.log("Resending email for approval:", approvalId);
      // Update local state or refetch
    } catch (error) {
      console.error("Error resending email:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Design Approvals</h1>
          <p className="text-gray-600 mt-1">
            Manage customer design approvals and review requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-sm text-gray-600">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                  <p className="text-sm text-gray-600">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {stats.averageResponseTime}h
                  </p>
                  <p className="text-sm text-gray-600">Avg Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by customer, email, or order number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Design Approval Requests</CardTitle>
          <CardDescription>
            {filteredApprovals.length} of {approvals.length} approval requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApprovals.map((approval) => {
                const urgencyLevel = getUrgencyLevel(approval.expiresAt);
                const isExpired = new Date(approval.expiresAt) < new Date();

                return (
                  <TableRow key={approval.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {approval.customerName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {approval.customerName || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {approval.customerEmail}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium">{approval.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          ID: {approval.orderId}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {approval.designSummary.productName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {approval.designSummary.quantity}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={getStatusColor(approval.status)}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(approval.status)}
                          <span>{approval.status}</span>
                        </span>
                      </Badge>
                      {approval.status === "PENDING" &&
                        urgencyLevel === "urgent" && (
                          <Badge className="ml-1 bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {format(
                            new Date(approval.requestedAt),
                            "MMM dd, yyyy"
                          )}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDistanceToNow(new Date(approval.requestedAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p
                          className={`text-sm ${isExpired ? "text-red-600" : urgencyLevel === "urgent" ? "text-red-600" : urgencyLevel === "warning" ? "text-yellow-600" : "text-gray-900"}`}
                        >
                          {format(
                            new Date(approval.expiresAt),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </p>
                        <p className="text-xs text-gray-600">
                          {isExpired
                            ? "Expired"
                            : formatDistanceToNow(
                                new Date(approval.expiresAt),
                                { addSuffix: true }
                              )}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/design-approvals/${approval.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>

                        {approval.status === "PENDING" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendEmail(approval.id)}
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Resend
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredApprovals.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No design approvals found matching your criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
