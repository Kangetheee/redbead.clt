// "use client"

// import { useState } from "react"
// import { DashboardHeader } from "@/components/shared/dashboard-header"
// import { Breadcrumbs } from "@/components/shared/breadcrumbs"
// import { CartItemComponent } from "@/components/cart/cart-item"
// import { CartSummary } from "@/components/cart/cart-summary"
// import { mockCartItems, type CartItem } from "@/lib/mock-data"
// import { Button } from "@/components/ui/button"
// import Link from "next/link"
// import { ShoppingCart } from "lucide-react"

// export default function ShoppingCartPage() {
//   const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems)

//   const handleQuantityChange = (id: string, newQuantity: number) => {
//     setCartItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
//   }

//   const handleRemoveItem = (id: string) => {
//     setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))
//   }

//   const totalItemsInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0)

//   return (
//     <div className="container mx-auto px-4 py-8 md:py-12">
//       <Breadcrumbs items={[{ href: "/dashboard/customer/cart", label: "Shopping Cart" }]} />
//       <DashboardHeader title="Your Shopping Cart" description={`You have ${totalItemsInCart} item(s) in your cart.`} />

//       {cartItems.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
//           <ShoppingCart className="h-24 w-24 mb-4 text-gray-300 dark:text-gray-700" />
//           <p className="text-xl font-semibold mb-2">Your cart is empty.</p>
//           <p className="mb-6">Looks like you haven't added anything to your cart yet.</p>
//           <Button asChild>
//             <Link href="/products">Start Shopping</Link>
//           </Button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2 bg-white dark:bg-gray-950 rounded-lg shadow-sm p-6">
//             <div className="divide-y divide-gray-200 dark:divide-gray-700">
//               {cartItems.map((item) => (
//                 <CartItemComponent
//                   key={item.id}
//                   item={item}
//                   onQuantityChange={handleQuantityChange}
//                   onRemoveItem={handleRemoveItem}
//                 />
//               ))}
//             </div>
//           </div>
//           <div className="lg:col-span-1">
//             <CartSummary items={cartItems} />
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
