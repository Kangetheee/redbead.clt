import { TableHeader } from "@/components/ui/table";
import { TableCell } from "@/components/ui/table";
import { TableBody } from "@/components/ui/table";
import { TableHead } from "@/components/ui/table";
import { TableRow } from "@/components/ui/table";
import { Table } from "@/components/ui/table";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";
import { Truck, CheckCircle, XCircle, Clock } from "lucide-react";

// Mock Data for a single order detail
const mockOrderDetail = {
  id: "order_123",
  customerId: "clxxxxx-customer-1",
  orderNumber: "ORD-2024-0001",
  status: "SHIPPED",
  totalAmount: 249.5,
  subtotalAmount: 229,
  discountAmount: 0,
  taxAmount: 20.5,
  shippingAmount: 0,
  trackingNumber: "TRK123456789",
  trackingUrl: "https://example.com/track/TRK123456789",
  expectedDelivery: "2024-01-25T00:00:00.000Z",
  notes: "Customer requested a proof before production.",
  urgencyLevel: "NORMAL",
  expectedProductionDays: 5,
  specialInstructions: "Double-check logo alignment.",
  designApprovalRequired: true,
  designApprovalStatus: "APPROVED",
  designApprovalRequestedAt: "2024-01-15T10:30:00.000Z",
  designApprovalCompletedAt: "2024-01-16T10:30:00.000Z",
  designApproval: {
    id: "clxxxxx-approval-1",
    orderId: "clxxxxx-order-1",
    orderNumber: "ORD-2024-0001",
    designId: "clxxxxx-design-1",
    status: "APPROVED",
    customerEmail: "john.doe@example.com",
    previewImages: [
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
    ],
    designSummary: {
      productName: "Custom Fabric Wristband",
      quantity: 100,
      material: "Polyester",
      text: "EVENT 2024",
      colors: ["Blue", "White"],
    },
    requestedAt: "2024-01-15T10:30:00.000Z",
    respondedAt: "2024-01-16T10:30:00.000Z",
    approvedBy: "john.doe@example.com",
    rejectionReason: null,
    expiresAt: "2024-01-18T10:30:00.000Z",
    isExpired: false,
    canApprove: false,
    canReject: false,
    timeRemaining: "Expired",
    comments: "Looks great!",
    requestRevision: null,
    message: "Design approved successfully. Production will begin shortly.",
    orderDetails: {
      orderNumber: "ORD-2024-0001",
      totalAmount: 249.5,
      itemCount: 1,
      customer: { name: "John Doe", company: "Acme Corp" },
    },
  },
  shippingAddress: {
    id: "clxxxxx-address-1",
    name: "Home Address",
    recipientName: "John Doe",
    companyName: "Acme Corp",
    street: "123 Main Street",
    street2: "Apt 4B",
    city: "Nairobi",
    state: "Nairobi County",
    postalCode: "00100",
    country: "KE",
    phone: "+254712345678",
    addressType: "SHIPPING",
    isDefault: true,
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-15T10:30:00.000Z",
    formattedAddress:
      "John Doe, 123 Main Street, Apt 4B, Nairobi, Nairobi County 00100, KE",
  },
  billingAddress: {
    id: "clxxxxx-address-2",
    name: "Billing Address",
    recipientName: "John Doe",
    companyName: "Acme Corp",
    street: "456 Business Ave",
    street2: null,
    city: "Nairobi",
    state: "Nairobi County",
    postalCode: "00200",
    country: "KE",
    phone: "+254712345678",
    addressType: "BILLING",
    isDefault: true,
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-15T10:30:00.000Z",
    formattedAddress:
      "John Doe, 456 Business Ave, Nairobi, Nairobi County 00200, KE",
  },
  orderItems: [
    {
      id: "clxxxxx-order-item-1",
      productId: "clxxxxx-product-1",
      quantity: 100,
      customizations: [
        { optionId: "material", valueId: "polyester", customValue: null },
        { optionId: "print_type", valueId: "screen_print", customValue: null },
      ],
      designId: "clxxxxx-design-1",
      product: {
        id: "clxxxxx-product-1",
        name: "Custom Fabric Wristband",
        basePrice: 1.99,
        thumbnailImage: "/placeholder.svg?height=50&width=50",
      },
      totalPrice: 199.0,
      createdAt: "2024-01-15T10:30:00.000Z",
      updatedAt: "2024-01-15T10:30:00.000Z",
    },
  ],
  payment: {
    method: "MPESA",
    status: "CONFIRMED",
    amount: 249.5,
    currency: "KES",
    transactionId: "MPESA-TXN-12345",
    phone: "+254712345678",
  },
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z",
};

const mockOrderTracking = {
  orderId: "order_123",
  orderNumber: "ORD-2024-001",
  status: "shipped",
  trackingNumber: "TRK123456789",
  carrier: "UPS",
  estimatedDelivery: "2024-01-18T17:00:00.000Z",
  timeline: [
    {
      status: "order_placed",
      timestamp: "2024-01-10T14:30:00.000Z",
      description: "Order placed successfully",
      location: "Online",
    },
    {
      status: "processing",
      timestamp: "2024-01-11T09:00:00.000Z",
      description: "Order is being processed",
      location: "Fulfillment Center",
    },
    {
      status: "shipped",
      timestamp: "2024-01-12T15:30:00.000Z",
      description: "Package shipped",
      location: "Distribution Center",
    },
    {
      status: "in_transit",
      timestamp: "2024-01-13T08:00:00.000Z",
      description: "In transit to destination",
      location: "Regional Hub",
    },
  ],
  shippingAddress: {
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA",
  },
};

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  // Use mock data directly
  const order = mockOrderDetail;
  const tracking = mockOrderTracking;

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">Order Not Found</h1>
        <p className="text-muted-foreground mt-2">
          The order with ID &quot;{params.id}&quot; could not be found.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/customer/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-gray-50">
              Order #{order.orderNumber}
            </h1>
            <p className="text-muted-foreground dark:text-gray-400 mt-2">
              Details for your order placed on{" "}
              {format(new Date(order.createdAt), "MMM dd, yyyy")}.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/customer/orders">Back to Orders</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-lg font-semibold">
                {order.status === "DELIVERED" && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {order.status === "SHIPPED" && (
                  <Truck className="h-5 w-5 text-blue-500" />
                )}
                {(order.status === "PENDING" ||
                  order.status === "PROCESSING" ||
                  order.status === "DESIGN_PENDING" ||
                  order.status === "PAYMENT_PENDING") && (
                  <Clock className="h-5 w-5 text-yellow-500" />
                )}
                {order.status === "CANCELLED" && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {order.status.replace(/_/g, " ")}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Estimated Delivery:{" "}
                {order.expectedDelivery
                  ? format(new Date(order.expectedDelivery), "MMM dd, yyyy")
                  : "N/A"}
              </p>
              {order.trackingNumber && (
                <p className="text-sm text-muted-foreground mt-1">
                  Tracking #:{" "}
                  <Link
                    href={order.trackingUrl || "#"}
                    className="underline"
                    target="_blank"
                  >
                    {order.trackingNumber}
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${order.subtotalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>${order.shippingAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${order.taxAmount.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-foreground text-lg">
                <span>Total:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>
                <span className="font-medium">Method:</span>{" "}
                {order.payment.method}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    order.payment.status === "CONFIRMED"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.payment.status}
                </span>
              </p>
              <p>
                <span className="font-medium">Amount:</span> $
                {order.payment.amount.toFixed(2)} {order.payment.currency}
              </p>
              {order.payment.transactionId && (
                <p>
                  <span className="font-medium">Transaction ID:</span>{" "}
                  {order.payment.transactionId}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Customizations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.orderItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {item.product.thumbnailImage && (
                        <Image
                          src={
                            item.product.thumbnailImage || "/placeholder.svg"
                          }
                          alt={item.product.name}
                          width={40}
                          height={40}
                          className="rounded-md"
                        />
                      )}
                      {item.product.name}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.product.basePrice.toFixed(2)}</TableCell>
                    <TableCell>${item.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.customizations && item.customizations.length > 0 ? (
                        <ul className="list-disc list-inside text-xs text-muted-foreground">
                          {item.customizations.map((c, idx) => (
                            <li key={idx}>
                              {c.optionId}: {c.valueId || c.customValue}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Shipping & Billing Addresses</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-lg mb-2">Shipping Address</h3>
              <address className="not-italic text-muted-foreground space-y-1">
                <p>{order.shippingAddress.recipientName}</p>
                {order.shippingAddress.companyName && (
                  <p>{order.shippingAddress.companyName}</p>
                )}
                <p>{order.shippingAddress.street}</p>
                {order.shippingAddress.street2 && (
                  <p>{order.shippingAddress.street2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p>Phone: {order.shippingAddress.phone}</p>
                )}
              </address>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Billing Address</h3>
              <address className="not-italic text-muted-foreground space-y-1">
                <p>{order.billingAddress.recipientName}</p>
                {order.billingAddress.companyName && (
                  <p>{order.billingAddress.companyName}</p>
                )}
                <p>{order.billingAddress.street}</p>
                {order.billingAddress.street2 && (
                  <p>{order.billingAddress.street2}</p>
                )}
                <p>
                  {order.billingAddress.city}, {order.billingAddress.state}{" "}
                  {order.billingAddress.postalCode}
                </p>
                <p>{order.billingAddress.country}</p>
                {order.billingAddress.phone && (
                  <p>Phone: {order.billingAddress.phone}</p>
                )}
              </address>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            {tracking.timeline.length > 0 ? (
              <div className="relative pl-6">
                {tracking.timeline.map((event, index) => (
                  <div key={index} className="mb-8 last:mb-0 flex items-start">
                    <div className="absolute left-0 flex flex-col items-center h-full">
                      <div className="w-3 h-3 rounded-full bg-primary z-10" />
                      {index < tracking.timeline.length - 1 && (
                        <div className="w-[2px] bg-gray-300 dark:bg-gray-700 flex-grow mt-2" />
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{event.description}</h3>
                        <span className="text-sm text-muted-foreground">
                          {format(
                            new Date(event.timestamp),
                            "MMM dd, yyyy hh:mm a"
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No tracking information available yet.
              </p>
            )}
          </CardContent>
        </Card>

        {order.notes && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {order.designApprovalRequired && order.designApproval && (
          <Card>
            <CardHeader>
              <CardTitle>Design Approval Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                Status:{" "}
                <span
                  className={`px-2 py-1 rounded-full text-sm font-semibold ${
                    order.designApproval.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : order.designApproval.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.designApproval.status}
                </span>
              </div>
              <p className="text-muted-foreground">
                Requested On:{" "}
                {format(
                  new Date(order.designApproval.requestedAt),
                  "MMM dd, yyyy hh:mm a"
                )}
              </p>
              {order.designApproval.respondedAt && (
                <p className="text-muted-foreground">
                  Responded On:{" "}
                  {format(
                    new Date(order.designApproval.respondedAt),
                    "MMM dd, yyyy hh:mm a"
                  )}
                </p>
              )}
              {order.designApproval.comments && (
                <p className="text-muted-foreground">
                  Comments: {order.designApproval.comments}
                </p>
              )}
              {order.designApproval.rejectionReason && (
                <p className="text-muted-foreground text-red-600">
                  Rejection Reason: {order.designApproval.rejectionReason}
                </p>
              )}

              {order.designApproval.previewImages &&
                order.designApproval.previewImages.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Design Previews:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {order.designApproval.previewImages.map((img, idx) => (
                        <Image
                          key={idx}
                          src={img || "/placeholder.svg"}
                          alt={`Design Preview ${idx + 1}`}
                          width={300}
                          height={200}
                          className="rounded-md object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}

              {order.designApproval.canApprove && (
                <Button className="mt-4">Approve Design</Button>
              )}
              {order.designApproval.canReject && (
                <Button variant="destructive" className="mt-4 ml-2">
                  Reject Design
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
