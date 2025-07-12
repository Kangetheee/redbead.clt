import { type Level } from "@tiptap/extension-heading";
import { type Editor } from "@tiptap/react";
import { FaChevronDown } from "react-icons/fa";

import { cn } from "@/lib/utils";

import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../dropdown-menu";

type Heading =
  | { label: "Normal text"; level: 0; fontSize: "16px" }
  | { label: string; level: Level; fontSize: string };

const headings: Heading[] = [
  { label: "Normal text", level: 0, fontSize: "16px" },
  { label: "Heading 1", level: 1, fontSize: "32px" },
  { label: "Heading 2", level: 2, fontSize: "24px" },
  { label: "Heading 3", level: 3, fontSize: "20px" },
  { label: "Heading 4", level: 4, fontSize: "18px" },
  { label: "Heading 5", level: 5, fontSize: "16px" },
  { label: "Heading 6", level: 6, fontSize: "16px" },
];

type Props = {
  editor: Editor;
  disabled?: boolean;
};

export default function HeadingLevelButton({ editor, disabled }: Props) {
  function getCurrentHeading() {
    for (let level = 1; level < headings.length; level++) {
      if (editor.isActive(`heading`, { level })) {
        return headings[level].label;
      }
    }
    return "Normal text";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          type="button"
          disabled={disabled}
          variant="ghost"
          className="flex h-7 min-w-32 shrink-0 items-center justify-center overflow-hidden rounded-sm text-sm"
        >
          <span className="truncate">{getCurrentHeading()}</span>
          <FaChevronDown className="ml-2 size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex w-28 flex-col items-start gap-y-1 p-1">
        {headings.map(({ label, level, fontSize }) => (
          <Button
            key={level}
            onClick={() => {
              if (level === 0) editor.chain().focus().setParagraph().run();
              else editor.chain().focus().toggleHeading({ level }).run();
            }}
            size="sm"
            type="button"
            variant="ghost"
            className={cn(
              "flex items-center gap-x-2 rounded-sm px-2 py-1",
              (level === 0 && !editor.isActive("heading")) ||
                (editor.isActive("heading", { level: level }) &&
                  "bg-background/80")
            )}
            style={{ fontSize }}
          >
            <span className="text-sm">{label}</span>
          </Button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
