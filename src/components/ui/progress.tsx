"use client";

import * as React from "react";

import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

// interface ProgressProps
//   extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
//   isSuccess?: boolean;
//   isError?: boolean;
// }

type Props = React.ComponentProps<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: React.ComponentProps<
    typeof ProgressPrimitive.Indicator
  >["className"];
} & {
  isSuccess?: boolean;
  isError?: boolean;
};

function Progress({
  className,
  value,
  indicatorClassName,
  isError,
  ...props
}: Props) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        isError && "bg-destructive/20",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "bg-primary h-full w-full flex-1 transition-all",
          isError && "bg-destructive",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
