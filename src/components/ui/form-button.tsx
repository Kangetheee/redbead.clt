import { Loader } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button, ButtonProps } from "./button";

interface Props extends ButtonProps {
  loadingText?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export default function FormButton({
  isDisabled,
  isLoading,
  loadingText = "Please wait...",
  type = "submit",
  children,
  className,
  ...props
}: Props) {
  return (
    <Button
      disabled={isDisabled || isLoading}
      aria-disabled={isDisabled || isLoading}
      type={type}
      className={cn("", className)}
      {...props}
    >
      <Loader
        className={cn("mr-2 hidden animate-spin", isLoading && "block")}
      />

      {isLoading ? loadingText : children}
    </Button>
  );
}
