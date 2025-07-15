"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import {
  ShoppingCart,
  Palette,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Package,
  Eye,
  Plus,
  ArrowRight,
  Star,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useUserProfile } from "@/hooks/use-users";
import { useOrders } from "@/hooks/use-orders";
import { useUserDesignsList } from "@/hooks/use-designs";
import { useFeaturedProducts } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { useInitializeCheckout } from "@/hooks/use-checkout";
import { CartFloatingButton } from "@/components/cart/cart-floating-button";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderResponse } from "@/lib/orders/types/orders.types";
import { DesignResponseDto } from "@/lib/designs/dto/designs.dto";

export default function CustomerDashboardPage() {
  const router = useRouter();

  // Data fetching hooks
  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useUserProfile();
  const {
    data: recentOrdersResponse,
    isLoading: isLoadingOrders,
    error: ordersError,
  } = useOrders({
    page: 1,
    limit: 5,
  });
  const {
    data: userDesignsResponse,
    isLoading: isLoadingDesigns,
    error: designsError,
  } = useUserDesignsList({
    page: 1,
    limit: 6,
  });
  const { data: featuredProducts, isLoading: isLoadingProducts } =
    useFeaturedProducts(6);
  const { data: cart, isLoading: isLoadingCart } = useCart();

  // Checkout initialization
  const initializeCheckoutMutation = useInitializeCheckout();

  // Handle quick checkout
  const handleQuickCheckout = async () => {
    if (!cart?.items.length) {
      router.push("/dashboard/customer/browse");
      return;
    }

    try {
      const result = await initializeCheckoutMutation.mutateAsync({
        useCartItems: true,
      });

      if (result.success) {
        router.push(
          `/dashboard/customer/checkout?session=${result.data.sessionId}`
        );
      }
    } catch (error) {
      console.error("Failed to initialize checkout:", error);
    }
  };

  // Extract data from responses safely
  const recentOrders = recentOrdersResponse?.success
    ? recentOrdersResponse.data
    : null;
  const userDesigns = userDesignsResponse; // This returns PaginatedDesignsResponseDto directly

  // Calculate dashboard stats
  const totalOrders = recentOrders?.meta?.totalItems || 0;
  const totalDesigns = userDesigns?.meta?.totalItems || 0;
  const cartItemCount = cart?.summary.itemCount || 0;
  const cartTotal = cart?.summary.total || 0;

  // Count pending approvals (orders with design approval status)
  const pendingApprovals =
    recentOrders?.items?.filter(
      (order: OrderResponse) =>
        order.status === "DESIGN_PENDING" || order.designApprovalRequired
    ).length || 0;

  // Order status styling
  const getOrderStatusBadge = (status: string) => {
    const config = {
      DELIVERED: {
        variant: "default" as const,
        className: "bg-green-600 text-white",
      },
      SHIPPED: {
        variant: "default" as const,
        className: "bg-blue-600 text-white",
      },
      PROCESSING: {
        variant: "default" as const,
        className: "bg-orange-600 text-white",
      },
      DESIGN_PENDING: {
        variant: "outline" as const,
        className: "border-yellow-500 text-yellow-700",
      },
      PENDING: {
        variant: "outline" as const,
        className: "border-yellow-500 text-yellow-700",
      },
      CANCELLED: { variant: "destructive" as const, className: "" },
    };

    const statusConfig = config[status as keyof typeof config] || {
      variant: "outline" as const,
      className: "border-gray-500 text-gray-700",
    };

    return (
      <Badge variant={statusConfig.variant} className={statusConfig.className}>
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  // Error handling
  if (profileError) {
    if (
      profileError.message?.includes("401") ||
      profileError.message?.includes("unauthorized")
    ) {
      router.push("/sign-in");
      return null;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading profile data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  const userName = userProfile?.name || "Customer";
  const userRole = userProfile?.roles_users_roleIdToroles?.name || "Customer";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {userName}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your corporate merchandise orders and designs.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <Button asChild variant="outline">
              <Link href="/dashboard/customer/browse">
                <Package className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </Button>

            {cartItemCount > 0 && (
              <Button
                onClick={handleQuickCheckout}
                disabled={initializeCheckoutMutation.isPending}
              >
                {initializeCheckoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-2" />
                )}
                {initializeCheckoutMutation.isPending
                  ? "Processing..."
                  : "Quick Checkout"}
              </Button>
            )}
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingOrders ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  totalOrders
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalOrders > 0 ? "View your order history" : "No orders yet"}
              </p>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/dashboard/customer/orders">View Orders</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Shopping Cart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Shopping Cart
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingCart ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  cartItemCount
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {cartItemCount > 0
                  ? `KES ${cartTotal.toLocaleString()} total`
                  : "No items in cart"}
              </p>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/dashboard/customer/cart">
                  {cartItemCount > 0 ? "View Cart" : "Start Shopping"}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Saved Designs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saved Designs
              </CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingDesigns ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  totalDesigns
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalDesigns > 0
                  ? "Your personalized designs"
                  : "No designs saved"}
              </p>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/dashboard/customer/design-studio">
                  {totalDesigns > 0 ? "Manage Designs" : "Create Design"}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approvals
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingOrders ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  pendingApprovals
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting your design approval
              </p>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/dashboard/customer/orders?status=DESIGN_PENDING">
                  Review Designs
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Featured Products */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Featured Products</CardTitle>
              <CardDescription>Popular items you might like</CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/customer/browse">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <Skeleton className="w-full h-32 mb-3" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-3" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredProducts && featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="group hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="relative mb-3">
                        <img
                          src={product.thumbnailImage || "/placeholder.svg"}
                          alt={product.name}
                          width={200}
                          height={120}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        {product.isFeatured && (
                          <Badge className="absolute top-2 right-2 bg-yellow-500">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-medium text-sm mb-1 line-clamp-2">
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold">
                          KES {product.basePrice.toLocaleString()}
                        </span>
                        {/* Remove averageRating references until properly typed */}
                      </div>

                      <div className="space-y-2">
                        <AddToCartButton
                          productId={product.id}
                          quantity={product.minOrderQuantity}
                          size="sm"
                          className="w-full"
                        />

                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Link
                            href={`/dashboard/customer/products/${product.slug}`}
                          >
                            <Eye className="h-3 w-3 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No Featured Products"
                description="Check back later for our featured product recommendations."
                action={{
                  label: "Browse All Products",
                  onClick: () => router.push("/dashboard/customer/browse"),
                }}
              />
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Your latest merchandise orders
                </CardDescription>
              </div>
              {totalOrders > 5 && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/customer/orders">View All</Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : ordersError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load recent orders. Please try again.
                  </AlertDescription>
                </Alert>
              ) : recentOrders &&
                recentOrders.items &&
                recentOrders.items.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.items.map((order: OrderResponse) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.orderItems?.length || 0} items • KES{" "}
                            {order.totalAmount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(order.createdAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        {getOrderStatusBadge(order.status)}
                        <div>
                          <Button asChild variant="outline" size="sm">
                            <Link
                              href={`/dashboard/customer/orders/${order.id}`}
                            >
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={ShoppingCart}
                  title="No Orders Yet"
                  description="Start shopping to see your orders here."
                  action={{
                    label: "Browse Products",
                    onClick: () => router.push("/dashboard/customer/browse"),
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* My Saved Designs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Saved Designs</CardTitle>
                <CardDescription>
                  Your custom designs for products
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {totalDesigns > 6 && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/customer/design-studio/saved-designs">
                      View All
                    </Link>
                  </Button>
                )}
                <Button asChild size="sm">
                  <Link href="/dashboard/customer/design-studio/create">
                    <Plus className="h-4 w-4 mr-2" />
                    New Design
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingDesigns ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <Skeleton className="w-full h-20 mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : designsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load designs. Please try again.
                  </AlertDescription>
                </Alert>
              ) : userDesigns &&
                userDesigns.items &&
                userDesigns.items.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {userDesigns.items
                    .slice(0, 4)
                    .map((design: DesignResponseDto) => (
                      <Card
                        key={design.id}
                        className="group hover:shadow-sm transition-shadow"
                      >
                        <CardContent className="p-3">
                          <div className="relative mb-2">
                            <img
                              src={design.preview || "/placeholder.svg"}
                              alt={design.name}
                              width={120}
                              height={80}
                              className="w-full h-20 object-cover rounded-md"
                            />
                            {design.isTemplate && (
                              <Badge
                                variant="secondary"
                                className="absolute top-1 right-1 text-xs"
                              >
                                Template
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-sm mb-1 line-clamp-1">
                            {design.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            {format(new Date(design.updatedAt), "MMM dd")}
                          </p>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Link
                              href={`/dashboard/customer/design-studio/edit/${design.id}`}
                            >
                              Edit
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <EmptyState
                  icon={Palette}
                  title="No Saved Designs"
                  description="Create your first custom design to get started."
                  action={{
                    label: "Start Designing",
                    onClick: () =>
                      router.push("/dashboard/customer/design-studio/create"),
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            {userProfile ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-sm">Name:</span>
                    <p className="text-muted-foreground">
                      {userProfile.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Email:</span>
                    <p className="text-muted-foreground">
                      {userProfile.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Phone:</span>
                    <p className="text-muted-foreground">
                      {userProfile.phone || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-sm">Role:</span>
                    <p className="text-muted-foreground">{userRole}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Account Status:</span>
                    <div className="flex items-center gap-2">
                      {userProfile.isActive ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-red-600">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                  {userProfile.createdAt && (
                    <div>
                      <span className="font-medium text-sm">Member since:</span>
                      <p className="text-muted-foreground">
                        {format(
                          new Date(userProfile.createdAt),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading account information...
              </div>
            )}
            <Button asChild className="mt-6">
              <Link href="/dashboard/customer/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Floating Cart Button */}
        <CartFloatingButton />
      </div>
    </div>
  );
}
