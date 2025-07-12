"use client";

import { HTMLAttributes, useState } from "react";

import { SmileIcon } from "lucide-react";
import { Control, FieldPath, FieldValues } from "react-hook-form";

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
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "./emoji-picker";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  description?: string;
  required?: boolean;
  className?: HTMLAttributes<HTMLDivElement>["className"];
  placeholder?: string;
  disabled?: boolean;
  appendEmoji?: boolean;
  tooltipContent?: string;
  pickerClassName?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
};

export default function FormEmojiPicker<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required = false,
  className,
  disabled = false,
  appendEmoji = true,
  tooltipContent = "Add Emoji",
  pickerClassName,
  textareaRef,
}: Props<T>) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  // Update cursor position when textarea is focused/clicked
  const updateCursorPosition = () => {
    if (textareaRef?.current) {
      setCursorPosition(textareaRef.current.selectionStart || 0);
    }
  };

  const insertEmojiAtCursor = (
    currentValue: string,
    emoji: string,
    position: number
  ) => {
    const beforeCursor = currentValue.slice(0, position);
    const afterCursor = currentValue.slice(position);
    return beforeCursor + emoji + afterCursor;
  };

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

          <FormControl>
            <TooltipProvider>
              <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        disabled={disabled}
                        className="size-8 text-foreground dark:text-foreground"
                        onClick={updateCursorPosition}
                      >
                        <SmileIcon className="size-4" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>{tooltipContent}</TooltipContent>
                </Tooltip>
                <PopoverContent
                  className="p-0 w-[256px]"
                  align="end"
                  sideOffset={5}
                >
                  <EmojiPicker
                    className={cn("h-[300px] w-[256px]", pickerClassName)}
                    onEmojiSelect={({ emoji }) => {
                      const currentValue = field.value || "";

                      let newValue: string;
                      if (appendEmoji) {
                        // If we have a textarea ref and cursor position, insert at cursor
                        if (textareaRef?.current && cursorPosition >= 0) {
                          newValue = insertEmojiAtCursor(
                            currentValue,
                            emoji,
                            cursorPosition
                          );

                          // Update the field value
                          field.onChange(newValue);

                          // Set cursor position after the emoji
                          setTimeout(() => {
                            if (textareaRef.current) {
                              const newCursorPos =
                                cursorPosition + emoji.length;
                              textareaRef.current.focus();
                              textareaRef.current.setSelectionRange(
                                newCursorPos,
                                newCursorPos
                              );
                            }
                          }, 0);
                        } else {
                          // Fallback to append at end
                          newValue = currentValue + emoji;
                          field.onChange(newValue);
                        }
                      } else {
                        newValue = emoji;
                        field.onChange(newValue);
                      }

                      setIsPickerOpen(false);
                    }}
                  >
                    <EmojiPickerSearch />
                    <EmojiPickerContent />
                    <EmojiPickerFooter />
                  </EmojiPicker>
                </PopoverContent>
              </Popover>
            </TooltipProvider>
          </FormControl>

          {!!description && <FormDescription>{description}</FormDescription>}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
