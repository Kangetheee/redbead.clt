/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Plus,
  MessageSquare,
  User,
  Clock,
  AlertTriangle,
  FileText,
  Package,
  Truck,
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// import { useAddOrderNote, useOrderNotes } from "@/hooks/use-orders";
import {
  CreateOrderNoteDto,
  createOrderNoteSchema,
  NOTE_TYPES,
  NOTE_PRIORITIES,
} from "@/lib/orders/dto/orders.dto";
import { OrderNote } from "@/lib/orders/types/orders.types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Add Note Dialog Component
interface AddNoteDialogProps {
  orderId: string;
  onNoteAdded?: () => void;
  trigger?: React.ReactNode;
}

// Note type configuration with icons and colors
const NOTE_TYPE_CONFIG = {
  GENERAL: { icon: MessageSquare, color: "bg-blue-100 text-blue-800" },
  URGENCY: { icon: AlertTriangle, color: "bg-red-100 text-red-800" },
  TIMELINE: { icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  SHIPPING: { icon: Truck, color: "bg-green-100 text-green-800" },
  CUSTOMIZATION: { icon: Star, color: "bg-purple-100 text-purple-800" },
  PRODUCTION: { icon: Package, color: "bg-orange-100 text-orange-800" },
  QUALITY: { icon: AlertTriangle, color: "bg-red-100 text-red-800" },
  DESIGN_APPROVAL: { icon: FileText, color: "bg-indigo-100 text-indigo-800" },
} as const;

// Helper function to format note type display text
const formatNoteType = (type: string): string => {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

// Helper function to format priority display text
const formatPriority = (priority: string): string => {
  return priority.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

export function AddNoteDialog({
  orderId,
  onNoteAdded,
  trigger,
}: AddNoteDialogProps) {
  const [open, setOpen] = useState(false);
  // const addOrderNote = useAddOrderNote();

  const form = useForm<CreateOrderNoteDto>({
    resolver: zodResolver(createOrderNoteSchema),
    defaultValues: {
      type: "GENERAL",
      priority: "NORMAL",
      isInternal: false,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: CreateOrderNoteDto) => {
    // try {
    //   await addOrderNote.mutateAsync({
    //     orderId,
    //     values: data,
    //   });
    //   setOpen(false);
    //   reset();
    //   onNoteAdded?.();
    // } catch (error) {
    //   console.error("Failed to add note:", error);
    // }
    console.log("TO be Implemented");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Order Note</DialogTitle>
          <DialogDescription>
            Add a note to provide additional information about this order
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select note type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NOTE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {formatNoteType(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NOTE_PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {formatPriority(priority)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief note title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your note here..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isInternal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Internal Note</FormLabel>
                    <FormDescription>
                      Internal notes are not visible to customers
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Note"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
