// "use client"

// import { useState } from "react"
// import { DashboardHeader } from "@/components/shared/dashboard-header"
// import { Breadcrumbs } from "@/components/shared/breadcrumbs"
// import { AddressList } from "@/components/customer/address-list"
// import { mockAddresses, type Address } from "@/lib/mock-data"

// export default function AddressManagementPage() {
//   const [addresses, setAddresses] = useState<Address[]>(mockAddresses)

//   const handleSetDefault = (id: string) => {
//     setAddresses((prev) =>
//       prev.map((addr) => ({
//         ...addr,
//         isDefault: addr.id === id,
//       })),
//     )
//   }

//   const handleDeleteAddress = (id: string) => {
//     setAddresses((prev) => prev.filter((addr) => addr.id !== id))
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 md:py-12">
//       <Breadcrumbs items={[{ href: "/dashboard/customer/addresses", label: "Addresses" }]} />
//       <DashboardHeader
//         title="Your Addresses"
//         description="Manage your shipping and billing addresses."
//         showNewButton
//         newButtonText="Add New Address"
//         newButtonHref="/dashboard/customer/addresses/create"
//       />
//       <AddressList addresses={addresses} onSetDefault={handleSetDefault} onDeleteAddress={handleDeleteAddress} />
//     </div>
//   )
// }
