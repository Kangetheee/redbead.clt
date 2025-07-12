import { type Editor } from "@tiptap/react";
import {
  MdList,
  MdOutlineFormatListBulleted,
  MdOutlineFormatListNumbered,
} from "react-icons/md";

import { cn } from "@/lib/utils";

import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../dropdown-menu";

type Props = {
  editor: Editor;
  disabled?: boolean;
};

export default function ListButton({ editor, disabled }: Props) {
  const lists = [
    {
      label: "Bullet List",
      icon: MdOutlineFormatListBulleted,
      isActive: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Ordered List",
      icon: MdOutlineFormatListNumbered,
      isActive: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          type="button"
          variant="ghost"
          disabled={disabled}
          className="flex h-7 min-w-7 shrink-0 flex-col items-center justify-center overflow-hidden rounded-sm text-sm"
        >
          <MdList className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col gap-y-1 p-1">
        {lists.map(({ icon: Icon, label, isActive, onClick }) => (
          <Button
            key={label}
            size="sm"
            type="button"
            variant="ghost"
            className={cn(
              "flex items-center justify-start gap-x-2 rounded-sm px-2 py-1",
              isActive && "bg-muted"
            )}
            onClick={onClick}
          >
            <Icon className="size-4" />
            <span className="text-sm">{label}</span>
          </Button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
