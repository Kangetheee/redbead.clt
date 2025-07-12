import { useCallback, useState } from "react";
import { useFollowConversation, mentionUtils } from "@/hooks/use-conversations";
import { useQueryClient } from "@tanstack/react-query";
import { tags } from "@/lib/shared/constants";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  username?: string;
};

export function useMentionFollowers(
  conversationId: string,
  currentUserId?: string
) {
  const { mutate: followConversation } = useFollowConversation(conversationId);
  const [mentionedUsers, setMentionedUsers] = useState<User[]>([]);
  const queryClient = useQueryClient();

  // Handle mentions when detected in the textarea
  const handleMentionsDetected = useCallback(
    (mentions: { id: string; name: string }[]) => {
      const formattedMentions = mentions.map((mention) => ({
        id: mention.id,
        name: mention.name,
      }));

      setMentionedUsers(formattedMentions);
    },
    []
  );

  // Process mentions and make users follow when message is sent
  const processMentionsAndFollow = useCallback(
    (content: string, availableUsers: User[]) => {
      const { mentionedUserIds } = mentionUtils.parseMentions(
        content,
        availableUsers
      );

      if (mentionedUserIds.length === 0) {
        return [];
      }

      console.log(
        `Processing ${mentionedUserIds.length} mentions:`,
        mentionedUserIds
      );

      // Make each mentioned user follow the conversation
      mentionedUserIds.forEach((userId) => {
        if (userId !== currentUserId) {
          followConversation(userId, {
            onSuccess: () => {
              // Show toast notification
              const userName =
                availableUsers.find((u) => u.id === userId)?.name || "User";
              toast.success(`${userName} is now following this conversation`);

              // Invalidate the followers query to refresh the list
              queryClient.invalidateQueries({
                queryKey: [tags.CONVERSATION_FOLLOWERS, { conversationId }],
              });
            },
          });
        }
      });

      return mentionedUserIds;
    },
    [followConversation, conversationId, currentUserId, queryClient]
  );

  return {
    mentionedUsers,
    handleMentionsDetected,
    processMentionsAndFollow,
  };
}
