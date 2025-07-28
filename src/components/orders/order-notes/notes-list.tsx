"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Plus, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useOrderNotes } from "@/hooks/use-orders";
import { OrderNote } from "@/lib/orders/types/orders.types";
import { NOTE_TYPES } from "@/lib/orders/dto/orders.dto";
import { AddNoteDialog } from "./add-note-dialog";
import { NoteItem } from "./note-item";

interface NotesListProps {
  orderId: string;
  showAddButton?: boolean;
  maxHeight?: string;
  showFilters?: boolean;
}

export default function NotesList({
  orderId,
  showAddButton = true,
  maxHeight = "500px",
  showFilters = true,
}: NotesListProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [showInternal, setShowInternal] = useState(true);

  // Fetch notes using the hook
  const { data: notesResponse, isLoading, refetch } = useOrderNotes(orderId);

  // Extract notes from response - the hook's select function returns data directly
  const notes: OrderNote[] = React.useMemo(() => {
    return notesResponse || [];
  }, [notesResponse]);

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    if (filterType !== "all" && note.noteType !== filterType) return false;
    if (!showInternal && note.isInternal) return false;
    return true;
  });

  const handleNoteAdded = () => {
    refetch();
  };

  const handleEditNote = (noteId: string) => {
    // Implement edit functionality
    console.log("Edit note:", noteId);
  };

  const handleDeleteNote = (noteId: string) => {
    // Implement delete functionality
    console.log("Delete note:", noteId);
  };

  const formatNoteType = (type: string) => {
    return type
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
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
          <h3 className="text-lg font-semibold">Order Notes</h3>
          <p className="text-sm text-muted-foreground">
            {filteredNotes.length} of {notes.length} notes
          </p>
        </div>

        {showAddButton && (
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
      {showFilters && notes.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {NOTE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatNoteType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showInternal"
                  checked={showInternal}
                  onCheckedChange={setShowInternal}
                />
                <Label htmlFor="showInternal" className="text-sm">
                  Show internal notes
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <div className="space-y-3" style={{ maxHeight, overflowY: "auto" }}>
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No notes found</h3>
              <p className="text-muted-foreground mb-4">
                {notes.length === 0
                  ? "Be the first to add a note to this order"
                  : "Try adjusting your filters to see more notes"}
              </p>
              {showAddButton && notes.length === 0 && (
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
          filteredNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
            />
          ))
        )}
      </div>

      {/* Notes Summary */}
      {notes.length > 0 && (
        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            <div className="flex justify-between text-sm">
              <span>
                Total notes: {notes.length} (
                {notes.filter((n) => n.isInternal).length} internal)
              </span>
              {notes.length > 0 && (
                <span>
                  Latest:{" "}
                  {formatDistanceToNow(
                    new Date(notes[0]?.createdAt || new Date()),
                    { addSuffix: true }
                  )}
                </span>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
