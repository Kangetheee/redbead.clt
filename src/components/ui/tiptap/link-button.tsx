import { useState } from "react";

import { type Editor } from "@tiptap/react";
import { MdLink } from "react-icons/md";

import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Input } from "../input";

type Props = {
  editor: Editor;
  disabled?: boolean;
};

export default function LinkButton({ editor, disabled }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(editor.getAttributes("link").href || "");

  function onChange(href: string) {
    setIsOpen(false);
    // editor.chain().focus().setLink({ href }).run();
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setValue("");
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open) => {
        if (open) setValue(editor.getAttributes("link").href || "");
        setIsOpen(open);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          type="button"
          variant="ghost"
          disabled={disabled}
          className="flex h-7 min-w-7 shrink-0 flex-col items-center justify-center overflow-hidden rounded-sm text-sm"
        >
          <MdLink className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex items-center gap-x-2 p-2.5">
        <Input
          placeholder="https://example.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") onChange(value);
          }}
        />
        <Button type="button" onClick={() => onChange(value)}>
          Apply
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
