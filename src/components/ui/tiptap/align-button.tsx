import { type Editor } from "@tiptap/react";
import { IconType } from "react-icons/lib";
import {
  MdFormatAlignCenter,
  MdFormatAlignJustify,
  MdFormatAlignLeft,
  MdFormatAlignRight,
} from "react-icons/md";

import { cn } from "@/lib/utils";

import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../dropdown-menu";

type AlignMent = {
  label: string;
  value: "left" | "center" | "right" | "justify";
  icon: IconType;
};

const alignments: AlignMent[] = [
  {
    label: "Left",
    value: "left",
    icon: MdFormatAlignLeft,
  },
  {
    label: "Center",
    value: "center",
    icon: MdFormatAlignCenter,
  },
  {
    label: "Right",
    value: "right",
    icon: MdFormatAlignRight,
  },
  {
    label: "Justify",
    value: "justify",
    icon: MdFormatAlignJustify,
  },
];

type Props = {
  editor: Editor;
  disabled?: boolean;
};

export default function AlignButton({ editor, disabled }: Props) {
  const Icon =
    alignments.find(({ value }) => editor.isActive({ textAlign: value }))
      ?.icon || MdFormatAlignLeft;

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
          <Icon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col gap-y-1 p-1">
        {alignments.map(({ icon: Icon, label, value }) => (
          <Button
            key={value}
            size="sm"
            type="button"
            variant="ghost"
            className={cn(
              "flex items-center justify-start gap-x-2 rounded-sm px-2 py-1",
              editor.isActive({ textAlign: value }) && "bg-muted"
            )}
            onClick={() => editor.chain().focus().setTextAlign(value).run()}
          >
            <Icon className="size-4" />
            <span className="text-sm">{label}</span>
          </Button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
