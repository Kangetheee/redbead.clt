import { useState } from "react";

import { type Editor } from "@tiptap/react";
import { MdImage } from "react-icons/md";

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

export default function ImageButton({ editor, disabled }: Props) {
  const [value, setValue] = useState(editor.getAttributes("link").href || "");

  function onChange(src: string) {
    editor.chain().focus().setImage({ src }).run();
    setValue("");
  }

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
          <MdImage className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Input
          placeholder="https://example.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button type="button" onClick={() => onChange(value)}>
          Apply
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
