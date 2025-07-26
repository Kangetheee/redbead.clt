import Link from "next/link";
import { Suspense } from "react";
import { BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerStats from "./dashboard/customer-stats";
import RecentOrders from "./dashboard/recent-orders";
import RevenueChart from "./dashboard/revenue-chart";
import TopProducts from "./dashboard/top-products";
import DashboardMetrics from "./dashboard/dashboard-metrics";
import { ErrorBoundary } from "react-error-boundary";
import { getSession } from "@/lib/session/session";
import { redirect } from "next/navigation";

// Error fallback component
function ErrorFallback({ componentName }: { componentName: string }) {
  return (
    <div className="rounded-md bg-red-50 p-4 text-center text-red-800 dark:bg-red-900/20 dark:text-red-200">
      <p>Failed to load {componentName}. Please try refreshing the page.</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  // Get session and redirect if not authenticated
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Get user role, with fallback
  const userRole = session?.user?.role || session?.user?.role || "Admin";

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userRole}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/products/create">
            <Button>Add New Product</Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <ErrorBoundary
        fallback={<ErrorFallback componentName="Dashboard Metrics" />}
      >
        <Suspense fallback={<MetricsSkeleton />}>
          <DashboardMetrics />
        </Suspense>
      </ErrorBoundary>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ErrorBoundary
                  fallback={<ErrorFallback componentName="Revenue Chart" />}
                >
                  <Suspense
                    fallback={<Skeleton className="h-[350px] w-full" />}
                  >
                    <RevenueChart />
                  </Suspense>
                </ErrorBoundary>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Recent customer orders and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary
                  fallback={<ErrorFallback componentName="Recent Orders" />}
                >
                  <Suspense fallback={<OrdersSkeleton />}>
                    <RecentOrders />
                  </Suspense>
                </ErrorBoundary>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>
                  Your best selling products this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary
                  fallback={<ErrorFallback componentName="Top Products" />}
                >
                  <Suspense fallback={<ProductsSkeleton />}>
                    <TopProducts />
                  </Suspense>
                </ErrorBoundary>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Customer Stats</CardTitle>
                <CardDescription>
                  Customer acquisition and retention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary
                  fallback={<ErrorFallback componentName="Customer Stats" />}
                >
                  <Suspense
                    fallback={<Skeleton className="h-[350px] w-full" />}
                  >
                    <CustomerStats />
                  </Suspense>
                </ErrorBoundary>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed analytics and insights</CardDescription>
            </CardHeader>
            <CardContent className="h-[450px] flex items-center justify-center">
              <div className="flex flex-col items-center text-center">
                <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-2">
                  Detailed analytics and reporting features are coming soon.
                  Check back for updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and view reports</CardDescription>
            </CardHeader>
            <CardContent className="h-[450px] flex items-center justify-center">
              <div className="flex flex-col items-center text-center">
                <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Report Generation</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-2">
                  Report generation features are coming soon. Check back for
                  updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage your notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[450px] flex items-center justify-center">
              <div className="flex flex-col items-center text-center">
                <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Notification Center</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-2">
                  Notification management features are coming soon. Check back
                  for updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
