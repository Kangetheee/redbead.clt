"use client";

// import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  ShoppingCart,
  Palette,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { useUserProfile } from "@/hooks/use-users";
// import { toast } from "sonner";

// Mock data for orders and designs (since these hooks aren't provided)
const mockRecentOrders = [
  {
    id: "order_123",
    orderNumber: "ORD-2024-001",
    status: "DELIVERED",
    total: 299.99,
    items: 3,
    orderDate: "2024-01-10T14:30:00.000Z",
    deliveryDate: "2024-01-15T10:00:00.000Z",
  },
  {
    id: "order_124",
    orderNumber: "ORD-2024-002",
    status: "SHIPPED",
    total: 199.99,
    items: 2,
    orderDate: "2024-01-14T09:15:00.000Z",
    estimatedDelivery: "2024-01-20T12:00:00.000Z",
  },
  {
    id: "order_125",
    orderNumber: "ORD-2024-003",
    status: "PROCESSING",
    total: 50.0,
    items: 1,
    orderDate: "2024-07-01T10:00:00.000Z",
    estimatedDelivery: "2024-07-08T17:00:00.000Z",
  },
  {
    id: "order_126",
    orderNumber: "ORD-2024-004",
    status: "DESIGN_PENDING",
    total: 120.5,
    items: 2,
    orderDate: "2024-07-05T11:30:00.000Z",
    estimatedDelivery: "2024-07-15T12:00:00.000Z",
  },
];

const mockMyDesigns = [
  {
    id: "design_123",
    name: "Business Card Design V2",
    category: "business-cards",
    thumbnail: "/placeholder.svg?height=150&width=200",
    lastModified: "2024-01-12T16:45:00.000Z",
    isTemplate: false,
  },
  {
    id: "design_124",
    name: "Event Lanyard - Summer Fest",
    category: "lanyards",
    thumbnail: "/placeholder.svg?height=150&width=200",
    lastModified: "2024-06-20T09:00:00.000Z",
    isTemplate: false,
  },
  {
    id: "design_125",
    name: "Company Logo Mug",
    category: "mugs",
    thumbnail: "/placeholder.svg?height=150&width=200",
    lastModified: "2024-05-10T14:00:00.000Z",
    isTemplate: true,
  },
];

export default function CustomerDashboardPage() {
  const router = useRouter();
  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useUserProfile();

  // Handle error state
  if (profileError) {
    // If we get an unauthorized error, redirect to sign in
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
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center text-red-600">
                <XCircle className="h-5 w-5 mr-2" />
                <span>
                  Error loading profile data. Please try refreshing the page.
                </span>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="outline"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading state while loading profile
  if (isLoadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  // Use mock data for orders and designs (replace with actual hooks when available)
  const recentOrders = mockRecentOrders;
  const myDesigns = mockMyDesigns;

  const userName = userProfile?.name || "Customer";
  const userRole = userProfile?.roles_users_roleIdToroles?.name || "Customer";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-gray-50">
              Welcome, {userName}!
            </h1>
            <p className="text-muted-foreground dark:text-gray-400 mt-2">
              Manage your corporate merchandise orders and designs.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentOrders.length > 0 ? `${recentOrders.length}` : "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {recentOrders.length > 0
                  ? "View your order history"
                  : "No orders yet"}
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full mt-4 bg-transparent"
              >
                <Link href="/dashboard/customer/orders">View Orders</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saved Designs
              </CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myDesigns.length}</div>
              <p className="text-xs text-muted-foreground">
                {myDesigns.length > 0
                  ? "Your personalized designs"
                  : "No designs saved"}
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full mt-4 bg-transparent"
              >
                <Link href="/dashboard/customer/design-studio">
                  Manage Designs
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approvals
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Awaiting your design approval
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full mt-4 bg-transparent"
              >
                <Link href="/dashboard/customer/design-approvals">
                  Review Designs
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest merchandise orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.status === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : order.status === "SHIPPED"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "PENDING" ||
                                    order.status === "PROCESSING" ||
                                    order.status === "DESIGN_PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell>
                        {format(new Date(order.orderDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {order.deliveryDate
                          ? format(new Date(order.deliveryDate), "MMM dd, yyyy")
                          : order.estimatedDelivery
                            ? `Est. ${format(new Date(order.estimatedDelivery), "MMM dd, yyyy")}`
                            : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/customer/orders/${order.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No recent orders found.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Saved Designs</CardTitle>
            <CardDescription>Your custom designs for products.</CardDescription>
          </CardHeader>
          <CardContent>
            {myDesigns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myDesigns.map((design) => (
                  <Card key={design.id} className="flex flex-col">
                    <CardContent className="p-4 flex-1">
                      {design.thumbnail && (
                        <Image
                          src={design.thumbnail || "/placeholder.svg"}
                          alt={design.name}
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover rounded-md mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-lg mb-1">
                        {design.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {design.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last Modified:{" "}
                        {format(new Date(design.lastModified), "MMM dd, yyyy")}
                      </p>
                    </CardContent>
                    <div className="p-4 border-t">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                      >
                        <Link
                          href={`/dashboard/customer/design-studio/${design.id}`}
                        >
                          Edit Design
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No saved designs found.{" "}
                <Link
                  href="/dashboard/customer/design-studio"
                  className="underline"
                >
                  Start a new design
                </Link>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            {userProfile ? (
              <div className="space-y-2 text-muted-foreground dark:text-gray-300">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {userProfile.name || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {userProfile.email || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {userProfile.phone || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Role:</span> {userRole}
                </p>
                <p>
                  <span className="font-medium">Account Status:</span>{" "}
                  {userProfile.isActive ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" /> Inactive
                    </span>
                  )}
                </p>
                {userProfile.createdAt && (
                  <p>
                    <span className="font-medium">Member since:</span>{" "}
                    {format(new Date(userProfile.createdAt), "MMM dd, yyyy")}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading account information...
              </div>
            )}
            <Button asChild className="mt-4">
              <Link href="/dashboard/customer/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
