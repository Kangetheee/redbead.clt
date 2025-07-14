// import { DashboardHeader } from "@/components/shared/dashboard-header"
// import { Breadcrumbs } from "@/components/shared/breadcrumbs"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { CheckCircle } from "lucide-react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { mockOrders, type Order } from "@/lib/mock-data"
// import { notFound } from "next/navigation"
// import Image from "next/image"

// interface OrderConfirmationPageProps {
//   params: {
//     orderId: string
//   }
// }

// export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
//   const orderId = params.orderId
//   const order: Order | undefined = mockOrders.find((o) => o.id === orderId)

//   if (!order) {
//     notFound() // Or show a generic "Order not found" message
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 md:py-12">
//       <Breadcrumbs
//         items={[
//           { href: "/dashboard/customer/orders", label: "Orders" },
//           { href: `/dashboard/customer/checkout/confirmation/${orderId}`, label: "Order Confirmation" },
//         ]}
//       />
//       <DashboardHeader
//         title="Order Confirmed!"
//         description={`Thank you for your purchase. Your order #${order.id} has been placed.`}
//       />

//       <Card className="text-center py-10">
//         <CardHeader className="flex flex-col items-center">
//           <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
//           <CardTitle className="text-3xl font-bold">Your Order is Confirmed!</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <p className="text-lg text-gray-700 dark:text-gray-300">
//             Order Number: <span className="font-semibold">{order.id}</span>
//           </p>
//           <p className="text-gray-600 dark:text-gray-400">
//             You will receive an email confirmation shortly with details and tracking information.
//           </p>
//           <div className="mt-6 space-y-4">
//             <h3 className="text-xl font-semibold">Order Details</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
//               <div>
//                 <p className="font-medium">Order Date:</p>
//                 <p>{new Date(order.date).toLocaleDateString()}</p>
//               </div>
//               <div>
//                 <p className="font-medium">Order Total:</p>
//                 <p>${order.total.toFixed(2)}</p>
//               </div>
//               <div className="md:col-span-2">
//                 <p className="font-medium">Items:</p>
//                 <ul className="list-disc list-inside text-sm">
//                   {order.items.map((item) => (
//                     <li key={item.id} className="flex items-center gap-2">
//                       <Image
//                         src={item.imageUrl || "/placeholder.svg"}
//                         alt={item.name}
//                         width={24}
//                         height={24}
//                         className="rounded-sm"
//                       />
//                       {item.name} (x{item.quantity}) - ${item.price.toFixed(2)} each
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </div>
//           <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
//             <Button asChild>
//               <Link href={`/dashboard/customer/orders/${order.id}`}>View Order Details</Link>
//             </Button>
//             <Button asChild variant="outline">
//               <Link href="/products">Continue Shopping</Link>
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
