/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Package,
  MapPin,
  Settings,
  Heart,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Edit,
  Plus,
  Eye,
  Download,
  Palette,
  Star,
  Calendar,
  CreditCard,
  User,
} from "lucide-react";
import Link from "next/link";
import { CustomerNavbar } from "@/components/layouts/customer-nav";
import { useUserProfile } from "@/hooks/use-users";
import { useCart, useCartItemCount } from "@/hooks/use-cart";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Add debug logging for hooks
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useUserProfile();
  const { data: cart, isLoading: isCartLoading, error: cartError } = useCart();
  const itemCount = useCartItemCount();

  // Debug user profile and cart data
  useEffect(() => {
    console.log("🔍 Dashboard Debug:", {
      userProfile,
      isProfileLoading,
      profileError,
      cart,
      isCartLoading,
      cartError,
      itemCount,
    });
  }, [
    userProfile,
    isProfileLoading,
    profileError,
    cart,
    isCartLoading,
    cartError,
    itemCount,
  ]);

  // Mock data with fallbacks
  const user = {
    name: userProfile?.name || "Loading...",
    email: userProfile?.email || "Loading...",
    avatar: userProfile?.avatar || null, // Remove placeholder URL that's causing 404
    joinedDate: "January 2024",
    totalOrders: 12,
    totalSpent: "KSh 45,000",
    loyaltyPoints: 450,
  };

  // Mock orders data
  const recentOrders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "delivered",
      total: "KSh 3,500",
      items: "Custom Lanyards x50",
      trackingNumber: "TRK-001-2024",
    },
    {
      id: "ORD-002",
      date: "2024-01-10",
      status: "processing",
      total: "KSh 2,800",
      items: "Wristbands x100",
      trackingNumber: "TRK-002-2024",
    },
    {
      id: "ORD-003",
      date: "2024-01-05",
      status: "shipped",
      total: "KSh 1,200",
      items: "Custom Badges x25",
      trackingNumber: "TRK-003-2024",
    },
  ];

  // Mock saved designs
  const savedDesigns = [
    {
      id: "DSN-001",
      name: "Company Logo Lanyard",
      type: "Lanyard",
      dateCreated: "2024-01-12",
      thumbnail: null, // Remove placeholder URL
    },
    {
      id: "DSN-002",
      name: "Event Wristband Design",
      type: "Wristband",
      dateCreated: "2024-01-08",
      thumbnail: null, // Remove placeholder URL
    },
    {
      id: "DSN-003",
      name: "Corporate Badge",
      type: "Badge",
      dateCreated: "2024-01-03",
      thumbnail: null, // Remove placeholder URL
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  // Show loading state
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-lg">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-lg text-red-600">
              Error loading profile: {profileError.message}
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-green-600 hover:bg-green-700"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Generate initials safely
  const getInitials = (name: string) => {
    if (!name || name === "Loading...") return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-green-50 via-white to-red-50 rounded-lg p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="bg-green-100 text-green-700 text-xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user.name.split(" ")[0]}!
                  </h1>
                  <p className="text-gray-600">
                    Member since {user.joinedDate}
                  </p>
                </div>
              </div>
              <Button className="bg-green-600 hover:bg-green-700" asChild>
                <Link href="/products">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Browse Products
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.totalOrders}
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
                    {user.totalSpent}
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
                    Loyalty Points
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.loyaltyPoints}
                  </p>
                </div>
                <Star className="h-8 w-8 text-green-600" />
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
                    {savedDesigns.length}
                  </p>
                </div>
                <Palette className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", label: "Overview", icon: User },
                { id: "orders", label: "Orders", icon: Package },
                { id: "designs", label: "Saved Designs", icon: Palette },
                { id: "addresses", label: "Addresses", icon: MapPin },
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/orders">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentOrders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.id}
                          </p>
                          <p className="text-sm text-gray-600">{order.items}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {order.total}
                        </p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    asChild
                  >
                    <Link href="/design-studio">
                      <Palette className="h-4 w-4 mr-2" />
                      Create New Design
                    </Link>
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    asChild
                  >
                    <Link href="/orders/track">
                      <Truck className="h-4 w-4 mr-2" />
                      Track an Order
                    </Link>
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    asChild
                  >
                    <Link href="/addresses">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Address
                    </Link>
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    asChild
                  >
                    <Link href="/contact">
                      <Settings className="h-4 w-4 mr-2" />
                      Contact Support
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other tab content... */}
          {activeTab !== "overview" && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                  content coming soon...
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
