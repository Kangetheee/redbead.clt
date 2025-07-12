"use client";

import {
  CONVERSATION_EMITTERS,
  CONVERSATION_SUBSCRIBERS,
} from "@/lib/constants/socket.constants";
import { MessageDto } from "@/lib/conversations/dto/conversation.dto";
import {
  Conversation,
  ConversationMessage,
  ConversationStatus,
  MessageSender,
  MessageType,
} from "@/lib/conversations/types/conversations.types";
import { tags } from "@/lib/shared/constants";
import { PaginatedData } from "@/lib/shared/types";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Socket, io } from "socket.io-client";

// Types
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (conversationId: string, message: MessageDto) => boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  setTypingStatus: (conversationId: string, isTyping: boolean) => void;
  markMessageAsRead: (conversationId: string, messageId: string) => void;
  // emitEvent: (event: string, data?: any) => void;
}

interface SocketProviderProps {
  children: ReactNode;
  apiUrl: string;
  token?: string;
}

// Context
const SocketContext = createContext<SocketContextType | null>(null);

// Provider Component
export function SocketProvider({
  children,
  token,
  apiUrl,
}: SocketProviderProps) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  const namespace = "/v1/conversations";

  useEffect(() => {
    // Create socket connection
    const socket = io(`${apiUrl}${namespace}`, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: token ? { token } : undefined,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    // Set up React Query integration
    setupChatQueryInvalidationListeners(socket, queryClient);

    // Connect the socket
    socket.connect();

    // Cleanup
    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, apiUrl, namespace, queryClient]);

  // Helper functions
  const sendMessage = (
    conversationId: string,
    { media, ...message }: MessageDto
  ) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(CONVERSATION_EMITTERS.SEND_MESSAGE, {
        conversationId,
        ...message,
        mediaIds: media?.map((m) => m.id),
      });
      return true;
    } else {
      console.warn("Socket not connected. Cannot send message");
      return false;
    }
  };

  const joinConversation = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(CONVERSATION_EMITTERS.JOIN_CONVERSATION, {
        conversationId,
      });
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(CONVERSATION_EMITTERS.LEAVE_CONVERSATION, {
        conversationId,
      });
    }
  };

  const setTypingStatus = (conversationId: string, isTyping: boolean) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(CONVERSATION_EMITTERS.TYPING, {
        conversationId,
        isTyping,
      });
    }
  };

  const markMessageAsRead = (conversationId: string, messageId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(CONVERSATION_EMITTERS.MARK_READ, {
        conversationId,
        messageId,
      });
    }
  };

  // const emitEvent = (event: string, data?: any) => {
  //   if (socketRef.current && isConnected) {
  //     socketRef.current.emit(event, data);
  //   } else {
  //     console.warn(`Socket not connected. Cannot emit event: ${event}`);
  //   }
  // };

  const contextValue: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation,
    setTypingStatus,
    markMessageAsRead,
    // emitEvent,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

// Hook to use socket context
export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

// Set up listeners that invalidate React Query cache based on chat events
function setupChatQueryInvalidationListeners(
  socket: Socket,
  queryClient: ReturnType<typeof useQueryClient>
) {
  // // Generic invalidation handler
  // socket.on("invalidate_query", (data: { queryKey: string[] }) => {
  //   queryClient.invalidateQueries({ queryKey: data.queryKey });
  // });

  // New message received
  socket.on(
    CONVERSATION_SUBSCRIBERS.MESSAGE_CREATED,
    async (data: { conversationId: string; payload: ConversationMessage }) => {
      const queryKey = [tags.CONVERSATION, data.conversationId];

      await queryClient.cancelQueries({ queryKey });

      const previousMessages =
        queryClient.getQueryData<
          InfiniteData<PaginatedData<ConversationMessage>, unknown>
        >(queryKey);

      if (previousMessages) {
        const newData = {
          ...previousMessages,
          pages: previousMessages.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                results: [...page.results, data.payload],
              };
            }
            return page;
          }),
        };

        queryClient.setQueryData(queryKey, newData);
      }
    }
  );

  // Message read receipt received
  socket.on(
    CONVERSATION_SUBSCRIBERS.MESSAGE_READ,
    async (data: {
      conversationId: string;
      messageId: string;
      userId: string;
      isAdmin?: boolean;
      timestamp: string;
    }) => {
      console.log("Read receipt received:", data);

      const queryKey = [tags.CONVERSATION_MESSAGE, data.conversationId];

      await queryClient.cancelQueries({ queryKey });

      const previousMessages =
        queryClient.getQueryData<
          InfiniteData<PaginatedData<ConversationMessage>, unknown>
        >(queryKey);

      if (previousMessages) {
        const newData = {
          ...previousMessages,
          pages: previousMessages.pages.map((page) => ({
            ...page,
            results: page.results.map((message) =>
              message.id === data.messageId
                ? {
                    ...message,
                    isRead: data.isAdmin ? message.isRead : true,
                    isAdminRead: data.isAdmin ? true : message.isAdminRead,
                  }
                : message
            ),
          })),
        };

        queryClient.setQueryData(queryKey, newData);
      }

      // Also update conversations list to reflect read status
      const conversationsQueryKey = [tags.CONVERSATION];
      const previousConversations = queryClient.getQueryData<
        PaginatedData<Conversation>
      >(conversationsQueryKey);

      if (previousConversations) {
        const updatedConversations = {
          ...previousConversations,
          results: previousConversations.results.map((conversation) => {
            if (
              conversation.id === data.conversationId &&
              conversation.lastMessage?.id === data.messageId
            ) {
              return {
                ...conversation,
                lastMessage: {
                  ...conversation.lastMessage,
                  isRead: data.isAdmin ? conversation.lastMessage.isRead : true,
                  isAdminRead: data.isAdmin
                    ? true
                    : conversation.lastMessage.isAdminRead,
                },
              };
            }
            return conversation;
          }),
        };

        queryClient.setQueryData(conversationsQueryKey, updatedConversations);
      }
    }
  );

  socket.on(
    CONVERSATION_SUBSCRIBERS.CONVERSATION_UPDATED,
    async (data: {
      conversationId: string;
      id: string;
      sentAt: string;
      content: string;
      type: MessageType;
      sender: MessageSender;
    }) => {
      const queryKey = [tags.CONVERSATION];

      await queryClient.cancelQueries({ queryKey });

      const previousConversations =
        queryClient.getQueryData<PaginatedData<Conversation>>(queryKey);

      if (previousConversations) {
        const exists =
          previousConversations?.results.findIndex(
            (conversation) => conversation.id === data.conversationId
          ) !== -1;

        const updatedResults = {
          ...previousConversations,
          results: previousConversations.results.map((conversation) => {
            if (conversation.id === data.conversationId) {
              return {
                ...conversation,
                _count: {
                  ...conversation._count,
                  messages: conversation._count.messages + 1,
                },
                lastMessage: {
                  ...conversation.lastMessage,
                  sentAt: data.sentAt,
                  content: data.content,
                },
              };
            }
            return conversation;
          }),
        };

        if (!exists) {
          const newConversation: Conversation = {
            id: data.conversationId,
            startedAt: data.sentAt,
            endedAt: null,
            status: ConversationStatus.ACTIVE,
            user: null,
            bot: null,
            client: null,
            _count: { messages: 1 },
            unreadCount: 1,
            adminUnreadCount: 1,
            lastMessage: {
              sentAt: data.sentAt,
              content: data.content,
              id: data.id,
              type: data.type,
              sender: data.sender,
              isAdminRead: false,
              isRead: false,
            },
          };
          updatedResults.results.unshift(newConversation);
        }

        queryClient.setQueryData(queryKey, updatedResults);
        queryClient.invalidateQueries({ queryKey });
      }
    }
  );

  socket.on(
    "conversation_status_changed",
    async (data: {
      conversationId: string;
      status: ConversationStatus;
      updatedBy: string;
    }) => {
      console.log("Conversation status changed:", data);

      // Update specific conversation
      queryClient.invalidateQueries({
        queryKey: [tags.CONVERSATION, { conversationId: data.conversationId }],
      });

      // Update conversations list
      const queryKey = [tags.CONVERSATION];
      const previousConversations =
        queryClient.getQueryData<PaginatedData<Conversation>>(queryKey);

      if (previousConversations) {
        const updatedConversations = {
          ...previousConversations,
          results: previousConversations.results.map((conversation) =>
            conversation.id === data.conversationId
              ? { ...conversation, status: data.status }
              : conversation
          ),
        };

        queryClient.setQueryData(queryKey, updatedConversations);
      }
    }
  );

  socket.on(
    CONVERSATION_SUBSCRIBERS.CONVERSATION_CREATED,
    async (data: Conversation) => {
      const queryKey = [tags.CONVERSATION];

      await queryClient.cancelQueries({ queryKey });

      const previousConversations =
        queryClient.getQueryData<PaginatedData<Conversation>>(queryKey);

      if (previousConversations) {
        const updatedResults = {
          ...previousConversations,
          results: [...previousConversations.results, data],
        };

        queryClient.setQueryData(queryKey, updatedResults);
        queryClient.invalidateQueries({ queryKey });
      }
    }
  );

  // Connection status events
  socket.on(
    "user_connected",
    (data: { userId: string; conversationId: string }) => {
      console.log("User connected:", data);
      // You can update UI to show user as online
    }
  );

  socket.on(
    "user_disconnected",
    (data: { userId: string; conversationId: string }) => {
      console.log("User disconnected:", data);
      // You can update UI to show user as offline
    }
  );

  // Error handling
  socket.on("error", (error: { message: string; code?: string }) => {
    console.error("Socket error:", error);
    // You can show error notifications here
  });
}

// // Message updated (edited, deleted, etc.)
// socket.on(
//   "message_updated",
//   (data: { conversationId: string; messageId: string; message?: any }) => {
//     queryClient.invalidateQueries({
//       queryKey: [
//         tags.CONVERSATION_MESSAGE,
//         { conversationId: data.conversationId },
//       ],
//     });
//   }
// );

// // Message deleted
// socket.on(
//   "message_deleted",
//   (data: { conversationId: string; messageId: string }) => {
//     queryClient.invalidateQueries({
//       queryKey: [
//         tags.CONVERSATION_MESSAGE,
//         { conversationId: data.conversationId },
//       ],
//     });
//   }
// );

// // Conversation updated (title, participants, settings, etc.)
// socket.on(
//   "conversation_updated",
//   (data: { conversationId: string; conversation?: any }) => {
//     // Invalidate specific conversation
//     queryClient.invalidateQueries({
//       queryKey: [tags.CONVERSATION, { conversationId: data.conversationId }],
//     });

//     // Invalidate conversations list
//     queryClient.invalidateQueries({ queryKey: [tags.CONVERSATION] });

//     // Optionally update cache directly if conversation data is provided
//     if (data.conversation) {
//       queryClient.setQueryData(
//         [tags.CONVERSATION, { conversationId: data.conversationId }],
//         data.conversation
//       );
//     }
//   }
// );

// // User joined conversation
// socket.on(
//   "user_joined",
//   (data: { conversationId: string; userId: string; user?: any }) => {
//     queryClient.invalidateQueries({
//       queryKey: [tags.CONVERSATION, { conversationId: data.conversationId }],
//     });
//     queryClient.invalidateQueries({ queryKey: [tags.CONVERSATION] });
//   }
// );

// // User left conversation
// socket.on("user_left", (data: { conversationId: string; userId: string }) => {
//   queryClient.invalidateQueries({
//     queryKey: [tags.CONVERSATION, { conversationId: data.conversationId }],
//   });
//   queryClient.invalidateQueries({ queryKey: [tags.CONVERSATION] });
// });

// // Message read receipts
// socket.on(
//   "message_read",
//   (data: { conversationId: string; messageId: string; userId: string }) => {
//     // Update read receipts - might need to invalidate messages
//     queryClient.invalidateQueries({
//       queryKey: [
//         tags.CONVERSATION_MESSAGE,
//         { conversationId: data.conversationId },
//       ],
//     });
//   }
// );

// // Online/offline status updates
// socket.on(
//   "user_status_changed",
//   (data: { userId: string; isOnline: boolean; lastSeen?: Date }) => {
//     // Invalidate conversations to update user status in participant lists
//     queryClient.invalidateQueries({ queryKey: [tags.CONVERSATION] });
//   }
// );

export function useTypingIndicators(conversationId: string) {
  const { socket } = useSocket();
  const [typingUsers, setTypingUsers] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (data: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
      username?: string;
    }) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            return prev.includes(data.userId) ? prev : [...prev, data.userId];
          } else {
            return prev.filter((id) => id !== data.userId);
          }
        });
      }
    };

    socket.on(CONVERSATION_SUBSCRIBERS.USER_TYPING, handleUserTyping);

    return () => {
      socket.off(CONVERSATION_SUBSCRIBERS.USER_TYPING, handleUserTyping);
    };
  }, [socket, conversationId]);

  return typingUsers;
}

// Custom hook for connection status
export function useConnectionStatus() {
  const { isConnected } = useSocket();
  return isConnected;
}

export function useReadReceiptStatus(conversationId: string) {
  const { socket } = useSocket();
  const [readReceipts, setReadReceipts] = React.useState<
    Record<
      string,
      {
        isRead: boolean;
        isAdminRead: boolean;
        readAt?: string;
        adminReadAt?: string;
      }
    >
  >({});

  React.useEffect(() => {
    if (!socket) return;

    const handleReadReceipt = (data: {
      conversationId: string;
      messageId: string;
      userId: string;
      isAdmin?: boolean;
      timestamp: string;
    }) => {
      if (data.conversationId === conversationId) {
        setReadReceipts((prev) => ({
          ...prev,
          [data.messageId]: {
            ...prev[data.messageId],
            isRead: data.isAdmin
              ? (prev[data.messageId]?.isRead ?? false)
              : true,
            isAdminRead: data.isAdmin
              ? true
              : (prev[data.messageId]?.isAdminRead ?? false),
            readAt: data.isAdmin
              ? prev[data.messageId]?.readAt
              : data.timestamp,
            adminReadAt: data.isAdmin
              ? data.timestamp
              : prev[data.messageId]?.adminReadAt,
          },
        }));
      }
    };

    socket.on(CONVERSATION_SUBSCRIBERS.MESSAGE_READ, handleReadReceipt);
    socket.on("message_read", handleReadReceipt); // Fallback

    return () => {
      socket.off(CONVERSATION_SUBSCRIBERS.MESSAGE_READ, handleReadReceipt);
      socket.off("message_read", handleReadReceipt);
    };
  }, [socket, conversationId]);

  return readReceipts;
}
