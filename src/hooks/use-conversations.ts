import {
  followConversationAction,
  getConversationAction,
  getConversationFollowersAction,
  getConversationMessagesAction,
  getConversationsAction,
  sendMessageAction,
  updateConversationAction,
} from "@/lib/conversations/conversation.actions";
import {
  ConversationDto,
  MessageDto,
} from "@/lib/conversations/dto/conversation.dto";
import {
  MessageQueryParams,
  ConversationMessage,
} from "@/lib/conversations/types/conversations.types";
import { tags } from "@/lib/shared/constants";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import useUpdateSearchParams from "./use-update-search-params";
import { format, isToday, isYesterday, isSameDay, startOfDay } from "date-fns";

interface User {
  id: string;
  name: string;
  username?: string;
}

// Date grouping utilities
export const dateUtils = {
  getDateLabel: (date: Date): string => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  },

  getDateKey: (date: Date): string => {
    return format(startOfDay(date), "yyyy-MM-dd");
  },

  shouldShowDateSeparator: (
    currentMessage: ConversationMessage,
    previousMessage?: ConversationMessage
  ): boolean => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.sentAt);
    const previousDate = new Date(previousMessage.sentAt);

    return !isSameDay(currentDate, previousDate);
  },

  groupMessagesByDate: (messages: ConversationMessage[]) => {
    const groups: { [key: string]: ConversationMessage[] } = {};

    messages.forEach((message) => {
      const dateKey = dateUtils.getDateKey(new Date(message.sentAt));
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  },

  formatMessageTime: (sentAt: string): string => {
    return format(new Date(sentAt), "HH:mm");
  },

  formatMessageDateTime: (sentAt: string): string => {
    const date = new Date(sentAt);
    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, "HH:mm")}`;
    } else {
      return format(date, "MMM d, HH:mm");
    }
  },
};

export function useConversations() {
  const { getSearchParams } = useUpdateSearchParams();

  const queryParams = getSearchParams();

  const { data, error, isError, isLoading, isRefetching } = useQuery({
    queryKey: [tags.CONVERSATION, queryParams],
    queryFn: async () => {
      const res = await getConversationsAction(queryParams);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });

  return {
    data,
    error: isError ? error : undefined,
    isLoading,
    isRefetching,
  };
}

export function useConversationDetails(conversationId: string) {
  return useQuery({
    queryKey: [tags.CONVERSATION, { conversationId }],
    queryFn: async () => {
      const res = await getConversationAction(conversationId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useUpdateConversation(
  conversationId: string,
  onSuccess?: () => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ConversationDto) => {
      const res = await updateConversationAction(conversationId, data);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      toast.success("Conversation updated");
      onSuccess?.();
      queryClient.invalidateQueries({
        queryKey: [tags.CONVERSATION, { conversationId }],
      });
    },
  });
}

type MessageProps = {
  conversationId: string;
  onSuccess?: () => void;
};

export const mentionUtils = {
  parseMentions: (
    content: string,
    users: User[] = []
  ): {
    content: string;
    mentionedUserIds: string[];
  } => {
    const mentionedUserIds: string[] = [];

    let parsedContent = content.replace(/@\[([^\]]+)\]/g, (match, name) => {
      const user = users.find(
        (u) => u.name.toLowerCase() === name.toLowerCase()
      );
      if (user) {
        mentionedUserIds.push(user.id);
        return `@${user.username || user.name.replace(/\s+/g, "")}`;
      }
      return match;
    });

    parsedContent = parsedContent.replace(/@(\w+)/g, (match, username) => {
      const user = users.find(
        (u) =>
          u.username?.toLowerCase() === username.toLowerCase() ||
          u.name.toLowerCase().replace(/\s+/g, "") === username.toLowerCase()
      );
      if (user && !mentionedUserIds.includes(user.id)) {
        mentionedUserIds.push(user.id);
      }
      return match;
    });

    return {
      content: parsedContent,
      mentionedUserIds: [...new Set(mentionedUserIds)], // Remove duplicates
    };
  },

  // Create tags array from user IDs
  createTagsFromUserIds: (userIds: string[]): string[] => {
    return userIds.map((userId) => `USER:${userId}`);
  },

  // Extract user IDs from existing tags
  extractUserIdsFromTags: (tags: string[]): string[] => {
    return tags
      .filter((tag) => tag.startsWith("USER:"))
      .map((tag) => tag.replace("USER:", ""));
  },

  // Find mention positions in text for UI highlighting/autocomplete
  findMentionPositions: (
    content: string
  ): Array<{ start: number; end: number; text: string }> => {
    const positions: Array<{ start: number; end: number; text: string }> = [];
    const mentionRegex = /@\[([^\]]+)\]|@(\w+)/g;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      positions.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
      });
    }

    return positions;
  },

  // Convert display names back to user IDs for backend processing
  resolveDisplayNamesToUserIds: (content: string, users: User[]): string[] => {
    const userIds: string[] = [];

    // Find all @mentions in content
    const mentionRegex = /@(\w+)/g;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      const username = match[1];
      const user = users.find(
        (u) =>
          u.username === username ||
          u.name.replace(/\s+/g, "").toLowerCase() === username.toLowerCase()
      );
      if (user) {
        userIds.push(user.id);
      }
    }

    return [...new Set(userIds)];
  },
};

export function useSendMessage({ conversationId, onSuccess }: MessageProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending, ...rest } = useMutation({
    mutationFn: async ({ ...messageData }: MessageDto) => {
      const res = await sendMessageAction(conversationId, { ...messageData });
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      onSuccess?.();

      queryClient.invalidateQueries({
        queryKey: [tags.CONVERSATION, conversationId],
      });
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    },
  });

  return {
    send: mutate,
    isSending: isPending,
    ...rest,
  };
}

export function useSendMessageWithMentions({
  conversationId,
  onSuccess,
  availableUsers = [],
}: MessageProps & { availableUsers?: User[] }) {
  const {
    send: baseSend,
    isSending,
    ...rest
  } = useSendMessage({
    conversationId,
    onSuccess,
  });

  const sendWithMentions = useCallback(
    (messageData: MessageDto) => {
      // Parse mentions from content
      const { content: parsedContent, mentionedUserIds } =
        mentionUtils.parseMentions(messageData.content, availableUsers);

      const mentionTags = mentionUtils.createTagsFromUserIds(mentionedUserIds);

      const existingTags = messageData.tags || [];
      const allTags = [...new Set([...existingTags, ...mentionTags])];

      baseSend({
        ...messageData,
        content: parsedContent,
        tags: allTags,
      });
    },
    [baseSend, availableUsers]
  );

  return {
    send: sendWithMentions,
    isSending,
    ...rest,
  };
}

// hook for conversation messages with date grouping and infinite scrolling
export function useConversationMessages({
  conversationId,
  queryParams,
}: MessageProps & { queryParams?: MessageQueryParams }) {
  const { getParsedSearchParams } = useUpdateSearchParams();
  const baseQuery = getParsedSearchParams();

  const queryKey = [tags.CONVERSATION, conversationId];

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      let effectiveParams: MessageQueryParams | string;

      if (queryParams) {
        effectiveParams = { ...queryParams, pageIndex: pageParam };
      } else {
        const queryParamsObj = {
          ...baseQuery,
          pageIndex: pageParam.toString(),
        };
        effectiveParams = new URLSearchParams(queryParamsObj).toString();
      }

      const res = await getConversationMessagesAction(
        conversationId,
        effectiveParams
      );
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      const { meta } = lastPage;
      const { pageIndex, pageCount } = meta;
      const nextPage = pageIndex + 1;
      return nextPage < pageCount ? nextPage : undefined;
    },
    initialPageParam: 0,
    select: (data) => {
      const allMessages = data.pages.flatMap((page) => page.results);
      const sortedMessages = allMessages.sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      );

      return {
        ...data,
        messages: sortedMessages,
      };
    },
  });

  const messageGroups = useMemo(() => {
    if (!data?.messages) return {};

    const reversedMessages = [...data.messages].reverse();
    return dateUtils.groupMessagesByDate(reversedMessages);
  }, [data?.messages]);

  // Create timeline items with date separators
  const timelineItems = useMemo(() => {
    if (!data?.messages) return [];

    const items: Array<{
      type: "message" | "date-separator";
      data?: ConversationMessage;
      date?: string;
      dateLabel?: string;
      timestamp: number;
    }> = [];

    // Process messages in reverse order (oldest first) for proper date separation
    const reversedMessages = [...data.messages].reverse();

    reversedMessages.forEach((message, index) => {
      const previousMessage =
        index > 0 ? reversedMessages[index - 1] : undefined;

      // Add date separator if needed
      if (dateUtils.shouldShowDateSeparator(message, previousMessage)) {
        const messageDate = new Date(message.sentAt);
        items.push({
          type: "date-separator",
          date: dateUtils.getDateKey(messageDate),
          dateLabel: dateUtils.getDateLabel(messageDate),
          timestamp: messageDate.getTime(),
        });
      }

      // Add message
      items.push({
        type: "message",
        data: message,
        timestamp: new Date(message.sentAt).getTime(),
      });
    });

    return items;
  }, [data?.messages]);

  return {
    messages: data?.messages ?? [],
    messageGroups,
    timelineItems,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    formatTime: dateUtils.formatMessageTime,
    formatDateTime: dateUtils.formatMessageDateTime,
    getDateLabel: dateUtils.getDateLabel,
  };
}

export function useConversationFollowers(conversationId: string) {
  return useQuery({
    queryKey: [tags.CONVERSATION_FOLLOWERS, { conversationId }],
    queryFn: async () => {
      const res = await getConversationFollowersAction(conversationId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!conversationId,
  });
}

export function useFollowConversation(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId?: string) => {
      const res = await followConversationAction(conversationId, userId);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      toast.success("Successfully followed conversation");
      queryClient.invalidateQueries({
        queryKey: [tags.CONVERSATION_FOLLOWERS, { conversationId }],
      });
    },
    onError: (error) => {
      toast.error("Failed to follow conversation");
      console.error("Follow conversation error:", error);
    },
  });
}

export const tagUtils = {
  parseUserIdFromTag: (tag: string): string | null => {
    if (tag.startsWith("USER:")) {
      return tag.replace("USER:", "");
    }
    return null;
  },

  getUserIdsFromTags: (tags: string[]): string[] => {
    return tags
      .map((tag) => tagUtils.parseUserIdFromTag(tag))
      .filter((userId): userId is string => userId !== null);
  },

  createUserTag: (userId: string): string => {
    return `USER:${userId}`;
  },

  isUserTagged: (tags: string[] = [], userId: string): boolean => {
    return tags.includes(tagUtils.createUserTag(userId));
  },

  getUserNamesFromTags: (tags: string[], users: User[]): User[] => {
    const userIds = tagUtils.getUserIdsFromTags(tags);
    return users.filter((user) => userIds.includes(user.id));
  },

  createMentionDisplay: (tags: string[], users: User[]): string => {
    const mentionedUsers = tagUtils.getUserNamesFromTags(tags, users);
    return mentionedUsers
      .map((user) => `@${user.username || user.name}`)
      .join(" ");
  },
};
