import { HTMLAttributes, useState } from "react";

import { Check, ChevronsUpDown, Info, Loader } from "lucide-react";
import { Control, FieldPath, FieldValues } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "./command";

interface Props<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  options: { label: string; value: string }[];
  label?: string;
  required?: boolean;
  className?: HTMLAttributes<HTMLDivElement>["className"];
  placeholder?: string;
  description?: string;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function FormCombobox<T extends FieldValues>({
  name,
  control,
  options,
  label,
  required: isRequired = false,
  className,
  placeholder = "Select an option",
  description,
  isLoading = false,
  disabled: isDisabled = false,
  icon,
}: Props<T>) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", className)}>
          {!!label && (
            <FormLabel className="pt-1">
              {label}
              {isRequired && <span className="text-destructive"> *</span>}
            </FormLabel>
          )}

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  disabled={isDisabled}
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "relative w-full justify-between",
                    !field.value && "text-muted-foreground",
                    icon && "pl-10"
                  )}
                >
                  {icon && (
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      {icon}
                    </div>
                  )}
                  <span className="flex-1 text-left">
                    {field.value
                      ? options.find((option) => option.value === field.value)
                          ?.label
                      : placeholder}
                  </span>
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>

            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput
                  placeholder={`Search ${label?.toLowerCase() ?? "option"}...`}
                  disabled={isLoading}
                />

                <CommandList>
                  {isLoading ? (
                    <CommandLoading>
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="size-4 animate-spin text-muted-foreground" />
                        Loading...
                      </span>
                    </CommandLoading>
                  ) : options.length === 0 ? (
                    <CommandEmpty>No options available.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          value={option.label}
                          key={option.value}
                          onSelect={() => {
                            field.onChange(option.value);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 size-4",
                              option.value === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

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
