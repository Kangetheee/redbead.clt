import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import FormButton from "@/components/ui/form-button";

interface UnsavedChangesDialogProps {
  open: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  title?: string;
  description?: string;
}

export function UnsavedChangesDialog({
  open,
  onSave,
  onDiscard,
  onCancel,
  isSaving = false,
  title = "Unsaved Changes",
  description = "You have unsaved changes. What would you like to do?",
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={() => !isSaving && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDiscard}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            Discard Changes
          </Button>
          <FormButton
            isLoading={isSaving}
            onClick={onSave}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </FormButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
