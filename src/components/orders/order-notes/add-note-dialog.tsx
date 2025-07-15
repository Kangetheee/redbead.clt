/* eslint-disable @typescript-eslint/no-explicit-any */
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useAddOrderNote, useOrderNotes } from "@/hooks/use-orders";
import {
  CreateOrderNoteDto,
  createOrderNoteSchema,
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

export function AddNoteDialog({
  orderId,
  onNoteAdded,
  trigger,
}: AddNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const addOrderNote = useAddOrderNote(orderId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateOrderNoteDto>({
    resolver: zodResolver(createOrderNoteSchema),
    defaultValues: {
      noteType: "GENERAL",
      isInternal: false,
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: CreateOrderNoteDto) => {
    try {
      await addOrderNote.mutateAsync(data);
      setOpen(false);
      reset();
      onNoteAdded?.();
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const noteTypeIcons = {
    GENERAL: MessageSquare,
    URGENCY: AlertTriangle,
    TIMELINE: Clock,
    SHIPPING: Truck,
    CUSTOMIZATION: Star,
    PRODUCTION: Package,
    QUALITY: AlertTriangle,
    DESIGN_APPROVAL: FileText,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="noteType">Note Type</Label>
              <Select
                value={watchedValues.noteType}
                onValueChange={(value) => setValue("noteType", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select note type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="URGENCY">Urgency</SelectItem>
                  <SelectItem value="TIMELINE">Timeline</SelectItem>
                  <SelectItem value="SHIPPING">Shipping</SelectItem>
                  <SelectItem value="CUSTOMIZATION">Customization</SelectItem>
                  <SelectItem value="PRODUCTION">Production</SelectItem>
                  <SelectItem value="QUALITY">Quality</SelectItem>
                  <SelectItem value="DESIGN_APPROVAL">
                    Design Approval
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority (Optional)</Label>
              <Select
                value={watchedValues.priority || ""}
                onValueChange={(value) =>
                  setValue("priority", value || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No priority</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Brief note title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Note Content</Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder="Enter your note here..."
              rows={4}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="isInternal"
                checked={watchedValues.isInternal}
                onCheckedChange={(checked) => setValue("isInternal", checked)}
              />
              <Label htmlFor="isInternal" className="text-sm">
                Internal note (not visible to customer)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addOrderNote.isPending}>
              {addOrderNote.isPending ? "Adding..." : "Add Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
