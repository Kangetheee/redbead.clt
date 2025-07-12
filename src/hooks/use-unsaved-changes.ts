import { useCallback, useEffect, useState } from "react";

interface UseUnsavedChangesProps {
  hasUnsavedChanges: boolean;
  onSave: () => Promise<void> | void;
  onDiscard?: () => void;
}

export function useUnsavedChanges({
  hasUnsavedChanges,
  onSave,
  onDiscard,
}: UseUnsavedChangesProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleExit = useCallback(
    (callback: () => void) => {
      if (hasUnsavedChanges) {
        setPendingAction(() => callback);
        setShowDialog(true);
      } else {
        callback();
      }
    },
    [hasUnsavedChanges]
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave();
      setShowDialog(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, pendingAction]);

  const handleDiscard = useCallback(() => {
    onDiscard?.();
    setShowDialog(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [onDiscard, pendingAction]);

  const handleCancel = useCallback(() => {
    setShowDialog(false);
    setPendingAction(null);
  }, []);

  // Prevent browser navigation if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return {
    showDialog,
    handleExit,
    handleSave,
    handleDiscard,
    handleCancel,
    isSaving,
  };
}
