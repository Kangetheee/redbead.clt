import { useCallback, useRef } from "react";
import { useSocket } from "@/providers/socket-provider";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { MessageSender } from "@/lib/conversations/types/conversations.types";

interface UseSimpleMessageReadTrackingProps {
  conversationId: string;
  messageId: string;
  isRead: boolean;
  isAdminRead: boolean;
  sender: MessageSender;
  isAdmin?: boolean;
}

export function useMessageReadTracking({
  conversationId,
  messageId,
  isRead,
  isAdminRead,
  sender,
  isAdmin = false,
}: UseSimpleMessageReadTrackingProps) {
  const { markMessageAsRead } = useSocket();
  const hasMarkedAsRead = useRef(false);

  const handleMarkAsRead = useCallback(() => {
    if (hasMarkedAsRead.current) return;

    const shouldMarkAsRead = isAdmin
      ? !isAdminRead && sender !== MessageSender.AGENT
      : !isRead && sender !== MessageSender.CLIENT;

    if (shouldMarkAsRead) {
      markMessageAsRead(conversationId, messageId);
      hasMarkedAsRead.current = true;
    }
  }, [
    conversationId,
    messageId,
    isRead,
    isAdminRead,
    sender,
    isAdmin,
    markMessageAsRead,
  ]);

  const { elementRef } = useIntersectionObserver({
    onIntersect: handleMarkAsRead,
    threshold: 0.5,
  });

  return { elementRef };
}
