import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/providers/socket-provider";

interface TypingUser {
  userId: string;
  userName?: string;
  timestamp: string;
}

export function useTypingIndicator(conversationId: string) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { socket, setTypingStatus } = useSocket();

  // Clean up old typing indicators
  useEffect(() => {
    const cleanup = setInterval(() => {
      const fiveSecondsAgo = Date.now() - 5000;
      setTypingUsers((prev) =>
        prev.filter(
          (user) => new Date(user.timestamp).getTime() > fiveSecondsAgo
        )
      );
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  // Listen for typing events
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (data: {
      conversationId: string;
      userId: string;
      username?: string;
      isTyping: boolean;
    }) => {
      if (data.conversationId !== conversationId) return;

      setTypingUsers((prev) => {
        const filtered = prev.filter((user) => user.userId !== data.userId);

        if (data.isTyping) {
          return [
            ...filtered,
            {
              userId: data.userId,
              userName: data.username,
              timestamp: new Date().toISOString(),
            },
          ];
        }

        return filtered;
      });
    };

    socket.on("user_typing", handleUserTyping);

    return () => {
      socket.off("user_typing", handleUserTyping);
    };
  }, [socket, conversationId]);

  const startTyping = useCallback(() => {
    if (!isTyping && setTypingStatus) {
      setIsTyping(true);
      setTypingStatus(conversationId, true);
    }
  }, [conversationId, setTypingStatus, isTyping]);

  const stopTyping = useCallback(() => {
    if (isTyping && setTypingStatus) {
      setIsTyping(false);
      setTypingStatus(conversationId, false);
    }
  }, [conversationId, setTypingStatus, isTyping]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    isTyping,
  };
}
