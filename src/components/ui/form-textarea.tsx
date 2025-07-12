import { forwardRef } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";

import { cn } from "@/lib/utils";

import { Info } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Textarea, TextareaProps } from "./textarea";

type Props<T extends FieldValues> = TextareaProps & {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  description?: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const FormTextArea = forwardRef<HTMLTextAreaElement, Props<any>>(
  ({ name, label, control, className, description, ...props }, ref) => {
    return (
      <FormField
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
              <Textarea {...field} {...props} ref={ref} />
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
);

FormTextArea.displayName = "FormTextArea";

export default FormTextArea;
