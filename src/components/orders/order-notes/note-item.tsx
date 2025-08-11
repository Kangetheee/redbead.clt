"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Clock,
  AlertTriangle,
  FileText,
  Package,
  Truck,
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderNote } from "@/lib/orders/types/orders.types";

interface NoteItemProps {
  note: OrderNote;
  onEdit?: (noteId: string) => void;
  onDelete?: (noteId: string) => void;
  showActions?: boolean;
}

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

export function NoteItem({
  note,
  onEdit,
  onDelete,
  showActions = true,
}: NoteItemProps) {
  const getNoteTypeConfig = (type: string) => {
    return (
      NOTE_TYPE_CONFIG[type as keyof typeof NOTE_TYPE_CONFIG] ||
      NOTE_TYPE_CONFIG.GENERAL
    );
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500";
      case "HIGH":
        return "bg-orange-500";
      case "NORMAL":
        return "bg-yellow-500";
      case "LOW":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const config = getNoteTypeConfig(note.type);
  const Icon = config.icon;

  return (
    <Card className="relative">
      {note.isInternal && (
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="text-xs">
            <EyeOff className="h-3 w-3 mr-1" />
            Internal
          </Badge>
        </div>
      )}

      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${config.color}`}>
            <Icon className="h-4 w-4" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={config.color}>
                {formatNoteType(note.type)}
              </Badge>

              {note.priority && (
                <div className="flex items-center gap-1">
                  <div
                    className={`h-2 w-2 rounded-full ${getPriorityColor(note.priority)}`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {formatPriority(note.priority)}
                  </span>
                </div>
              )}
            </div>

            {note.title && (
              <h4 className="font-medium text-sm">{note.title}</h4>
            )}

            <p className="text-sm text-muted-foreground leading-relaxed">
              {note.content}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {note.user && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={note.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {note.user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {note.user.name}
                    </span>
                  </div>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(note.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(note.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Note
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete?.(note.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Note
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
