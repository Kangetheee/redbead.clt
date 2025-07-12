import { type Editor } from "@tiptap/react";
import { FaChevronDown } from "react-icons/fa";

import { cn } from "@/lib/utils";

import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../dropdown-menu";

const fonts = [
  { label: "Arial", value: "Arial" },
  { label: "Courier New", value: "Courier New" },
  { label: "Georgia", value: "Georgia" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Verdana", value: "Verdana" },
];

type Props = {
  editor: Editor;
  disabled?: boolean;
};

export default function FontFamilyButton({ editor, disabled }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          type="button"
          disabled={disabled}
          variant="ghost"
          className="flex h-7 w-[120px] shrink-0 items-center justify-between overflow-hidden rounded-sm text-sm"
        >
          <span className="truncate">
            {editor.getAttributes("textStyle").fontFamily || "Arial"}
          </span>
          <FaChevronDown className="ml-2 size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col items-start gap-y-1 p-1">
        {fonts.map(({ label, value }) => (
          <Button
            key={value}
            onClick={() => editor.chain().focus().setFontFamily(value).run()}
            size="sm"
            type="button"
            variant="ghost"
            className={cn(
              "flex items-center gap-x-2 rounded-sm px-2 py-1",
              editor.getAttributes("textStyle").fontFamily === value &&
                "bg-background/80"
            )}
            style={{ fontFamily: value }}
          >
            <span className="text-sm">{label}</span>
          </Button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
