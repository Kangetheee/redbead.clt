"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Building,
  Calendar,
  Package,
  FileText,
  Loader2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/lib/utils";
import {
  useCustomer,
  useCustomerRecentOrders,
  useCustomerSavedDesigns,
  useCustomerActiveOrders,
} from "@/hooks/use-customers";

export default function CustomerDetailsPage() {
  const params = useParams();
  const customerId = params.id as string;

  const {
    data: customer,
    isLoading: customerLoading,
    error,
  } = useCustomer(customerId);
  const { data: recentOrders, isLoading: ordersLoading } =
    useCustomerRecentOrders(customerId, 5);
  const { data: savedDesigns, isLoading: designsLoading } =
    useCustomerSavedDesigns(customerId);
  const { data: activeOrders, isLoading: activeOrdersLoading } =
    useCustomerActiveOrders(customerId);

  if (customerLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              {error
                ? `Error loading customer: ${error.message}`
                : "Customer not found"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/customers">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {customer.name || "Unnamed Customer"}
          </h1>
          <p className="text-muted-foreground">Customer Details</p>
        </div>
        <Link href={`/dashboard/admin/customers/${customerId}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Customer
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={customer.avatar || ""} />
                  <AvatarFallback className="text-lg">
                    {customer.name ? getInitials(customer.name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">
                    {customer.name || "Unnamed Customer"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customer ID: {customer.id}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.email}
                      </p>
                    </div>
                  </div>
                )}

                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.phone}
                      </p>
                    </div>
                  </div>
                )}

                {customer.company && (
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Company</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.company}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Customer Since</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(customer.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {customer.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Notes</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Orders and Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Active Orders
              </CardTitle>
              <CardDescription>Currently processing orders</CardDescription>
            </CardHeader>
            <CardContent>
              {activeOrdersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : activeOrders && activeOrders.length > 0 ? (
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.items} items • ${order.total.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{order.status}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(order.orderDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No active orders
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Order history for this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : recentOrders && recentOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">#{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items} items
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.status}</Badge>
                        </TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>{formatDate(order.orderDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No recent orders
                </p>
              )}
            </CardContent>
          </Card>

          {/* Saved Designs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Saved Designs
              </CardTitle>
              <CardDescription>
                Customer&apos;s saved design templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {designsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : savedDesigns && savedDesigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedDesigns.map((design) => (
                    <div key={design.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{design.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {design.category}
                          </p>
                          {design.isTemplate && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Template
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Modified: {formatDate(design.lastModified)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No saved designs
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
