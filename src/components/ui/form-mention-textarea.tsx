/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
} from "react";
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { Textarea, TextareaProps } from "./textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Info } from "lucide-react";
import { useUserSearch } from "@/hooks/use-users";
import { useConversationFollowers } from "@/hooks/use-conversations";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Badge } from "./badge";

type MentionTextAreaProps<T extends FieldValues> = TextareaProps & {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  description?: string;
  conversationId: string;
  isAdmin?: boolean;
  onMentionsDetected?: (mentions: { id: string; name: string }[]) => void;
};

interface MentionState {
  showing: boolean;
  query: string;
  position: { top: number; left: number };
  startPosition: number;
}

const getInitials = (name: string): string => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const FormMentionTextArea = forwardRef<
  HTMLTextAreaElement,
  MentionTextAreaProps<any>
>(
  (
    {
      name,
      label,
      control,
      className,
      description,
      conversationId,
      isAdmin = true,
      onMentionsDetected,
      ...props
    },
    forwardedRef
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mentionsRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [detectedMentions, setDetectedMentions] = useState<
      { id: string; name: string }[]
    >([]);

    const [mentionState, setMentionState] = useState<MentionState>({
      showing: false,
      query: "",
      position: { top: 0, left: 0 },
      startPosition: -1,
    });

    const { users, isGettingUsers } = useUserSearch({ isAdmin });

    const { data: followers } = useConversationFollowers(conversationId);

    const { field: contentField } = useController({ name, control });
    const { field: tagsField } = useController({
      name: name.replace("content", "tags") as FieldPath<any>,
      control,
      defaultValue: [],
    });

    // Combine refs
    const combinedRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef]
    );

    // Filter users based on mention query
    const filteredUsers =
      mentionState.query.length > 0
        ? users.filter((user) =>
            user.label.toLowerCase().includes(mentionState.query.toLowerCase())
          )
        : users.slice(0, 10);

    // Process content to extract mentions and update tags (NO FOLLOWER ACTIONS)
    const processMentionsInContent = useCallback(
      (content: string) => {
        const mentionRegex = /@\[([^\]]+)\]/g;
        const mentions: { id: string; name: string }[] = [];
        const userIds: string[] = [];
        let match;

        while ((match = mentionRegex.exec(content)) !== null) {
          const mentionName = match[1];
          const user = users.find(
            (u) => u.label.toLowerCase() === mentionName.toLowerCase()
          );

          if (user) {
            mentions.push({ id: user.value, name: user.label });
            userIds.push(`USER:${user.value}`);
          }
        }

        setDetectedMentions(mentions);

        // Update tags field with user mentions (NO FOLLOWER ACTIONS HERE)
        const currentTags = tagsField.value || [];
        const nonUserTags = currentTags.filter(
          (tag: string) => !tag.startsWith("USER:")
        );
        const updatedTags = [...nonUserTags, ...userIds];

        tagsField.onChange(updatedTags);

        // Notify parent component if callback is provided
        if (onMentionsDetected) {
          onMentionsDetected(mentions);
        }

        return mentions;
      },
      [users, onMentionsDetected, tagsField]
    );

    // Calculate cursor position for dropdown placement
    const calculateDropdownPosition = useCallback(
      (textarea: HTMLTextAreaElement, cursorPos: number) => {
        const style = getComputedStyle(textarea);
        const lineHeight = parseInt(style.lineHeight) || 20;

        const lines = textarea.value.substring(0, cursorPos).split("\n").length;
        const top = lines * lineHeight + 5;
        const left = 10;

        return { top, left };
      },
      []
    );

    // Handle keyboard input for @ character and navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "@" && !mentionState.showing) {
          setTimeout(() => {
            if (!textareaRef.current) return;

            const textarea = textareaRef.current;
            const text = textarea.value;
            const cursorPos = textarea.selectionStart;

            if (cursorPos > 0 && text[cursorPos - 1] === "@") {
              if (cursorPos === 1 || /[\s\n]/.test(text[cursorPos - 2])) {
                const position = calculateDropdownPosition(textarea, cursorPos);

                setMentionState({
                  showing: true,
                  query: "",
                  position,
                  startPosition: cursorPos - 1,
                });
                setSelectedIndex(0);
              }
            }
          }, 0);
          return;
        }

        if (mentionState.showing) {
          switch (e.key) {
            case "ArrowDown":
              e.preventDefault();
              setSelectedIndex((prev) =>
                Math.min(prev + 1, filteredUsers.length - 1)
              );
              break;
            case "ArrowUp":
              e.preventDefault();
              setSelectedIndex((prev) => Math.max(prev - 1, 0));
              break;
            case "Enter":
              if (filteredUsers.length > 0) {
                e.preventDefault();
                insertMention(filteredUsers[selectedIndex]);
              }
              break;
            case "Escape":
              e.preventDefault();
              setMentionState((prev) => ({ ...prev, showing: false }));
              break;
            case "Tab":
              if (filteredUsers.length > 0) {
                e.preventDefault();
                insertMention(filteredUsers[selectedIndex]);
              }
              break;
            case " ":
            case "Backspace":
              const textarea = e.currentTarget;
              const cursorPos = textarea.selectionStart;

              if (
                e.key === "Backspace" &&
                cursorPos <= mentionState.startPosition
              ) {
                setMentionState((prev) => ({ ...prev, showing: false }));
              } else if (e.key === " ") {
                setMentionState((prev) => ({ ...prev, showing: false }));
              }
              break;
          }
        }
      },
      [filteredUsers, mentionState, selectedIndex, calculateDropdownPosition]
    );

    // Update mention query as user types
    const updateMentionQuery = useCallback(() => {
      if (!mentionState.showing || !textareaRef.current) return;

      const textarea = textareaRef.current;
      const text = textarea.value;
      const cursorPos = textarea.selectionStart;

      if (mentionState.startPosition >= 0) {
        if (cursorPos <= mentionState.startPosition) {
          setMentionState((prev) => ({ ...prev, showing: false }));
          return;
        }

        const query = text.substring(mentionState.startPosition + 1, cursorPos);

        if (/[\s\n]/.test(query)) {
          setMentionState((prev) => ({ ...prev, showing: false }));
          return;
        }

        setMentionState((prev) => ({ ...prev, query }));
        setSelectedIndex(0);
      }
    }, [mentionState.showing, mentionState.startPosition]);

    // Insert mention (ONLY UPDATE CONTENT, NO FOLLOWER ACTIONS)
    const insertMention = useCallback(
      (user: { value: string; label: string }) => {
        if (!textareaRef.current || mentionState.startPosition === -1) return;

        const textarea = textareaRef.current;
        const text = textarea.value;
        const cursorPos = textarea.selectionStart;

        const textBefore = text.substring(0, mentionState.startPosition);
        const textAfter = text.substring(cursorPos);
        const mention = `@[${user.label}] `;

        const newValue = textBefore + mention + textAfter;
        const newCursorPos = mentionState.startPosition + mention.length;

        // Update content field
        contentField.onChange(newValue);

        // Process mentions to update tags (NO FOLLOWER ACTIONS)
        processMentionsInContent(newValue);

        // Set cursor position
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
        }, 0);

        // Reset mention state
        setMentionState({
          showing: false,
          query: "",
          position: { top: 0, left: 0 },
          startPosition: -1,
        });

        // NOTE: NO FOLLOWER ACTIONS HERE - they happen when message is sent
      },
      [contentField, mentionState.startPosition, processMentionsInContent]
    );

    // Handle textarea input changes
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        contentField.onChange(e);

        if (mentionState.showing) {
          setTimeout(() => updateMentionQuery(), 0);
        }

        processMentionsInContent(e.target.value);
      },
      [
        contentField,
        mentionState.showing,
        updateMentionQuery,
        processMentionsInContent,
      ]
    );

    // Handle clicks outside to close mention dropdown
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          mentionsRef.current &&
          !mentionsRef.current.contains(e.target as Node) &&
          textareaRef.current &&
          !textareaRef.current.contains(e.target as Node)
        ) {
          setMentionState((prev) => ({ ...prev, showing: false }));
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Process mentions on mount and when field value changes
    useEffect(() => {
      if (contentField.value) {
        processMentionsInContent(contentField.value.toString());
      }
    }, [contentField.value, processMentionsInContent]);

    return (
      <FormField
        control={control}
        name={name}
        render={({ field: formField }) => (
          <FormItem className={cn(className)}>
            {!!label && (
              <FormLabel>
                {label}
                {props.required && <span className="text-destructive"> *</span>}
              </FormLabel>
            )}

            <FormControl className="relative">
              <div className="relative">
                <Textarea
                  {...formField}
                  ref={combinedRef}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  {...props}
                />

                {/* Mentions dropdown */}
                {mentionState.showing && (
                  <div
                    ref={mentionsRef}
                    style={{
                      position: "absolute",
                      top: `${mentionState.position.top}px`,
                      left: `${mentionState.position.left}px`,
                      zIndex: 50,
                    }}
                    className="w-72 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
                  >
                    {isGettingUsers ? (
                      <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                        Loading users...
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                        No users found for &quot;{mentionState.query}&quot;
                      </div>
                    ) : (
                      <ul className="py-1">
                        {filteredUsers.map((user, index) => {
                          const isFollowing = followers?.some(
                            (follower) => follower.id === user.value
                          );

                          return (
                            <li
                              key={user.value}
                              className={cn(
                                "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between",
                                selectedIndex === index &&
                                  "bg-gray-100 dark:bg-gray-700"
                              )}
                              onClick={() => insertMention(user)}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="size-6">
                                  <AvatarImage
                                    src={undefined}
                                    alt={user.label}
                                  />
                                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                                    {getInitials(user.label)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{user.label}</span>
                                {isFollowing && (
                                  <Badge variant="outline" className="text-xs">
                                    Following
                                  </Badge>
                                )}
                              </div>
                              {/* No "add follower" button - this happens on send */}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}

                {/* Show detected mentions preview */}
                {detectedMentions.length > 0 && (
                  <div className="absolute -top-8 left-0 flex gap-1 flex-wrap">
                    {detectedMentions.map((mention, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        @{mention.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>

            {!!description && (
              <FormDescription>
                <Info className="mr-2 inline-block size-4" />
                {description} Use @ to mention users. They&apos;ll be added as
                followers when you send the message.
              </FormDescription>
            )}

            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
);

FormMentionTextArea.displayName = "FormMentionTextArea";

export default FormMentionTextArea;
