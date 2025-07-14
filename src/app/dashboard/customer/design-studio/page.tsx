// import { DashboardHeader } from "@/components/shared/dashboard-header"
// import { Breadcrumbs } from "@/components/shared/breadcrumbs"
// import { ProductGrid } from "@/components/products/product-grid"
// import { mockProducts } from "@/lib/mock-data"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"

// export default function DesignStudioHomePage() {
//   // In a real app, you might fetch popular products for design or recently designed products.
//   const productsForDesign = mockProducts.slice(0, 4) // Show some products that can be designed

//   return (
//     <div className="container mx-auto px-4 py-8 md:py-12">
//       <Breadcrumbs items={[{ href: "/dashboard/customer/design-studio", label: "Design Studio" }]} />
//       <DashboardHeader title="Design Studio" description="Start a new design or manage your saved creations." />

//       <div className="mb-8 flex flex-col sm:flex-row gap-4">
//         <Button asChild size="lg" className="flex-1">
//           <Link href="/dashboard/customer/design-studio/saved-designs">View Saved Designs</Link>
//         </Button>
//         <Button asChild size="lg" variant="outline" className="flex-1 bg-transparent">
//           <Link href="/dashboard/customer/design-studio/templates">Browse Templates</Link>
//         </Button>
//       </div>

//       <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-50">Start a New Design</h2>
//       <p className="text-gray-600 dark:text-gray-300 mb-4">Select a product below to begin customizing.</p>
//       <ProductGrid products={productsForDesign} />
//     </div>
//   )
// }
