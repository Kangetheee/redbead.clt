// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client"

// import React, { useState, useEffect } from 'react'
// import { Plus, Minus, Save, Trash2 } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Switch } from '@/components/ui/switch'
// import { Textarea } from '@/components/ui/textarea'
// import { useToast } from '@/hooks/use-toast'
// import { useCreateProductTemplate, useUpdateProductTemplate } from '@/hooks/use-products'
// import type {
//   CreateProductTemplateDto,
//   UpdateProductTemplateDto,
//   ProductDimensionDto,
//   ProductMaterialDto,
//   ProductOptionDto,
//   PricingRuleDto,
//   CanvasSettingsDto
// } from '@/lib/products/dto/products.dto'

// interface TemplateConfiguratorProps {
//   initialData?: any
//   templateId?: string
//   onSave?: (data: any) => void
// }

// export function TemplateConfigurator({ initialData, templateId, onSave }: TemplateConfiguratorProps) {
//   const { toast } = useToast()
//   const createTemplate = useCreateProductTemplate()
//   const updateTemplate = useUpdateProductTemplate()

//   const [templateData, setTemplateData] = useState<CreateProductTemplateDto>({
//     name: '',
//     type: 'wristband',
//     category: '',
//     description: '',
//     minOrder: 25,
//     maxOrder: 10000,
//     leadTime: '5-7 business days',
//     dimensions: [
//       {
//         name: 'width',
//         displayName: 'Width',
//         description: 'Wristband width in millimeters',
//         required: true,
//         options: [
//           { value: '10mm', displayName: '10mm', priceAdjustment: 0, isDefault: true },
//           { value: '15mm', displayName: '15mm', priceAdjustment: 0.5 },
//           { value: '20mm', displayName: '20mm', priceAdjustment: 1.0 },
//           { value: '25mm', displayName: '25mm', priceAdjustment: 1.5 }
//         ]
//       }
//     ],
//     materials: [
//       {
//         name: 'fabric',
//         displayName: 'Material',
//         description: 'Base material for the wristband',
//         required: true,
//         options: [
//           { value: 'smooth_satin', displayName: 'Smooth Satin', priceAdjustment: 0, isDefault: true },
//           { value: 'polyester', displayName: 'Polyester', priceAdjustment: 0.2 },
//           { value: 'cotton', displayName: 'Cotton', priceAdjustment: 0.3 },
//           { value: 'nylon', displayName: 'Nylon', priceAdjustment: 0.4 }
//         ]
//       }
//     ],
//     options: [
//       {
//         name: 'lock_type',
//         displayName: 'Lock Type',
//         type: 'dropdown',
//         required: true,
//         options: [
//           { value: 'flat_lock', displayName: 'Flat Lock', priceAdjustment: 0, isDefault: true },
//           { value: 'plastic_lock', displayName: 'Plastic Lock', priceAdjustment: 0.1 },
//           { value: 'metal_lock', displayName: 'Metal Lock', priceAdjustment: 0.3 }
//         ]
//       },
//       {
//         name: 'double_sided_print',
//         displayName: 'Double Sided Print',
//         type: 'dropdown',
//         required: false,
//         options: [
//           { value: 'no', displayName: 'No', priceAdjustment: 0, isDefault: true },
//           { value: 'yes', displayName: 'Yes', priceAdjustment: 0.8 }
//         ]
//       },
//       {
//         name: 'serialisation',
//         displayName: 'Serialisation Required',
//         type: 'dropdown',
//         required: false,
//         options: [
//           { value: 'no', displayName: 'No', priceAdjustment: 0, isDefault: true },
//           { value: 'yes', displayName: 'Yes', priceAdjustment: 0.5 }
//         ]
//       }
//     ],
//     pricingRules: [
//       {
//         name: 'base_pricing',
//         type: 'fixed',
//         value: 1.79,
//         conditions: { minQuantity: 1 },
//         isActive: true
//       },
//       {
//         name: 'bulk_discount_100',
//         type: 'percentage',
//         value: 10,
//         conditions: { minQuantity: 100 },
//         isActive: true
//       },
//       {
//         name: 'bulk_discount_500',
//         type: 'percentage',
//         value: 15,
//         conditions: { minQuantity: 500 },
//         isActive: true
//       }
//     ],
//     canvasSettings: {
//       width: 200,
//       height: 50,
//       dpi: 300,
//       units: 'mm',
//       backgroundColor: '#ffffff'
//     },
//     isActive: true,
//     ...initialData
//   })

//   const handleSave = async () => {
//     try {
//       if (templateId) {
//         await updateTemplate.mutateAsync({ id: templateId, data: templateData })
//         toast({ title: 'Template updated successfully' })
//       } else {
//         await createTemplate.mutateAsync(templateData)
//         toast({ title: 'Template created successfully' })
//       }
//       onSave?.(templateData)
//     } catch (error) {
//       toast({
//         title: 'Error saving template',
//         description: 'Please check your configuration and try again',
//         variant: 'destructive'
//       })
//     }
//   }

//   const addDimensionOption = (dimensionIndex: number) => {
//     const newDimensions = [...templateData.dimensions]
//     newDimensions[dimensionIndex].options.push({
//       value: '',
//       displayName: '',
//       priceAdjustment: 0,
//       isDefault: false
//     })
//     setTemplateData({ ...templateData, dimensions: newDimensions })
//   }

//   const addMaterialOption = (materialIndex: number) => {
//     const newMaterials = [...templateData.materials]
//     newMaterials[materialIndex].options.push({
//       value: '',
//       displayName: '',
//       priceAdjustment: 0,
//       isDefault: false
//     })
//     setTemplateData({ ...templateData, materials: newMaterials })
//   }

//   const addProductOption = () => {
//     const newOptions = [...templateData.options]
//     newOptions.push({
//       name: '',
//       displayName: '',
//       type: 'dropdown',
//       required: false,
//       options: [
//         { value: '', displayName: '', priceAdjustment: 0, isDefault: true }
//       ]
//     })
//     setTemplateData({ ...templateData, options: newOptions })
//   }

//   const addPricingRule = () => {
//     const newRules = [...templateData.pricingRules]
//     newRules.push({
//       name: '',
//       type: 'fixed',
//       value: 0,
//       conditions: { minQuantity: 1 },
//       isActive: true
//     })
//     setTemplateData({ ...templateData, pricingRules: newRules })
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold">Product Template Configuration</h2>
//         <Button onClick={handleSave} disabled={createTemplate.isPending || updateTemplate.isPending}>
//           <Save className="h-4 w-4 mr-2" />
//           {templateId ? 'Update Template' : 'Create Template'}
//         </Button>
//       </div>

//       <Tabs defaultValue="basic" className="w-full">
//         <TabsList className="grid w-full grid-cols-5">
//           <TabsTrigger value="basic">Basic Info</TabsTrigger>
//           <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
//           <TabsTrigger value="materials">Materials</TabsTrigger>
//           <TabsTrigger value="options">Options</TabsTrigger>
//           <TabsTrigger value="pricing">Pricing</TabsTrigger>
//         </TabsList>

//         <TabsContent value="basic" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Basic Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="name">Template Name</Label>
//                   <Input
//                     id="name"
//                     value={templateData.name}
//                     onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
//                     placeholder="e.g., Standard Wristband"
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="type">Product Type</Label>
//                   <Select
//                     value={templateData.type}
//                     onValueChange={(value) => setTemplateData({ ...templateData, type: value as any })}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="wristband">Wristband</SelectItem>
//                       <SelectItem value="lanyard">Lanyard</SelectItem>
//                       <SelectItem value="badge">Badge</SelectItem>
//                       <SelectItem value="sticker">Sticker</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div>
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   value={templateData.description}
//                   onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
//                   placeholder="Describe this product template..."
//                 />
//               </div>

//               <div className="grid grid-cols-3 gap-4">
//                 <div>
//                   <Label htmlFor="minOrder">Min Order Quantity</Label>
//                   <Input
//                     id="minOrder"
//                     type="number"
//                     value={templateData.minOrder}
//                     onChange={(e) => setTemplateData({ ...templateData, minOrder: parseInt(e.target.value) })}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="maxOrder">Max Order Quantity</Label>
//                   <Input
//                     id="maxOrder"
//                     type="number"
//                     value={templateData.maxOrder || ''}
//                     onChange={(e) => setTemplateData({ ...templateData, maxOrder: e.target.value ? parseInt(e.target.value) : undefined })}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="leadTime">Lead Time</Label>
//                   <Input
//                     id="leadTime"
//                     value={templateData.leadTime}
//                     onChange={(e) => setTemplateData({ ...templateData, leadTime: e.target.value })}
//                     placeholder="e.g., 5-7 business days"
//                   />
//                 </div>
//               </div>

//               <div className="flex items-center space-x-2">
//                 <Switch
//                   id="isActive"
//                   checked={templateData.isActive}
//                   onCheckedChange={(checked) => setTemplateData({ ...templateData, isActive: checked })}
//                 />
//                 <Label htmlFor="isActive">Template Active</Label>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="dimensions" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Product Dimensions</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {templateData.dimensions.map((dimension, dimIndex) => (
//                 <div key={dimIndex} className="border rounded-lg p-4 space-y-4">
//                   <div className="grid grid-cols-3 gap-4">
//                     <div>
//                       <Label>Field Name</Label>
//                       <Input
//                         value={dimension.name}
//                         onChange={(e) => {
//                           const newDimensions = [...templateData.dimensions]
//                           newDimensions[dimIndex].name = e.target.value
//                           setTemplateData({ ...templateData, dimensions: newDimensions })
//                         }}
//                       />
//                     </div>
//                     <div>
//                       <Label>Display Name</Label>
//                       <Input
//                         value={dimension.displayName}
//                         onChange={(e) => {
//                           const newDimensions = [...templateData.dimensions]
//                           newDimensions[dimIndex].displayName = e.target.value
//                           setTemplateData({ ...templateData, dimensions: newDimensions })
//                         }}
//                       />
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <Switch
//                         checked={dimension.required}
//                         onCheckedChange={(checked) => {
//                           const newDimensions = [...templateData.dimensions]
//                           newDimensions[dimIndex].required = checked
//                           setTemplateData({ ...templateData, dimensions: newDimensions })
//                         }}
//                       />
//                       <Label>Required</Label>
//                     </div>
//                   </div>

//                   <div>
//                     <Label>Description</Label>
//                     <Input
//                       value={dimension.description || ''}
//                       onChange={(e) => {
//                         const newDimensions = [...templateData.dimensions]
//                         newDimensions[dimIndex].description = e.target.value
//                         setTemplateData({ ...templateData, dimensions: newDimensions })
//                       }}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <div className="flex justify-between items-center">
//                       <Label>Options</Label>
//                       <Button
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={() => addDimensionOption(dimIndex)}
//                       >
//                         <Plus className="h-4 w-4 mr-1" /> Add Option
//                       </Button>
//                     </div>

//                     {dimension.options.map((option, optIndex) => (
//                       <div key={optIndex} className="grid grid-cols-5 gap-2 items-center">
//                         <Input
//                           placeholder="Value"
//                           value={option.value}
//                           onChange={(e) => {
//                             const newDimensions = [...templateData.dimensions]
//                             newDimensions[dimIndex].options[optIndex].value = e.target.value
//                             setTemplateData({ ...templateData, dimensions: newDimensions })
//                           }}
//                         />
//                         <Input
//                           placeholder="Display Name"
//                           value={option.displayName}
//                           onChange={(e) => {
//                             const newDimensions = [...templateData.dimensions]
//                             newDimensions[dimIndex].options[optIndex].displayName = e.target.value
//                             setTemplateData({ ...templateData, dimensions: newDimensions })
//                           }}
//                         />
//                         <Input
//                           type="number"
//                           step="0.01"
//                           placeholder="Price Adjustment"
//                           value={option.priceAdjustment}
//                           onChange={(e) => {
//                             const newDimensions = [...templateData.dimensions]
//                             newDimensions[dimIndex].options[optIndex].priceAdjustment = parseFloat(e.target.value) || 0
//                             setTemplateData({ ...templateData, dimensions: newDimensions })
//                           }}
//                         />
//                         <div className="flex items-center space-x-2">
//                           <Switch
//                             checked={option.isDefault}
//                             onCheckedChange={(checked) => {
//                               const newDimensions = [...templateData.dimensions]
//                               // Ensure only one default per dimension
//                               newDimensions[dimIndex].options.forEach((opt, idx) => {
//                                 opt.isDefault = idx === optIndex ? checked : false
//                               })
//                               setTemplateData({ ...templateData, dimensions: newDimensions })
//                             }}
//                           />
//                           <Label className="text-xs">Default</Label>
//                         </div>
//                         <Button
//                           type="button"
//                           variant="outline"
//                           size="sm"
//                           onClick={() => {
//                             const newDimensions = [...templateData.dimensions]
//                             newDimensions[dimIndex].options.splice(optIndex, 1)
//                             setTemplateData({ ...templateData, dimensions: newDimensions })
//                           }}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="materials" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Materials</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {templateData.materials.map((material, matIndex) => (
//                 <div key={matIndex} className="border rounded-lg p-4 space-y-4">
//                   <div className="grid grid-cols-3 gap-4">
//                     <div>
//                       <Label>Field Name</Label>
//                       <Input
//                         value={material.name}
//                         onChange={(e) => {
//                           const newMaterials = [...templateData.materials]
//                           newMaterials[matIndex].name = e.target.value
//                           setTemplateData({ ...templateData, materials: newMaterials })
//                         }}
//                       />
//                     </div>
//                     <div>
//                       <Label>Display Name</Label>
//                       <Input
//                         value={material.displayName}
//                         onChange={(e) => {
//                           const newMaterials = [...templateData.materials]
//                           newMaterials[matIndex].displayName = e.target.value
//                           setTemplateData({ ...templateData, materials: newMaterials })
//                         }}
//                       />
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <Switch
//                         checked={material.required}
//                         onCheckedChange={(checked) => {
//                           const newMaterials = [...templateData.materials]
//                           newMaterials[matIndex].required = checked
//                           setTemplateData({ ...templateData, materials: newMaterials })
//                         }}
//                       />
//                       <Label>Required</Label>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <div className="flex justify-between items-center">
//                       <Label>Material Options</Label>
//                       <Button
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={() => addMaterialOption(matIndex)}
//                       >
//                         <Plus className="h-4 w-4 mr-1" /> Add Option
//                       </Button>
//                     </div>

//                     {material.options.map((option, optIndex) => (
//                       <div key={optIndex} className="grid grid-cols-5 gap-2 items-center">
//                         <Input
//                           placeholder="Value"
//                           value={option.value}
//                           onChange={(e) => {
//                             const newMaterials = [...templateData.materials]
//                             newMaterials[matIndex].options[optIndex].value = e.target.value
//                             setTemplateData({ ...templateData, materials: newMaterials })
//                           }}
//                         />
//                         <Input
//                           placeholder="Display Name"
//                           value={option.displayName}
//                           onChange={(e) => {
//                             const newMaterials = [...templateData.materials]
//                             newMaterials[matIndex].options[optIndex].displayName = e.target.value
//                             setTemplateData({ ...templateData, materials: newMaterials })
//                           }}
//                         />
//                         <Input
//                           type="number"
//                           step="0.01"
//                           placeholder="Price Adjustment"
//                           value={option.priceAdjustment}
//                           onChange={(e) => {
//                             const newMaterials = [...templateData.materials]
//                             newMaterials[matIndex].options[optIndex].priceAdjustment = parseFloat(e.target.value) || 0
//                             setTemplateData({ ...templateData, materials: newMaterials })
//                           }}
//                         />
//                         <div className="flex items-center space-x-2">
//                           <Switch
//                             checked={option.isDefault}
//                             onCheckedChange={(checked) => {
//                               const newMaterials = [...templateData.materials]
//                               newMaterials[matIndex].options.forEach((opt, idx) => {
//                                 opt.isDefault = idx === optIndex ? checked : false
//                               })
//                               setTemplateData({ ...templateData, materials: newMaterials })
//                             }}
//                           />
//                           <Label className="text-xs">Default</Label>
//                         </div>
//                         <Button
//                           type="button"
//                           variant="outline"
//                           size="sm"
//                           onClick={() => {
//                             const newMaterials = [...templateData.materials]
//                             newMaterials[matIndex].options.splice(optIndex, 1)
//                             setTemplateData({ ...templateData, materials: newMaterials })
//                           }}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="options" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Product Options</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="flex justify-end">
//                 <Button type="button" variant="outline" onClick={addProductOption}>
//                   <Plus className="h-4 w-4 mr-1" /> Add Option
//                 </Button>
//               </div>

//               {templateData.options.map((option, optIndex) => (
//                 <div key={optIndex} className="border rounded-lg p-4 space-y-4">
//                   <div className="grid grid-cols-4 gap-4">
//                     <div>
//                       <Label>Field Name</Label>
//                       <Input
//                         value={option.name}
//                         onChange={(e) => {
//                           const newOptions = [...templateData.options]
//                           newOptions[optIndex].name = e.target.value
//                           setTemplateData({ ...templateData, options: newOptions })
//                         }}
//                       />
//                     </div>
//                     <div>
//                       <Label>Display Name</Label>
//                       <Input
//                         value={option.displayName}
//                         onChange={(e) => {
//                           const newOptions = [...templateData.options]
//                           newOptions[optIndex].displayName = e.target.value
//                           setTemplateData({ ...templateData, options: newOptions })
//                         }}
//                       />
//                     </div>
//                     <div>
//                       <Label>Type</Label>
//                       <Select
//                         value={option.type}
//                         onValueChange={(value) => {
//                           const newOptions = [...templateData.options]
//                           newOptions[optIndex].type = value as any
//                           setTemplateData({ ...templateData, options: newOptions })
//                         }}
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="dropdown">Dropdown</SelectItem>
//                           <SelectItem value="radio">Radio</SelectItem>
//                           <SelectItem value="checkbox">Checkbox</SelectItem>
//                           <SelectItem value="color">Color Picker</SelectItem>
//                           <SelectItem value="text">Text Input</SelectItem>
//                           <SelectItem value="number">Number Input</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <Switch
//                         checked={option.required}
//                         onCheckedChange={(checked) => {
//                           const newOptions = [...templateData.options]
//                           newOptions[optIndex].required = checked
//                           setTemplateData({ ...templateData, options: newOptions })
//                         }}
//                       />
//                       <Label>Required</Label>
//                     </div>
//                   </div>

//                   {option.options && (
//                     <div className="space-y-2">
//                       <Label>Option Values</Label>
//                       {option.options.map((choice, choiceIndex) => (
//                         <div key={choiceIndex} className="grid grid-cols-5 gap-2 items-center">
//                           <Input
//                             placeholder="Value"
//                             value={choice.value}
//                             onChange={(e) => {
//                               const newOptions = [...templateData.options]
//                               newOptions[optIndex].options![choiceIndex].value = e.target.value
//                               setTemplateData({ ...templateData, options: newOptions })
//                             }}
//                           />
//                           <Input
//                             placeholder="Display Name"
//                             value={choice.displayName}
//                             onChange={(e) => {
//                               const newOptions = [...templateData.options]
//                               newOptions[optIndex].options![choiceIndex].displayName = e.target.value
//                               setTemplateData({ ...templateData, options: newOptions })
//                             }}
//                           />
//                           <Input
//                             type="number"
//                             step="0.01"
//                             placeholder="Price Adjustment"
//                             value={choice.priceAdjustment}
//                             onChange={(e) => {
//                               const newOptions = [...templateData.options]
//                               newOptions[optIndex].options![choiceIndex].priceAdjustment = parseFloat(e.target.value) || 0
//                               setTemplateData({ ...templateData, options: newOptions })
//                             }}
//                           />
//                           <div className="flex items-center space-x-2">
//                             <Switch
//                               checked={choice.isDefault}
//                               onCheckedChange={(checked) => {
//                                 const newOptions = [...templateData.options]
//                                 newOptions[optIndex].options!.forEach((ch, idx) => {
//                                   ch.isDefault = idx === choiceIndex ? checked : false
//                                 })
//                                 setTemplateData({ ...templateData, options: newOptions })
//                               }}
//                             />
//                             <Label className="text-xs">Default</Label>
//                           </div>
//                           <Button
//                             type="button"
//                             variant="outline"
//                             size="sm"
//                             onClick={() => {
//                               const newOptions = [...templateData.options]
//                               newOptions[optIndex].options!.splice(choiceIndex, 1)
//                               setTemplateData({ ...templateData, options: newOptions })
//                             }}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       ))}
//                       <Button
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={() => {
//                           const newOptions = [...templateData.options]
//                           newOptions[optIndex].options!.push({
//                             value: '',
//                             displayName: '',
//                             priceAdjustment: 0,
//                             isDefault: false
//                           })
//                           setTemplateData({ ...templateData, options: newOptions })
//                         }}
//                       >
//                         <Plus className="h-4 w-4 mr-1" /> Add Choice
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="pricing" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Pricing Rules</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="flex justify-end">
//                 <Button type="button" variant="outline" onClick={addPricingRule}>
//                   <Plus className="h-4 w-4 mr-1" /> Add Pricing Rule
//                 </Button>
//               </div>

//               {templateData.pricingRules.map((rule, ruleIndex) => (
//                 <div key={ruleIndex} className="border rounded-lg p-4 space-y-4">
//                   <div className="grid grid-cols-3 gap-4">
//                     <div>
//                       <Label>Rule Name</Label>
//                       <Input
//                         value={rule.name}
//                         onChange={(e) => {
//                           const newRules = [...templateData.pricingRules]
//                           newRules[ruleIndex].name = e.target.value
//                           setTemplateData({ ...templateData, pricingRules: newRules })
//                         }}
//                       />
//                     </div>
//                     <div>
//                       <Label>Type</Label>
//                       <Select
//                         value={rule.type}
//                         onValueChange={(value) => {
//                           const newRules = [...templateData.pricingRules]
//                           newRules[ruleIndex].type = value as any
//                           setTemplateData({ ...templateData, pricingRules: newRules })
//                         }}
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="fixed">Fixed Price</SelectItem>
//                           <SelectItem value="percentage">Percentage</SelectItem>
//                           <SelectItem value="multiply">Multiply</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div>
//                       <Label>Value</Label>
//                       <Input
//                         type="number"
//                         step="0.01"
//                         value={rule.value}
//                         onChange={(e) => {
//                           const newRules = [...templateData.pricingRules]
//                           newRules[ruleIndex].value = parseFloat(e.target.value) || 0
//                           setTemplateData({ ...templateData, pricingRules: newRules })
//                         }}
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <Label>Min Quantity</Label>
//                       <Input
//                         type="number"
//                         value={rule.conditions?.minQuantity || ''}
//                         onChange={(e) => {
//                           const newRules = [...templateData.pricingRules]
//                           newRules[ruleIndex].conditions = {
//                             ...newRules[ruleIndex].conditions,
//                             minQuantity: e.target.value ? parseInt(e.target.value) : undefined
//                           }
//                           setTemplateData({ ...templateData, pricingRules: newRules })
//                         }}
//                       />
//                     </div>
//                     <div>
//                       <Label>Max Quantity</Label>
//                       <Input
//                         type="number"
//                         value={rule.conditions?.maxQuantity || ''}
//                         onChange={(e) => {
//                           const newRules = [...templateData.pricingRules]
//                           newRules[ruleIndex].conditions = {
//                             ...newRules[ruleIndex].conditions,
//                             maxQuantity: e.target.value ? parseInt(e.target.value) : undefined
//                           }
//                           setTemplateData({ ...templateData, pricingRules: newRules })
//                         }}
//                       />
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                       <Switch
//                         checked={rule.isActive}
//                         onCheckedChange={(checked) => {
//                           const newRules = [...templateData.pricingRules]
//                           newRules[ruleIndex].isActive = checked
//                           setTemplateData({ ...templateData, pricingRules: newRules })
//                         }}
//                       />
//                       <Label>Active</Label>
//                     </div>
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => {
//                         const newRules = [...templateData.pricingRules]
//                         newRules.splice(ruleIndex, 1)
//                         setTemplateData({ ...templateData, pricingRules: newRules })
//                       }}
//                     >
//                       <Trash2 className="h-4 w-4 mr-1" /> Remove Rule
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }
