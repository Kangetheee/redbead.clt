// import { DashboardHeader } from "@/components/shared/dashboard-header"
// import { Breadcrumbs } from "@/components/shared/breadcrumbs"
// import { TemplateGallery } from "@/components/design-studio/template-gallery"
// import { mockDesignTemplates } from "@/lib/mock-data"

// export default function DesignTemplatesPage() {
//   // In a real app, fetch available design templates.
//   const designTemplates = mockDesignTemplates

//   return (
//     <div className="container mx-auto px-4 py-8 md:py-12">
//       <Breadcrumbs
//         items={[
//           { href: "/dashboard/customer/design-studio", label: "Design Studio" },
//           { href: "/dashboard/customer/design-studio/templates", label: "Design Templates" },
//         ]}
//       />
//       <DashboardHeader title="Design Templates" description="Browse pre-made templates to kickstart your design." />
//       <TemplateGallery
//         templates={designTemplates}
//         baseUseHref="/dashboard/customer/design-studio/prod_1?templateId=" // Assuming prod_1 for template use
//       />
//     </div>
//   )
// }
