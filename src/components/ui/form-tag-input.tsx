"use client";

import { ComponentProps, KeyboardEvent, useState } from "react";

import { Info, Plus, X } from "lucide-react";
import {
  Control,
  FieldPath,
  FieldValues,
  useFieldArray,
} from "react-hook-form";

import { cn } from "@/lib/utils";

import { Badge } from "./badge";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  badgeClassName?: ComponentProps<"span">["className"];
};

export default function FormTagInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "Type and press Enter to add",
  description,
  required = false,
  className,
  disabled = false,
  badgeClassName,
}: Props<T>) {
  const [inputValue, setInputValue] = useState<string>("");

  const { fields, append, remove } = useFieldArray({
    control,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: name as any,
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ";") && inputValue.trim()) {
      e.preventDefault();

      const valueToAdd =
        e.key === ";" ? inputValue.trim().replace(/;$/, "") : inputValue.trim();

      if (valueToAdd) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        append({ value: valueToAdd } as any);
        setInputValue("");
      }
    }
  };

  const handleRemoveTag = (index: number) => {
    remove(index);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem className={cn(className)}>
          {!!label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive"> *</span>}
            </FormLabel>
          )}

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {fields.map((field, index) => (
                <Badge
                  key={field.id}
                  variant="secondary"
                  className={cn(
                    "py-1 px-2 text-sm flex items-center gap-1",
                    badgeClassName
                  )}
                >
                  {/* @ts-expect-error - field.value is not typed */}
                  {field.value}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <FormControl>
              <div className="relative">
                <Input
                  placeholder={placeholder}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={disabled}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                  onClick={() => {
                    if (inputValue.trim()) {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      append(inputValue.trim() as any);
                      setInputValue("");
                    }
                  }}
                  disabled={!inputValue.trim() || disabled}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </FormControl>
          </div>

          {!!description && (
            <FormDescription>
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
