"use client";

import FontFamily from "@tiptap/extension-font-family";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageResize from "tiptap-extension-resize-image";

import { cn } from "@/lib/utils";

import Toolbar from "./toolbar";

type Props = {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export default function TiptapEditor({
  value,
  onChange,
  disabled,
  placeholder,
}: Props) {
  const editor = useEditor({
    editorProps: {
      attributes: {
        class: cn(
          "min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex-1",
          disabled && "opacity-70 "
          // "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none pro"
        ),
      },
    },
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      ImageResize,
      TextStyle,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      FontFamily.configure({
        types: ["textStyle"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https"],
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editable: !disabled,
  });

  if (!editor) return null;

  return (
    <div className="flex flex-1 flex-col gap-1">
      <Toolbar editor={editor} disabled={disabled} />
      <div className="">
        <EditorContent editor={editor} disabled={disabled} />
      </div>
    </div>
  );
}
