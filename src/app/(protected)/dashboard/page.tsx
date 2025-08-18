"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  Settings,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Palette,
  CreditCard,
  User,
  TrendingUp,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useUserProfile } from "@/hooks/use-users";
import {
  useDashboardByRole,
  useQuickStats,
  useRecentActivity,
} from "@/hooks/use-dashboard";
import {
  isCustomerSummary,
  // isAdminSummary,
  isCustomerQuickStats,
  isAdminQuickStats,
  type CustomerSummary,
  // type AdminSummary,
  type RecentActivity,
  type RecentOrder,
  type RecentDesign,
} from "@/lib/dashboard/types/dashboard.types";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user profile and dashboard data
  const { data: userProfile } = useUserProfile();
  const dashboardQuery = useDashboardByRole({
    dateRange: 30,
    includeDetails: true,
  });
  const { data: quickStats } = useQuickStats();
  const { data: recentActivity } = useRecentActivity(5);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
      case "approved":
        return "bg-green-100 text-green-800";
      case "shipped":
      case "processing":
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "drafts":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "processing":
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading state
  if (dashboardQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="bg-gradient-to-br from-green-50 via-white to-red-50 rounded-lg p-8">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardQuery.error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              Failed to load dashboard data. Please try again.
              <Button
                variant="outline"
                size="sm"
                onClick={() => dashboardQuery.summary.refetch()}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const dashboardData = dashboardQuery.summary.data;
  const isCustomer = dashboardQuery.isCustomer;
  const isAdmin = dashboardQuery.isAdmin;

  // Get role-specific data
  const customerData =
    isCustomer && dashboardData && isCustomerSummary(dashboardData.data)
      ? (dashboardData.data as CustomerSummary)
      : null;

  // Quick stats for cards
  const stats = quickStats?.stats;
  const customerStats = stats && isCustomerQuickStats(stats) ? stats : null;
  const adminStats = stats && isAdminQuickStats(stats) ? stats : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-green-50 via-white to-red-50 rounded-lg p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userProfile?.avatar || undefined} />
                  <AvatarFallback className="bg-green-100 text-green-700 text-xl">
                    {getInitials(userProfile?.name || "")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {userProfile?.name?.split(" ")[0] || "User"}!
                  </h1>
                  <p className="text-gray-600">
                    {userProfile?.role?.name || "Member"} • Member since{" "}
                    {userProfile?.createdAt
                      ? formatDate(userProfile.createdAt)
                      : "Unknown"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{userProfile?.type}</Badge>
                    {userProfile?.verified && (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {isCustomer && (
                <Button className="bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/products">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Browse Products
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {isCustomer && customerStats && (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {customerStats.totalOrders}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Spent
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(customerStats.totalSpent)}
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Saved Designs
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {customerStats.savedDesigns}
                      </p>
                    </div>
                    <Palette className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Cart Items
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {customerStats.cartItems}
                      </p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {isAdmin && adminStats && (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Customers
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {adminStats.totalCustomers}
                      </p>
                    </div>
                    <User className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {adminStats.totalOrders}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Monthly Revenue
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(adminStats.monthlyRevenue)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Low Stock Alerts
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {adminStats.lowStockAlerts}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", label: "Overview", icon: User },
                { id: "orders", label: "Orders", icon: Package },
                ...(isCustomer
                  ? [{ id: "designs", label: "Saved Designs", icon: Palette }]
                  : []),
                { id: "activity", label: "Recent Activity", icon: Clock },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-green-600 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              {isCustomer && customerData && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Orders</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/orders">View All</Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {customerData.orders.recentOrders.length > 0 ? (
                      customerData.orders.recentOrders
                        .slice(0, 3)
                        .map((order: RecentOrder) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(order.status)}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {order.orderNumber}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {formatCurrency(order.totalAmount)}
                              </p>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No recent orders
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Recent Designs */}
              {isCustomer && customerData && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Designs</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/designs">View All</Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {customerData.savedDesigns.recentDesigns.length > 0 ? (
                      customerData.savedDesigns.recentDesigns
                        .slice(0, 3)
                        .map((design: RecentDesign) => (
                          <div
                            key={design.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <Palette className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {design.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Updated {formatDate(design.updatedAt)}
                                </p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(design.status)}>
                              {design.status}
                            </Badge>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No saved designs
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isCustomer && (
                    <>
                      <Button className="w-full justify-start" variant="outline" asChild>
                        <Link href="/design-studio">
                          <Palette className="h-4 w-4 mr-2" />
                          Create New Design
                        </Link>
                      </Button>
                      <Button className="w-full justify-start" variant="outline" asChild>
                        <Link href="/orders/track">
                          <Truck className="h-4 w-4 mr-2" />
                          Track an Order
                        </Link>
                      </Button>
                    </>
                  )}
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/profile">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Profile
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/contact">
                      <Settings className="h-4 w-4 mr-2" />
                      Contact Support
                    </Link>
                  </Button>
                </CardContent>
              </Card> */}
            </div>
          )}

          {activeTab === "activity" && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity?.results.length ? (
                  <div className="space-y-4">
                    {recentActivity.results.map((activity: RecentActivity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          {getStatusIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                        {activity.severity && (
                          <Badge
                            variant="outline"
                            className={`${
                              activity.severity === "high" ||
                              activity.severity === "urgent"
                                ? "border-red-500 text-red-700"
                                : activity.severity === "medium"
                                  ? "border-yellow-500 text-yellow-700"
                                  : "border-gray-500 text-gray-700"
                            }`}
                          >
                            {activity.severity}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Other tab content */}
          {!["overview", "activity"].includes(activeTab) && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                  content coming soon...
                </p>
                <Button className="mt-4" variant="outline" asChild>
                  <Link href="/profile">Go to Profile Settings</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
