import { HTMLAttributes } from "react";

import { Control, FieldPath, FieldValues } from "react-hook-form";

import { cn } from "@/lib/utils";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  options: { label: string; value: string }[];
  label?: string;
  required?: boolean;
  className?: HTMLAttributes<HTMLDivElement>["className"];
  placeholder?: string;
  description?: string;
};

export default function FormSelect<T extends FieldValues>({
  name,
  control,
  options,
  label,
  required = false,
  className,
  placeholder,
  description,
}: Props<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(className)}>
          {!!label && (
            <FormLabel className="flex items-center gap-2">
              {label}
              {required && <span className="text-destructive"> *</span>}
            </FormLabel>
          )}

          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            required={required}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder ?? "Select"} />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {options.map(({ label, value }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!!description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
