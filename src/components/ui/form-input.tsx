"use client";

import React from "react";

import { Eye, EyeOff, Info } from "lucide-react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input, type InputProps } from "./input";

type Props<T extends FieldValues> = InputProps & {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  description?: string;
  icon?: React.ReactNode;
};

export default function FormInput<T extends FieldValues>({
  name,
  label,
  type = "text",
  className,
  control,
  description,
  icon,
  ...props
}: Props<T>) {
  const [show, setShow] = React.useState(false);

  return (
    <FormField
      disabled={props.disabled}
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(className)}>
          {!!label && (
            <FormLabel>
              {label}
              {props.required && <span className="text-destructive"> *</span>}
            </FormLabel>
          )}

          <FormControl className="relative">
            <div className="relative">
              {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  {icon}
                </div>
              )}
              {type === "password" ? (
                <>
                  <Input
                    {...field}
                    type={show ? "text" : "password"}
                    className={cn("pr-10", icon && "pl-10")}
                    {...props}
                  />
                  <Button
                    size="icon"
                    type="button"
                    variant="link"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5"
                    onClick={() => setShow((state) => !state)}
                  >
                    {show ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </>
              ) : (
                <Input {...field} {...props} className={cn(icon && "pl-10")} />
              )}
            </div>
          </FormControl>

          {!!description && (
            <FormDescription className="">
              <Info className="mr-2 inline-block size-4" />
              {description}
            </FormDescription>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
