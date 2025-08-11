import React from "react";

export default function OrderConfirmationPage() {
  return <div>OrderConfirmationPage</div>;
}

// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";

// import { useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import {
//   Package,
//   Truck,
//   Clock,
//   MapPin,
//   CreditCard,
//   Phone,
//   Mail,
//   Download,
//   Eye,
//   MessageSquare,
//   CheckCircle,
//   AlertCircle,
//   XCircle,
//   Loader,
//   ArrowLeft,
//   ExternalLink,
// } from "lucide-react";
// import { useOrder, useOrderNotes } from "@/hooks/use-orders";
// import { usePaymentStatus } from "@/hooks/use-payments";
// import { OrderResponse, OrderNote } from "@/lib/orders/types/orders.types";

// // Helper functions moved outside component
// const getStatusIcon = (status: string) => {
//   const iconMap = {
//     PENDING: <Clock className="w-5 h-5 text-yellow-500" />,
//     CONFIRMED: <Clock className="w-5 h-5 text-yellow-500" />,
//     PROCESSING: <Loader className="w-5 h-5 text-blue-500 animate-spin" />,
//     PRODUCTION: <Loader className="w-5 h-5 text-blue-500 animate-spin" />,
//     SHIPPED: <Truck className="w-5 h-5 text-blue-500" />,
//     DELIVERED: <CheckCircle className="w-5 h-5 text-green-500" />,
//     CANCELLED: <XCircle className="w-5 h-5 text-red-500" />,
//     REFUNDED: <XCircle className="w-5 h-5 text-red-500" />,
//   };
//   return iconMap[status] || <Clock className="w-5 h-5 text-gray-500" />;
// };

// const getStatusColor = (status: string): string => {
//   const colorMap = {
//     PENDING: "bg-yellow-100 text-yellow-800",
//     CONFIRMED: "bg-yellow-100 text-yellow-800",
//     PROCESSING: "bg-blue-100 text-blue-800",
//     PRODUCTION: "bg-blue-100 text-blue-800",
//     SHIPPED: "bg-blue-100 text-blue-800",
//     DELIVERED: "bg-green-100 text-green-800",
//     CANCELLED: "bg-red-100 text-red-800",
//     REFUNDED: "bg-red-100 text-red-800",
//   };
//   return colorMap[status] || "bg-gray-100 text-gray-800";
// };

// const getPaymentStatusIcon = (status: string) => {
//   const iconMap = {
//     SUCCESS: <CheckCircle className="w-4 h-4 text-green-500" />,
//     PENDING: <Clock className="w-4 h-4 text-yellow-500" />,
//     FAILED: <XCircle className="w-4 h-4 text-red-500" />,
//   };
//   return iconMap[status] || <Clock className="w-4 h-4 text-gray-500" />;
// };

// // Component for loading state
// const LoadingState = () => (
//   <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//     <div className="text-center">
//       <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
//       <p className="text-gray-600">Loading order details...</p>
//     </div>
//   </div>
// );

// // Component for error state
// const ErrorState = ({ onReturnHome }: { onReturnHome: () => void }) => (
//   <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//     <div className="text-center max-w-md">
//       <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//       <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
//       <p className="text-gray-600 mb-6">
//         We couldn&apos;t find the order you&apos;re looking for. It may have been moved or
//         deleted.
//       </p>
//       <Button onClick={onReturnHome} className="inline-flex items-center gap-2">
//         <ArrowLeft className="w-4 h-4" />
//         Return Home
//       </Button>
//     </div>
//   </div>
// );

// // Component for order status timeline
// const OrderStatusTimeline = ({ order }: { order: OrderResponse }) => {
//   const timelineSteps = [
//     {
//       key: "confirmed",
//       title: "Order Confirmed",
//       description: `${new Date(order.createdAt).toLocaleDateString()} at ${new Date(order.createdAt).toLocaleTimeString()}`,
//       completed: true,
//     },
//     {
//       key: "processing",
//       title: "Processing Started",
//       description: "Your order is being prepared",
//       completed: order.status !== "PENDING",
//     },
//     {
//       key: "production",
//       title: "In Production",
//       description: "Your custom items are being made",
//       completed: ["PRODUCTION", "SHIPPED", "DELIVERED"].includes(order.status),
//     },
//     {
//       key: "shipped",
//       title: "Shipped",
//       description: order.trackingNumber
//         ? `Tracking: ${order.trackingNumber}`
//         : "On its way to you",
//       completed: ["SHIPPED", "DELIVERED"].includes(order.status),
//     },
//     {
//       key: "delivered",
//       title: "Delivered",
//       description: order.actualDeliveryDate
//         ? new Date(order.actualDeliveryDate).toLocaleDateString()
//         : "Successfully delivered",
//       completed: order.status === "DELIVERED",
//     },
//   ];

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Order Status</CardTitle>
//         <CardDescription>Track your order progress</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {timelineSteps.map(
//             (step) =>
//               step.completed && (
//                 <div key={step.key} className="flex items-center gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-500" />
//                   <div>
//                     <p className="font-medium">{step.title}</p>
//                     <p className="text-sm text-gray-600">{step.description}</p>
//                   </div>
//                 </div>
//               )
//           )}
//         </div>

//         {order.trackingNumber && (
//           <Alert className="mt-6 border-blue-200 bg-blue-50">
//             <Truck className="w-4 h-4" />
//             <AlertDescription>
//               <div className="space-y-3">
//                 <div>
//                   <p className="font-medium text-blue-900">
//                     Track Your Package
//                   </p>
//                   <p className="text-sm text-blue-800">
//                     Tracking Number: {order.trackingNumber}
//                   </p>
//                 </div>
//                 {order.trackingUrl && (
//                   <Button size="sm" asChild>
//                     <Link
//                       href={order.trackingUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       <Eye className="w-4 h-4 mr-2" />
//                       Track Package
//                       <ExternalLink className="w-3 h-3 ml-1" />
//                     </Link>
//                   </Button>
//                 )}
//               </div>
//             </AlertDescription>
//           </Alert>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// // Component for payment information
// const PaymentInformation = ({
//   order,
//   paymentStatus,
// }: {
//   order: OrderResponse;
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   paymentStatus: any;
// }) => (
//   <Card>
//     <CardHeader>
//       <CardTitle className="flex items-center gap-2">
//         <CreditCard className="w-5 h-5" />
//         Payment Information
//       </CardTitle>
//     </CardHeader>
//     <CardContent>
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <span>Payment Status</span>
//           <div className="flex items-center gap-2">
//             {paymentStatus && getPaymentStatusIcon(paymentStatus.paymentStatus)}
//             <span className="capitalize">
//               {paymentStatus?.paymentStatus.toLowerCase() || "Processing"}
//             </span>
//           </div>
//         </div>

//         {order.payment?.method && (
//           <div className="flex items-center justify-between">
//             <span>Payment Method</span>
//             <span className="capitalize">{order.payment.method}</span>
//           </div>
//         )}

//         {paymentStatus?.transactionId && (
//           <div className="flex items-center justify-between">
//             <span>Transaction ID</span>
//             <span className="font-mono text-sm break-all">
//               {paymentStatus.transactionId}
//             </span>
//           </div>
//         )}

//         <Separator />
//         <div className="flex items-center justify-between font-medium text-lg">
//           <span>Total Paid</span>
//           <span>${order.totalAmount.toFixed(2)}</span>
//         </div>
//       </div>
//     </CardContent>
//   </Card>
// );

// // Component for shipping information
// const ShippingInformation = ({ order }: { order: OrderResponse }) => (
//   <Card>
//     <CardHeader>
//       <CardTitle className="flex items-center gap-2">
//         <MapPin className="w-5 h-5" />
//         Shipping Information
//       </CardTitle>
//     </CardHeader>
//     <CardContent>
//       <div className="space-y-4">
//         <div>
//           <h4 className="font-medium mb-2">Delivery Address</h4>
//           <address className="text-sm text-gray-600 not-italic">
//             <p>{order.shippingAddress.recipientName}</p>
//             <p>{order.shippingAddress.street}</p>
//             {order.shippingAddress.street2 && (
//               <p>{order.shippingAddress.street2}</p>
//             )}
//             <p>
//               {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
//               {order.shippingAddress.postalCode}
//             </p>
//             <p>{order.shippingAddress.country}</p>
//             {order.shippingAddress.phone && (
//               <p className="flex items-center gap-1 mt-1">
//                 <Phone className="w-3 h-3" />
//                 <a
//                   href={`tel:${order.shippingAddress.phone}`}
//                   className="hover:underline"
//                 >
//                   {order.shippingAddress.phone}
//                 </a>
//               </p>
//             )}
//           </address>
//         </div>

//         {order.expectedDelivery && (
//           <div>
//             <h4 className="font-medium mb-2">Expected Delivery</h4>
//             <p className="text-sm text-gray-600">
//               {new Date(order.expectedDelivery).toLocaleDateString()}
//             </p>
//           </div>
//         )}
//       </div>
//     </CardContent>
//   </Card>
// );

// // Component for order items
// const OrderItems = ({ order }: { order: OrderResponse }) => (
//   <Card>
//     <CardHeader>
//       <CardTitle className="flex items-center gap-2">
//         <Package className="w-5 h-5" />
//         Order Items
//       </CardTitle>
//     </CardHeader>
//     <CardContent>
//       <div className="space-y-4">
//         {Array.isArray(order.orderItems) &&
//           order.orderItems.map((item, index) => (
//             <div
//               key={item.id || index}
//               className="flex items-start gap-4 p-4 border rounded-lg"
//             >
//               <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
//                 <Package className="w-6 h-6 text-gray-400" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <h4 className="font-medium truncate">
//                   {item.template?.name || `Template ${item.templateId}`}
//                 </h4>
//                 <p className="text-sm text-gray-600">
//                   Size: {item.sizeVariant?.displayName || item.sizeVariantId}
//                 </p>
//                 <p className="text-sm text-gray-600">
//                   Quantity: {item.quantity}
//                 </p>
//                 {item.status && (
//                   <Badge className={`mt-2 ${getStatusColor(item.status)}`}>
//                     {item.status.replace("_", " ")}
//                   </Badge>
//                 )}
//               </div>
//             </div>
//           ))}
//       </div>
//     </CardContent>
//   </Card>
// );

// // Component for order notes
// const OrderNotes = ({ orderNotes }: { orderNotes: OrderNote[] }) => (
//   <Card>
//     <CardHeader>
//       <CardTitle className="flex items-center gap-2">
//         <MessageSquare className="w-5 h-5" />
//         Order Notes
//       </CardTitle>
//     </CardHeader>
//     <CardContent>
//       <div className="space-y-4">
//         {orderNotes.slice(0, 3).map((note) => (
//           <div key={note.id} className="border-l-4 border-blue-500 pl-4">
//             <div className="flex items-center justify-between mb-1">
//               <p className="font-medium text-sm">{note.title || note.type}</p>
//               <time className="text-xs text-gray-500" dateTime={note.createdAt}>
//                 {new Date(note.createdAt).toLocaleDateString()}
//               </time>
//             </div>
//             <p className="text-sm text-gray-600">{note.content}</p>
//           </div>
//         ))}
//         {orderNotes.length > 3 && (
//           <p className="text-sm text-gray-500">
//             And {orderNotes.length - 3} more notes...
//           </p>
//         )}
//       </div>
//     </CardContent>
//   </Card>
// );

// // Component for order summary
// const OrderSummary = ({
//   order,
//   onContinueShopping,
// }: {
//   order: OrderResponse;
//   onContinueShopping: () => void;
// }) => (
//   <Card className="sticky top-8">
//     <CardHeader>
//       <CardTitle>Order Summary</CardTitle>
//       <CardDescription>Order #{order.orderNumber}</CardDescription>
//     </CardHeader>
//     <CardContent>
//       <div className="space-y-3">
//         <div className="flex justify-between text-sm">
//           <span>Subtotal</span>
//           <span>${order.subtotalAmount.toFixed(2)}</span>
//         </div>
//         <div className="flex justify-between text-sm">
//           <span>Shipping</span>
//           <span>${order.shippingAmount.toFixed(2)}</span>
//         </div>
//         <div className="flex justify-between text-sm">
//           <span>Tax</span>
//           <span>${order.taxAmount.toFixed(2)}</span>
//         </div>
//         {order.discountAmount > 0 && (
//           <div className="flex justify-between text-sm text-green-600">
//             <span>Discount</span>
//             <span>-${order.discountAmount.toFixed(2)}</span>
//           </div>
//         )}
//         <Separator />
//         <div className="flex justify-between font-medium text-lg">
//           <span>Total</span>
//           <span>${order.totalAmount.toFixed(2)}</span>
//         </div>
//       </div>

//       <div className="mt-6 space-y-3">
//         <Button className="w-full" variant="outline">
//           <Download className="w-4 h-4 mr-2" />
//           Download Invoice
//         </Button>

//         <Button className="w-full" onClick={onContinueShopping}>
//           Continue Shopping
//         </Button>
//       </div>

//       {/* Support Section */}
//       <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//         <div className="flex items-center gap-2 mb-2">
//           <Mail className="w-4 h-4 text-gray-600" />
//           <p className="text-sm font-medium">Need Help?</p>
//         </div>
//         <p className="text-xs text-gray-600 mb-3">
//           Questions about your order? We&apos;re here to help.
//         </p>
//         <div className="space-y-1">
//           <div className="flex items-center gap-2">
//             <Phone className="w-3 h-3 text-gray-500" />
//             <a
//               href="tel:+254700000000"
//               className="text-xs text-gray-500 hover:underline"
//             >
//               +254 700 000 000
//             </a>
//           </div>
//           <div className="flex items-center gap-2">
//             <Mail className="w-3 h-3 text-gray-500" />
//             <a
//               href="mailto:support@yourstore.com"
//               className="text-xs text-gray-500 hover:underline"
//             >
//               support@yourstore.com
//             </a>
//           </div>
//         </div>
//       </div>
//     </CardContent>
//   </Card>
// );

// // Main component
// export default function OrderConfirmationPage() {
//   const params = useParams();
//   const router = useRouter();
//   const orderId = params.orderId as string;

//   const {
//     data: order,
//     isLoading: orderLoading,
//     error: orderError,
//   } = useOrder(orderId);
//   const { data: paymentStatus, isLoading: paymentLoading } =
//     usePaymentStatus(orderId);
//   const { data: orderNotes } = useOrderNotes(orderId);

//   const handleReturnHome = () => router.push("/");
//   const handleContinueShopping = () => router.push("/");

//   // Loading state
//   if (orderLoading) {
//     return <LoadingState />;
//   }

//   // Error state
//   if (orderError || !order) {
//     return <ErrorState onReturnHome={handleReturnHome} />;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4 max-w-6xl">
//         {/* Header */}
//         <header className="mb-8">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">
//                 Order Details
//               </h1>
//               <p className="text-gray-600">Order #{order.orderNumber}</p>
//             </div>
//             <div className="flex items-center gap-2">
//               {getStatusIcon(order.status)}
//               <Badge className={getStatusColor(order.status)}>
//                 {order.status.replace("_", " ")}
//               </Badge>
//             </div>
//           </div>
//         </header>

//         <div className="grid lg:grid-cols-3 gap-8">
//           <main className="lg:col-span-2 space-y-6">
//             <OrderStatusTimeline order={order} />
//             <PaymentInformation order={order} paymentStatus={paymentStatus} />
//             <ShippingInformation order={order} />
//             <OrderItems order={order} />
//             {orderNotes && orderNotes.length > 0 && (
//               <OrderNotes orderNotes={orderNotes} />
//             )}
//           </main>

//           <aside className="lg:col-span-1">
//             <OrderSummary
//               order={order}
//               onContinueShopping={handleContinueShopping}
//             />
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// }
