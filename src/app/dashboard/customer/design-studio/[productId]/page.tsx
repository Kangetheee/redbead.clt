// "use client"

// import { useState, useEffect } from "react"
// import { DashboardHeader } from "@/components/layouts/dashboard-header"
// import { Breadcrumbs } from "@/components/shared/breadcrumbs"
// import { DesignCanvas } from "@/components/design-studio/canvas/design-canvas"
// import { CanvasControls } from "@/components/design-studio/canvas/canvas-controls"
// import { LayerPanel } from "@/components/design-studio/canvas/layer-panel"
// import { TextTool } from "@/components/design-studio/tools/text-tool"
// import { ImageTool } from "@/components/design-studio/tools/image-tool"
// import { ShapeTool } from "@/components/design-studio/tools/shape-tool"
// import { ColorPicker } from "@/components/design-studio/tools/color-picker"
// import { AssetLibrary } from "@/components/design-studio/assets/asset-library"
// import { DesignPreview } from "@/components/design-studio/preview/design-preview"
// import { PrintPreview } from "@/components/design-studio/preview/print-preview"
// import { SizePreview } from "@/components/design-studio/preview/size-preview"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { mockProducts, mockDesigns, mockDesignTemplates, type Product, type Design } from "@/lib/mock-data"
// import { notFound, useSearchParams } from "next/navigation"
// import { useToast } from "@/hooks/use-toast"
// import { v4 as uuidv4 } from "uuid" // For generating unique IDs for layers

// interface ProductDesignStudioPageProps {
//   params: {
//     productId: string
//   }
// }

// export default function ProductDesignStudioPage({ params }: ProductDesignStudioPageProps) {
//   const { toast } = useToast()
//   const searchParams = useSearchParams()
//   const designId = searchParams.get("designId")
//   const templateId = searchParams.get("templateId")

//   const product: Product | undefined = mockProducts.find((p) => p.id === params.productId)

//   if (!product) {
//     notFound()
//   }

//   const [currentDesign, setCurrentDesign] = useState<Design | null>(null)
//   const [designElements, setDesignElements] = useState<any[]>([]) // Elements on canvas
//   const [layers, setLayers] = useState<any[]>([]) // Simplified layer representation
//   const [activeTool, setActiveTool] = useState("text") // 'text', 'image', 'shape', 'color'
//   const [showLayerPanel, setShowLayerPanel] = useState(false)

//   useEffect(() => {
//     if (designId) {
//       const existingDesign = mockDesigns.find((d) => d.id === designId)
//       if (existingDesign) {
//         setCurrentDesign(existingDesign)
//         setDesignElements(existingDesign.data?.elements || [])
//         setLayers(
//           existingDesign.data?.elements.map((el: any, idx: number) => ({
//             id: el.id || uuidv4(),
//             name: el.name || `Layer ${idx + 1}`,
//             visible: true,
//           })) || [],
//         )
//       }
//     } else if (templateId) {
//       const template = mockDesignTemplates.find((t) => t.id === templateId)
//       if (template) {
//         setCurrentDesign({ ...template, productId: product.id, name: `New Design from ${template.name}` })
//         setDesignElements(template.data?.elements || [])
//         setLayers(
//           template.data?.elements.map((el: any, idx: number) => ({
//             id: el.id || uuidv4(),
//             name: el.name || `Layer ${idx + 1}`,
//             visible: true,
//           })) || [],
//         )
//       }
//     } else {
//       // Start with a fresh design
//       setCurrentDesign({
//         id: uuidv4(),
//         name: `New Design for ${product.name}`,
//         thumbnailUrl: product.imageUrl,
//         productId: product.id,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         data: { elements: [] },
//       })
//       setDesignElements([])
//       setLayers([])
//     }
//   }, [designId, templateId, product.id, product.imageUrl])

//   const handleSaveDesign = (data: any) => {
//     if (currentDesign) {
//       const updatedDesign = {
//         ...currentDesign,
//         data: data,
//         updatedAt: new Date().toISOString(),
//         thumbnailUrl: "/placeholder.svg?height=200&width=200", // Simulate new thumbnail
//       }
//       // In a real app, send updatedDesign to backend to save/update
//       console.log("Saving design:", updatedDesign)
//       toast({
//         title: "Design Saved!",
//         description: "Your design has been successfully saved.",
//       })
//       setCurrentDesign(updatedDesign)
//     }
//   }

//   const addElement = (newElement: any) => {
//     const id = uuidv4()
//     const elementWithId = { ...newElement, id, x: 50, y: 50 } // Default position
//     setDesignElements((prev) => [...prev, elementWithId])
//     setLayers((prev) => [...prev, { id, name: newElement.name || `Element ${prev.length + 1}`, visible: true }])
//   }

//   const handleUndo = () => toast({ title: "Undo (mock)" })
//   const handleRedo = () => toast({ title: "Redo (mock)" })
//   const handleToggleLayers = () => setShowLayerPanel((prev) => !prev)
//   const handleClearCanvas = () => {
//     setDesignElements([])
//     setLayers([])
//     toast({ title: "Canvas Cleared" })
//   }

//   const handleLayerVisibilityChange = (id: string, visible: boolean) => {
//     setLayers((prev) => prev.map((layer) => (layer.id === id ? { ...layer, visible } : layer)))
//     setDesignElements((prev) => prev.map((el) => (el.id === id ? { ...el, visible } : el)))
//   }

//   const handleLayerDelete = (id: string) => {
//     setLayers((prev) => prev.filter((layer) => layer.id !== id))
//     setDesignElements((prev) => prev.filter((el) => el.id !== id))
//     toast({ title: "Layer Deleted" })
//   }

//   const handleLayerReorder = (newOrder: any[]) => {
//     setLayers(newOrder)
//     // Reorder designElements based on newOrder
//     const reorderedElements = newOrder.map((layer) => designElements.find((el) => el.id === layer.id)).filter(Boolean)
//     setDesignElements(reorderedElements)
//   }

//   const handleAddText = (text: string, color: string, fontSize: number) => {
//     addElement({ type: "text", text, color, fontSize, name: `Text: ${text.substring(0, 15)}...` })
//   }

//   const handleAddImage = (imageUrl: string) => {
//     addElement({ type: "image", url: imageUrl, name: `Image: ${imageUrl.split("/").pop()}` })
//   }

//   const handleAddShape = (shapeType: "rectangle" | "circle" | "triangle", color: string) => {
//     addElement({ type: "shape", shapeType, color, name: `Shape: ${shapeType}` })
//   }

//   const handleSelectAsset = (asset: any) => {
//     if (asset.type === "image") {
//       handleAddImage(asset.url)
//     } else {
//       // Handle other asset types like icons
//       toast({
//         title: "Asset type not fully supported yet",
//         description: "Only images can be added to canvas currently.",
//       })
//     }
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col h-full min-h-[calc(100vh-theme(spacing.16))]">
//       <Breadcrumbs
//         items={[
//           { href: "/dashboard/customer/design-studio", label: "Design Studio" },
//           { href: `/dashboard/customer/design-studio/${product.id}`, label: product.name },
//         ]}
//       />
//       <DashboardHeader
//         title={`Design: ${currentDesign?.name || product.name}`}
//         description={`Customizing your ${product.name}`}
//       />

//       <div className="flex-1 grid grid-cols-1 lg:grid-cols-[250px_1fr_300px] gap-6">
//         {/* Left Sidebar: Tools & Assets */}
//         <div className="flex flex-col gap-6">
//           <Tabs defaultValue="tools" className="flex-1 flex flex-col">
//             <TabsList className="grid w-full grid-cols-2">
//               <TabsTrigger value="tools">Tools</TabsTrigger>
//               <TabsTrigger value="assets">Assets</TabsTrigger>
//             </TabsList>
//             <TabsContent value="tools" className="flex-1 flex flex-col overflow-y-auto">
//               <TextTool onAddText={handleAddText} />
//               <ImageTool onAddImage={handleAddImage} />
//               <ShapeTool onAddShape={handleAddShape} />
//               <ColorPicker onColorChange={(color) => console.log("Selected color:", color)} />
//             </TabsContent>
//             <TabsContent value="assets" className="flex-1 flex flex-col">
//               <AssetLibrary onSelectAsset={handleSelectAsset} />
//             </TabsContent>
//           </Tabs>
//         </div>

//         {/* Middle: Canvas and Controls */}
//         <div className="flex flex-col gap-6">
//           <div className="flex-1 flex">
//             <CanvasControls
//               onUndo={handleUndo}
//               onRedo={handleRedo}
//               onToggleLayers={handleToggleLayers}
//               onClearCanvas={handleClearCanvas}
//             />
//             <DesignCanvas product={product} initialDesignData={currentDesign?.data} onSaveDesign={handleSaveDesign} />
//           </div>
//           {showLayerPanel && (
//             <div className="h-64">
//               {" "}
//               {/* Fixed height for layer panel */}
//               <LayerPanel
//                 layers={layers}
//                 onLayerVisibilityChange={handleLayerVisibilityChange}
//                 onLayerDelete={handleLayerDelete}
//                 onLayerReorder={handleLayerReorder}
//               />
//             </div>
//           )}
//         </div>

//         {/* Right Sidebar: Previews */}
//         <div className="flex flex-col gap-6">
//           <Tabs defaultValue="design" className="flex-1 flex flex-col">
//             <TabsList className="grid w-full grid-cols-3">
//               <TabsTrigger value="design">Design</TabsTrigger>
//               <TabsTrigger value="print">Print</TabsTrigger>
//               <TabsTrigger value="size">Size</TabsTrigger>
//             </TabsList>
//             <TabsContent value="design" className="flex-1 flex flex-col">
//               <DesignPreview designImageUrl={product.imageUrl} designName={currentDesign?.name || product.name} />
//             </TabsContent>
//             <TabsContent value="print" className="flex-1 flex flex-col">
//               <PrintPreview designImageUrl={product.imageUrl} productName={product.name} />
//             </TabsContent>
//             <TabsContent value="size" className="flex-1 flex flex-col">
//               <SizePreview designImageUrl={product.imageUrl} productName={product.name} />
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>
//     </div>
//   )
// }
