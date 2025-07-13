import { redirect } from "next/navigation";
import { getSession } from "@/lib/session/session";
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
import { format } from "date-fns";

// Mock Data for all orders
const mockAllOrders = [
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
  {
    id: "order_127",
    orderNumber: "ORD-2024-005",
    status: "CANCELLED",
    total: 75.0,
    items: 1,
    orderDate: "2024-06-10T08:00:00.000Z",
    deliveryDate: null,
  },
  {
    id: "order_128",
    orderNumber: "ORD-2024-006",
    status: "PAYMENT_PENDING",
    total: 350.0,
    items: 4,
    orderDate: "2024-07-10T15:00:00.000Z",
    estimatedDelivery: "2024-07-22T12:00:00.000Z",
  },
];

export default async function CustomerOrdersPage() {
  const session = await getSession();

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const orders = mockAllOrders;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-gray-50">
              Order History
            </h1>
            <p className="text-muted-foreground dark:text-gray-400 mt-2">
              View all your past and current merchandise orders.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/customer/orders/create">Create New Order</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>
              A comprehensive list of your orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
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
                  {orders.map((order) => (
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
                                    order.status === "DESIGN_PENDING" ||
                                    order.status === "PAYMENT_PENDING"
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
                No orders found.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
