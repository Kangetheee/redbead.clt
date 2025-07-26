"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Pin,
  PinOff,
  EyeOff,
  Clock,
  AlertTriangle,
  FileText,
  Package,
  User,
  Star,
  Search,
  MoreHorizontal,
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
import { OrderNote } from "@/lib/orders/types/orders.types";
import { AddNoteDialog } from "@/components/orders/order-notes/add-note-dialog";
import { useOrderNotes } from "@/hooks/use-orders";

interface OrderNotesProps {
  orderId: string;
  showInternalNotes?: boolean;
  allowEdit?: boolean;
  compact?: boolean;
}

// Mock extended note data with additional fields
interface ExtendedOrderNote extends OrderNote {
  isPinned?: boolean;
  mentions?: string[];
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  replies?: ExtendedOrderNote[];
}

export default function OrderNotes({
  orderId,
  showInternalNotes = true,
  allowEdit = true,
  compact = false,
}: OrderNotesProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showInternal, setShowInternal] = useState(showInternalNotes);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Fetch notes
  const { data: notesData, isLoading, refetch } = useOrderNotes(orderId);
  const notes: ExtendedOrderNote[] = notesData?.success
    ? notesData.data || []
    : [];

  // Mock additional note data
  const extendedNotes: ExtendedOrderNote[] = notes.map((note) => ({
    ...note,
    isPinned: Math.random() > 0.8,
    mentions: Math.random() > 0.7 ? ["admin", "designer"] : [],
    attachments:
      Math.random() > 0.9
        ? [{ id: "1", name: "design_v2.pdf", url: "#", type: "pdf" }]
        : [],
    replies: [],
  }));

  // Filter notes
  const filteredNotes = extendedNotes.filter((note) => {
    if (!showInternal && note.isInternal) return false;
    if (filterType !== "all" && note.noteType !== filterType) return false;
    if (
      searchTerm &&
      !note.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !note.title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  // Sort notes (pinned first, then by date)
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleNoteAdded = () => {
    refetch();
  };

  const handleEditNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setEditingNote(noteId);
      setEditContent(note.content);
    }
  };

  const handleSaveEdit = () => {
    // Implement edit functionality
    console.log("Saving edit for note:", editingNote, editContent);
    setEditingNote(null);
    setEditContent("");
    refetch();
  };

  const handleDeleteNote = (noteId: string) => {
    // Implement delete functionality
    console.log("Deleting note:", noteId);
    refetch();
  };

  const handlePinNote = (noteId: string) => {
    // Implement pin functionality
    console.log("Toggling pin for note:", noteId);
    refetch();
  };

  const getNoteTypeConfig = (type: string) => {
    const configs = {
      GENERAL: { icon: MessageSquare, color: "bg-blue-100 text-blue-800" },
      URGENCY: { icon: AlertTriangle, color: "bg-red-100 text-red-800" },
      TIMELINE: { icon: Clock, color: "bg-yellow-100 text-yellow-800" },
      SHIPPING: { icon: Package, color: "bg-green-100 text-green-800" },
      CUSTOMIZATION: { icon: Star, color: "bg-purple-100 text-purple-800" },
      PRODUCTION: { icon: Package, color: "bg-orange-100 text-orange-800" },
      QUALITY: { icon: AlertTriangle, color: "bg-red-100 text-red-800" },
      DESIGN_APPROVAL: {
        icon: FileText,
        color: "bg-indigo-100 text-indigo-800",
      },
    }[type] || { icon: MessageSquare, color: "bg-gray-100 text-gray-800" };

    return configs;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500";
      case "HIGH":
        return "bg-orange-500";
      case "MEDIUM":
        return "bg-yellow-500";
      case "LOW":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            <span>Loading notes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Order Notes
            {sortedNotes.length > 0 && (
              <Badge variant="outline">{sortedNotes.length}</Badge>
            )}
          </h3>
          {!compact && (
            <p className="text-sm text-muted-foreground">
              Communications and internal notes for this order
            </p>
          )}
        </div>

        {allowEdit && (
          <AddNoteDialog
            orderId={orderId}
            onNoteAdded={handleNoteAdded}
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            }
          />
        )}
      </div>

      {/* Filters */}
      {!compact && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
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

              {showInternalNotes && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showInternal"
                    checked={showInternal}
                    onCheckedChange={setShowInternal}
                  />
                  <Label
                    htmlFor="showInternal"
                    className="text-sm whitespace-nowrap"
                  >
                    Show internal
                  </Label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {sortedNotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No notes found</h3>
              <p className="text-muted-foreground mb-4">
                {notes.length === 0
                  ? "Be the first to add a note to this order"
                  : "Try adjusting your filters to see more notes"}
              </p>
              {allowEdit && notes.length === 0 && (
                <AddNoteDialog
                  orderId={orderId}
                  onNoteAdded={handleNoteAdded}
                  trigger={
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Note
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        ) : (
          sortedNotes.map((note) => {
            const config = getNoteTypeConfig(note.noteType);
            const Icon = config.icon;
            const isEditing = editingNote === note.id;

            return (
              <Card
                key={note.id}
                className={`relative ${note.isPinned ? "border-yellow-200 bg-yellow-50" : ""}`}
              >
                {note.isPinned && (
                  <div className="absolute top-2 right-2">
                    <Pin className="h-4 w-4 text-yellow-600" />
                  </div>
                )}

                {note.isInternal && (
                  <div className="absolute top-2 right-8">
                    <Badge variant="outline" className="text-xs">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Internal
                    </Badge>
                  </div>
                )}

                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {/* Note Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${config.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={config.color}>
                              {note.noteType.replace("_", " ")}
                            </Badge>

                            {note.priority && (
                              <div className="flex items-center gap-1">
                                <div
                                  className={`h-2 w-2 rounded-full ${getPriorityColor(note.priority)}`}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {note.priority.toLowerCase()}
                                </span>
                              </div>
                            )}

                            {note.mentions && note.mentions.length > 0 && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  @{note.mentions.join(", @")}
                                </span>
                              </div>
                            )}
                          </div>

                          {note.title && !isEditing && (
                            <h4 className="font-medium text-sm">
                              {note.title}
                            </h4>
                          )}
                        </div>
                      </div>

                      {allowEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditNote(note.id)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Note
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handlePinNote(note.id)}
                            >
                              {note.isPinned ? (
                                <>
                                  <PinOff className="mr-2 h-4 w-4" /> Unpin
                                </>
                              ) : (
                                <>
                                  <Pin className="mr-2 h-4 w-4" /> Pin
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Note
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {/* Note Content */}
                    {isEditing ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={4}
                        />
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingNote(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="pl-11">
                        <p className="text-sm leading-relaxed">
                          {note.content}
                        </p>

                        {/* Attachments */}
                        {note.attachments && note.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">
                              ATTACHMENTS
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {note.attachments.map((attachment) => (
                                <Button
                                  key={attachment.id}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs"
                                  asChild
                                >
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    {attachment.name}
                                  </a>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Note Footer */}
                    <div className="flex items-center justify-between pl-11 text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        {note.user && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={note.user.avatar} />
                              <AvatarFallback className="text-xs">
                                {note.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{note.user.name}</span>
                          </div>
                        )}
                        <span>
                          {formatDistanceToNow(new Date(note.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      {note.replies && note.replies.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                        >
                          {note.replies.length}{" "}
                          {note.replies.length === 1 ? "reply" : "replies"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary */}
      {sortedNotes.length > 0 && !compact && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>
                  {sortedNotes.length} of {notes.length} notes shown
                </span>
                <span>•</span>
                <span>{notes.filter((n) => n.isInternal).length} internal</span>
                <span>•</span>
                <span>
                  {extendedNotes.filter((n) => n.isPinned).length} pinned
                </span>
              </div>

              <span>
                Last updated{" "}
                {formatDistanceToNow(
                  new Date(notes[0]?.createdAt || new Date()),
                  { addSuffix: true }
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
