import { useEffect, useState } from "react";

import { Control, FieldPath, FieldValues } from "react-hook-form";
import { Country } from "react-phone-number-input";

import { cn } from "@/lib/utils";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { PhoneInput, PhoneInputProps } from "./phone-input";

type Props<T extends FieldValues> = Omit<PhoneInputProps, "icon"> & {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  description?: string;
};

export default function FormPhoneInput<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required,
  className,
  placeholder = "Enter phone number",
  disabled,
}: Props<T>) {
  const [country, setCountry] = useState<Country>("KE");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("https://ipapi.co/json")
      .then((res) => res.json())
      .then((data: { country: Country }) => {
        setCountry(() => data.country);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        setCountry(() => "KE");
      });
  }, []);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", className)}>
          {!!label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive"> *</span>}
            </FormLabel>
          )}

          <FormControl>
            <PhoneInput
              {...field}
              disabled={disabled || isLoading}
              placeholder={placeholder}
              defaultCountry={country}
              className={cn("flex-1", isLoading && "animate-pulse")}
              // international
              // withCountryCallingCode
              // countryCallingCodeEditable={false}
              // initialValueFormat="national"
            />
          </FormControl>

          {!!description && (
            <FormDescription className="text-xs">{description}</FormDescription>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
