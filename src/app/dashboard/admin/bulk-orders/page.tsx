/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Package,
  Plus,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Calculator,
  Download,
  Upload,
  Eye,
  Edit,
  MoreHorizontal,
  RefreshCw,
  Filter,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// Mock bulk order data
interface BulkOrder {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerId: string;
  description: string;
  itemCount: number;
  totalQuantity: number;
  estimatedValue: number;
  status:
    | "DRAFT"
    | "QUOTED"
    | "APPROVED"
    | "REJECTED"
    | "CONVERTED"
    | "EXPIRED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: string;
  expiresAt: string;
  convertedToOrders?: number;
  progress?: number;
}

export default function AdminBulkOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Mock data - replace with actual API call
  const bulkOrders: BulkOrder[] = [
    {
      id: "1",
      quoteNumber: "BQ-2024-001",
      customerName: "Tech Solutions Ltd",
      customerId: "CUST-001",
      description: "Corporate event materials package",
      itemCount: 5,
      totalQuantity: 2500,
      estimatedValue: 15750.0,
      status: "QUOTED",
      priority: "HIGH",
      createdAt: "2024-01-15T10:00:00Z",
      expiresAt: "2024-02-15T10:00:00Z",
      progress: 75,
    },
    {
      id: "2",
      quoteNumber: "BQ-2024-002",
      customerName: "Marketing Plus Agency",
      customerId: "CUST-002",
      description: "Annual campaign materials",
      itemCount: 8,
      totalQuantity: 5000,
      estimatedValue: 28500.0,
      status: "APPROVED",
      priority: "MEDIUM",
      createdAt: "2024-01-12T14:30:00Z",
      expiresAt: "2024-02-12T14:30:00Z",
      convertedToOrders: 3,
      progress: 100,
    },
    {
      id: "3",
      quoteNumber: "BQ-2024-003",
      customerName: "Startup Hub",
      customerId: "CUST-003",
      description: "Promotional merchandise bundle",
      itemCount: 3,
      totalQuantity: 1000,
      estimatedValue: 8250.0,
      status: "DRAFT",
      priority: "LOW",
      createdAt: "2024-01-18T09:15:00Z",
      expiresAt: "2024-02-18T09:15:00Z",
      progress: 25,
    },
  ];

  const filteredOrders = bulkOrders.filter((order) => {
    const matchesSearch =
      order.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const bulkOrderStats = {
    total: bulkOrders.length,
    draft: bulkOrders.filter((o) => o.status === "DRAFT").length,
    quoted: bulkOrders.filter((o) => o.status === "QUOTED").length,
    approved: bulkOrders.filter((o) => o.status === "APPROVED").length,
    converted: bulkOrders.filter((o) => o.status === "CONVERTED").length,
    totalValue: bulkOrders.reduce((sum, o) => sum + o.estimatedValue, 0),
    avgOrderSize:
      bulkOrders.length > 0
        ? bulkOrders.reduce((sum, o) => sum + o.estimatedValue, 0) /
          bulkOrders.length
        : 0,
  };

  const getStatusBadge = (status: string) => {
    const config = {
      DRAFT: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      QUOTED: { color: "bg-blue-100 text-blue-800", label: "Quoted" },
      APPROVED: { color: "bg-green-100 text-green-800", label: "Approved" },
      REJECTED: { color: "bg-red-100 text-red-800", label: "Rejected" },
      CONVERTED: { color: "bg-purple-100 text-purple-800", label: "Converted" },
      EXPIRED: { color: "bg-orange-100 text-orange-800", label: "Expired" },
    }[status] || { color: "bg-gray-100 text-gray-800", label: status };

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      LOW: { color: "bg-green-100 text-green-800", label: "Low" },
      MEDIUM: { color: "bg-yellow-100 text-yellow-800", label: "Medium" },
      HIGH: { color: "bg-orange-100 text-orange-800", label: "High" },
      URGENT: { color: "bg-red-100 text-red-800", label: "Urgent" },
    }[priority] || { color: "bg-gray-100 text-gray-800", label: priority };

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bulk Orders & Quotes
          </h1>
          <p className="text-muted-foreground">
            Manage large volume orders, quotes, and corporate accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>

          <Button asChild>
            <Link href="/dashboard/admin/bulk-orders/create">
              <Plus className="h-4 w-4 mr-2" />
              New Bulk Quote
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Quotes
                </p>
                <p className="text-2xl font-bold">{bulkOrderStats.total}</p>
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
                  Pending Approval
                </p>
                <p className="text-2xl font-bold">{bulkOrderStats.quoted}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Value
                </p>
                <p className="text-2xl font-bold">
                  ${bulkOrderStats.totalValue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Converted
                </p>
                <p className="text-2xl font-bold">{bulkOrderStats.converted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="quotes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quotes">All Quotes</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* All Quotes Tab */}
        <TabsContent value="quotes" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search quotes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="QUOTED">Quoted</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="CONVERTED">Converted</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quotes Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const daysUntilExpiry = getDaysUntilExpiry(order.expiresAt);
                    const isExpiringSoon = daysUntilExpiry <= 7;

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/dashboard/admin/bulk-orders/${order.id}`}
                            className="hover:underline"
                          >
                            {order.quoteNumber}
                          </Link>
                        </TableCell>

                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.customerId}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <p className="max-w-xs truncate">
                            {order.description}
                          </p>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            <p>{order.itemCount} items</p>
                            <p className="text-muted-foreground">
                              {order.totalQuantity.toLocaleString()} qty
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="font-medium">
                          ${order.estimatedValue.toLocaleString()}
                        </TableCell>

                        <TableCell>{getStatusBadge(order.status)}</TableCell>

                        <TableCell>
                          {getPriorityBadge(order.priority)}
                        </TableCell>

                        <TableCell>
                          <div
                            className={`text-sm ${isExpiringSoon ? "text-red-600" : ""}`}
                          >
                            {daysUntilExpiry > 0 ? (
                              <>
                                {daysUntilExpiry} day
                                {daysUntilExpiry !== 1 ? "s" : ""}
                                {isExpiringSoon && (
                                  <AlertTriangle className="inline h-3 w-3 ml-1" />
                                )}
                              </>
                            ) : (
                              <Badge variant="destructive">Expired</Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/admin/bulk-orders/${order.id}`}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/admin/bulk-orders/${order.id}/edit`}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Quote
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calculator className="mr-2 h-4 w-4" />
                                Recalculate
                              </DropdownMenuItem>
                              {order.status === "APPROVED" && (
                                <DropdownMenuItem>
                                  <Package className="mr-2 h-4 w-4" />
                                  Convert to Orders
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Approval Tab */}
        <TabsContent value="pending">
          <div className="space-y-4">
            {bulkOrders
              .filter((o) => o.status === "QUOTED")
              .map((order) => (
                <Card key={order.id} className="border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{order.quoteNumber}</h3>
                          {getPriorityBadge(order.priority)}
                          <Badge className="bg-orange-100 text-orange-800">
                            Awaiting Approval
                          </Badge>
                        </div>

                        <p className="text-muted-foreground">
                          {order.customerName}
                        </p>
                        <p className="text-sm">{order.description}</p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{order.itemCount} items</span>
                          <span>
                            {order.totalQuantity.toLocaleString()} quantity
                          </span>
                          <span>
                            Expires in {getDaysUntilExpiry(order.expiresAt)}{" "}
                            days
                          </span>
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <p className="text-2xl font-bold">
                          ${order.estimatedValue.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button size="sm" asChild>
                            <Link
                              href={`/dashboard/admin/bulk-orders/${order.id}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved">
          <div className="grid gap-4 md:grid-cols-2">
            {bulkOrders
              .filter((o) => o.status === "APPROVED")
              .map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{order.quoteNumber}</h3>
                        <Badge className="bg-green-100 text-green-800">
                          Approved
                        </Badge>
                      </div>

                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Conversion Progress</span>
                          <span>{order.progress}%</span>
                        </div>
                        <Progress value={order.progress} />
                        {order.convertedToOrders && (
                          <p className="text-xs text-muted-foreground">
                            {order.convertedToOrders} orders created
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">
                          ${order.estimatedValue.toLocaleString()}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/dashboard/admin/bulk-orders/${order.id}`}
                            >
                              View
                            </Link>
                          </Button>
                          <Button size="sm">Convert to Orders</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Quote to Order Rate</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Quote Value</span>
                    <span className="font-medium">
                      ${bulkOrderStats.avgOrderSize.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Response Time</span>
                    <span className="font-medium">2.3 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Retention</span>
                    <span className="font-medium">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["Jan", "Feb", "Mar", "Apr"].map((month, index) => (
                    <div
                      key={month}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{month} 2024</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(index + 1) * 20}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          ${((index + 1) * 25000).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
