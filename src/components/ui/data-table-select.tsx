"use client";

import { useSearchParams } from "next/navigation";

import { X } from "lucide-react";

import useUpdateSearchParams from "@/hooks/use-update-search-params";
import { cn } from "@/lib/utils";

import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

type Props = {
  name: string;
  placeholder: string;
  options: { value: string; label: string }[];
  className?: HTMLDivElement["className"];
};

export default function DataTableSelect({
  name,
  placeholder,
  options,
  className,
}: Props) {
  const searchParams = useSearchParams();
  const { setSearchParams } = useUpdateSearchParams();

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSearchParams({ [name]: undefined });
  };

  return (
    <div className={cn("relative", className)}>
      <Select
        defaultValue={searchParams.get(name) || ""}
        onValueChange={(value) => setSearchParams({ [name]: value })}
      >
        <SelectTrigger className="min-w-[180px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className="min-w-[180px] border bg-white dark:bg-black">
          {/* <SelectItem value="">{placeholder}</SelectItem> */}
          {options.map(({ label, value }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {searchParams.get(name) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-[10%] top-1/2 -translate-y-1/2"
          onClick={handleClear}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
