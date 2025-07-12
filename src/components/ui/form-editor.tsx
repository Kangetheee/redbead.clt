import { HTMLAttributes } from "react";

import { Control, FieldPath, FieldValues } from "react-hook-form";

import { cn } from "@/lib/utils";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import TiptapEditor from "./tiptap/tiptap-editor";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  className?: HTMLAttributes<HTMLDivElement>["className"];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export default function FormEditor<T extends FieldValues>({
  name,
  label,
  control,
  className,
  disabled,
  required,
  placeholder,
}: Props<T>) {
  return (
    <FormField
      control={control}
      name={name}
      disabled={disabled}
      render={({ field: { onChange, value } }) => (
        <FormItem className={cn(className)}>
          {!!label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive"> *</span>}
            </FormLabel>
          )}

          <FormControl className="relative">
            <TiptapEditor
              value={value}
              onChange={onChange}
              disabled={disabled}
              placeholder={placeholder}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
