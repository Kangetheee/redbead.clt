// "use client";

// import { cn } from "@/lib/utils";
// import { Check } from "lucide-react";

// interface CheckoutStepsProps {
//   currentStep: number;
//   steps: Array<{
//     id: number;
//     title: string;
//     description?: string;
//   }>;
// }

// export function CheckoutSteps({ currentStep, steps }: CheckoutStepsProps) {
//   return (
//     <div className="w-full py-6">
//       <div className="flex items-center">
//         {steps.map((step, index) => (
//           <div key={step.id} className="flex items-center flex-1">
//             {/* Step Circle */}
//             <div
//               className={cn(
//                 "flex items-center justify-center w-8 h-8 rounded-full border-2 relative z-10",
//                 currentStep > step.id
//                   ? "bg-primary border-primary text-primary-foreground"
//                   : currentStep === step.id
//                   ? "border-primary bg-background text-primary"
//                   : "border-muted text-muted-foreground bg-background"
//               )}
//             >
//               {currentStep > step.id ? (
//                 <Check className="w-4 h-4" />
//               ) : (
//                 <span className="text-sm font-medium">{step.id}</span>
//               )}
//             </div>

//             {/* Step Content */}
//             <div className="ml-3 flex-1">
//               <div
//                 className={cn(
//                   "text-sm font-medium",
//                   currentStep >= step.id
//                     ? "text-foreground"
//                     : "text-muted-foreground"
//                 )}
//               >
//                 {step.title}
//               </div>
//               {step.description && (
//                 <div className="text-xs text-muted-foreground">
//                   {step.description}
//                 </div>
//               )}
//             </div>

//             {/* Connector Line */}
//             {index < steps.length - 1 && (
//               <div
//                 className={cn(
//                   "h-px flex-1 mx-4",
//                   currentStep > step.id
//                     ? "bg-primary"
//                     : "bg-muted"
//                 )}
//               />
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
