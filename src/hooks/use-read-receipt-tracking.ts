import { useCallback, useEffect, useState } from "react";
import { useSocket } from "@/providers/socket-provider";
import { CONVERSATION_SUBSCRIBERS } from "@/lib/constants/socket.constants";

interface ReadReceiptData {
  isRead: boolean;
  isAdminRead: boolean;
  readAt?: string;
  adminReadAt?: string;
  readBy?: Array<{
    userId: string;
    userName: string;
    readAt: string;
    isAdmin: boolean;
  }>;
}

export function useReadReceiptTracking(conversationId: string) {
  const { socket } = useSocket();
  const [readReceipts, setReadReceipts] = useState<
    Record<string, ReadReceiptData>
  >({});

  useEffect(() => {
    if (!socket) return;

    const handleReadReceipt = (data: {
      conversationId: string;
      messageId: string;
      userId: string;
      userName?: string;
      isAdmin?: boolean;
      timestamp: string;
    }) => {
      if (data.conversationId === conversationId) {
        setReadReceipts((prev) => {
          const existing = prev[data.messageId] || {
            isRead: false,
            isAdminRead: false,
            readBy: [],
          };

          const updatedReadBy = existing.readBy || [];
          const existingReader = updatedReadBy.find(
            (reader) => reader.userId === data.userId
          );

          if (!existingReader) {
            updatedReadBy.push({
              userId: data.userId,
              userName: data.userName || "Unknown User",
              readAt: data.timestamp,
              isAdmin: data.isAdmin || false,
            });
          }

          return {
            ...prev,
            [data.messageId]: {
              ...existing,
              isRead: data.isAdmin ? existing.isRead : true,
              isAdminRead: data.isAdmin ? true : existing.isAdminRead,
              readAt: data.isAdmin ? existing.readAt : data.timestamp,
              adminReadAt: data.isAdmin ? data.timestamp : existing.adminReadAt,
              readBy: updatedReadBy,
            },
          };
        });
      }
    };

    socket.on(CONVERSATION_SUBSCRIBERS.MESSAGE_READ, handleReadReceipt);
    socket.on("message_read", handleReadReceipt); // Fallback

    return () => {
      socket.off(CONVERSATION_SUBSCRIBERS.MESSAGE_READ, handleReadReceipt);
      socket.off("message_read", handleReadReceipt);
    };
  }, [socket, conversationId]);

  const getMessageReadStatus = useCallback(
    (messageId: string): ReadReceiptData => {
      return (
        readReceipts[messageId] || {
          isRead: false,
          isAdminRead: false,
          readBy: [],
        }
      );
    },
    [readReceipts]
  );

  const getReadCount = useCallback(
    (messageId: string): number => {
      const status = readReceipts[messageId];
      return status?.readBy?.length || 0;
    },
    [readReceipts]
  );

  const isMessageRead = useCallback(
    (messageId: string, isAdmin: boolean = false): boolean => {
      const status = readReceipts[messageId];
      if (!status) return false;
      return isAdmin ? status.isAdminRead : status.isRead;
    },
    [readReceipts]
  );

  return {
    readReceipts,
    getMessageReadStatus,
    getReadCount,
    isMessageRead,
  };
}

// Bulk Read
export function useBulkReadMessages() {
  const { socket } = useSocket();

  const markMessagesAsRead = useCallback(
    (conversationId: string, messageIds: string[]) => {
      if (!socket) return;

      socket.emit("mark_messages_read", {
        conversationId,
        messageIds,
      });
    },
    [socket]
  );

  const markAllMessagesAsRead = useCallback(
    (conversationId: string) => {
      if (!socket) return;

      socket.emit("mark_all_messages_read", {
        conversationId,
      });
    },
    [socket]
  );

  return {
    markMessagesAsRead,
    markAllMessagesAsRead,
  };
}

// Hook for managing read receipt preferences
export function useReadReceiptPreferences() {
  const [showReadReceipts, setShowReadReceipts] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [showDetailedStatus, setShowDetailedStatus] = useState(false);

  const toggleReadReceipts = useCallback(() => {
    setShowReadReceipts((prev) => !prev);
  }, []);

  const toggleTimestamps = useCallback(() => {
    setShowTimestamps((prev) => !prev);
  }, []);

  const toggleDetailedStatus = useCallback(() => {
    setShowDetailedStatus((prev) => !prev);
  }, []);

  return {
    showReadReceipts,
    showTimestamps,
    showDetailedStatus,
    toggleReadReceipts,
    toggleTimestamps,
    toggleDetailedStatus,
  };
}
