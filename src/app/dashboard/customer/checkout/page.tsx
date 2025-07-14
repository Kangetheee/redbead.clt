// "use client"

// import { CardContent } from "@/components/ui/card"

// import { CardHeader } from "@/components/ui/card"

// import { Card } from "@/components/ui/card"

// import { useState } from "react"
// import { DashboardHeader } from "@/components/shared/dashboard-header"
// import { Breadcrumbs } from "@/components/shared/breadcrumbs"
// import { CheckoutSteps } from "@/components/checkout/checkout-steps"
// import { AddressSelector } from "@/components/checkout/address-selector"
// import { ShippingOptions } from "@/components/checkout/shipping-options"
// import { PaymentMethods } from "@/components/checkout/payment-methods"
// import { OrderSummary } from "@/components/checkout/order-summary"
// import { Button } from "@/components/ui/button"
// import { mockCartItems, mockAddresses } from "@/lib/mock-data"
// import { useRouter } from "next/navigation"
// import { useToast } from "@/hooks/use-toast"

// export default function CheckoutPage() {
//   const router = useRouter()
//   const { toast } = useToast()

//   const [currentStep, setCurrentStep] = useState(1)
//   const [selectedAddressId, setSelectedAddressId] = useState<string | null>(mockAddresses[0]?.id || null)
//   const [selectedShippingOptionId, setSelectedShippingOptionId] = useState("standard")
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("credit-card")

//   const cartItems = mockCartItems // In a real app, fetch from cart state/API
//   const addresses = mockAddresses // In a real app, fetch user addresses

//   const shippingOptions = [
//     { id: "standard", price: 5.0 },
//     { id: "express", price: 15.0 },
//     { id: "priority", price: 25.0 },
//   ]
//   const selectedShippingCost = shippingOptions.find((opt) => opt.id === selectedShippingOptionId)?.price || 0
//   const taxRate = 0.08 // Mock tax rate

//   const handleNextStep = () => {
//     if (currentStep === 1 && !selectedAddressId) {
//       toast({ title: "Please select a shipping address.", variant: "destructive" })
//       return
//     }
//     setCurrentStep((prev) => prev + 1)
//   }

//   const handlePreviousStep = () => {
//     setCurrentStep((prev) => prev - 1)
//   }

//   const handlePlaceOrder = () => {
//     // Simulate order placement
//     console.log({
//       selectedAddressId,
//       selectedShippingOptionId,
//       selectedPaymentMethod,
//       cartItems,
//     })
//     toast({
//       title: "Order Placed!",
//       description: "Redirecting to confirmation page...",
//     })
//     // Simulate API call and get order ID
//     const mockOrderId = "ORD" + Date.now()
//     setTimeout(() => {
//       router.push(`/dashboard/customer/checkout/confirmation/${mockOrderId}`)
//     }, 1500)
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 md:py-12">
//       <Breadcrumbs
//         items={[
//           { href: "/dashboard/customer/cart", label: "Cart" },
//           { href: "/dashboard/customer/checkout", label: "Checkout" },
//         ]}
//       />
//       <DashboardHeader title="Checkout" description="Complete your purchase in a few simple steps." />

//       <CheckoutSteps currentStep={currentStep} />

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2 space-y-6">
//           {currentStep === 1 && (
//             <>
//               <AddressSelector
//                 addresses={addresses}
//                 selectedAddressId={selectedAddressId}
//                 onSelectAddress={setSelectedAddressId}
//               />
//               <ShippingOptions
//                 selectedOptionId={selectedShippingOptionId}
//                 onSelectOption={setSelectedShippingOptionId}
//               />
//             </>
//           )}
//           {currentStep === 2 && (
//             <PaymentMethods selectedMethod={selectedPaymentMethod} onSelectMethod={setSelectedPaymentMethod} />
//           )}
//           {currentStep === 3 && (
//             <div className="space-y-6">
//               <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Review Your Order</h2>
//               <p className="text-gray-600 dark:text-gray-300">
//                 Please review your order details before placing your order.
//               </p>
//               {/* Display selected address and shipping method */}
//               <Card>
//                 <CardHeader>
//                   <h3 className="font-semibold">Shipping To</h3>
//                 </CardHeader>
//                 <CardContent>
//                   {selectedAddressId
//                     ? addresses.find((a) => a.id === selectedAddressId)?.name +
//                       ", " +
//                       addresses.find((a) => a.id === selectedAddressId)?.street +
//                       ", " +
//                       addresses.find((a) => a.id === selectedAddressId)?.city
//                     : "No address selected"}
//                   <br />
//                   <h3 className="font-semibold mt-2">Shipping Method</h3>
//                   {selectedShippingOptionId}
//                 </CardContent>
//               </Card>
//               <Card>
//                 <CardHeader>
//                   <h3 className="font-semibold">Payment Method</h3>
//                 </CardHeader>
//                 <CardContent>
//                   {selectedPaymentMethod === "credit-card" && "Credit Card"}
//                   {selectedPaymentMethod === "paypal" && "PayPal"}
//                   {selectedPaymentMethod === "bank-transfer" && "Bank Transfer"}
//                 </CardContent>
//               </Card>
//             </div>
//           )}
//         </div>
//         <div className="lg:col-span-1">
//           <OrderSummary items={cartItems} shippingCost={selectedShippingCost} taxRate={taxRate} />
//         </div>
//       </div>

//       <div className="flex justify-between mt-8">
//         {currentStep > 1 && (
//           <Button variant="outline" onClick={handlePreviousStep}>
//             Previous
//           </Button>
//         )}
//         {currentStep < 3 && (
//           <Button onClick={handleNextStep} className="ml-auto">
//             Next
//           </Button>
//         )}
//         {currentStep === 3 && (
//           <Button onClick={handlePlaceOrder} className="ml-auto">
//             Place Order
//           </Button>
//         )}
//       </div>
//     </div>
//   )
// }
