import { type Editor } from "@tiptap/react";
import { IconType } from "react-icons/lib";
import { LuRemoveFormatting } from "react-icons/lu";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdMessage,
  MdOutlineChecklist,
  MdOutlineRedo,
  MdOutlineUndo,
  MdPrint,
  MdSpellcheck,
} from "react-icons/md";

import { Separator } from "../separator";
import AlignButton from "./align-button";
import FontFamilyButton from "./font-family-button";
import HeadingLevelButton from "./heading-level-button";
import ImageButton from "./image-button";
import LinkButton from "./link-button";
import ListButton from "./list-button";
import ToolbarButton from "./toolbar-button";

function ToolBarSeparator() {
  return (
    <Separator
      orientation="vertical"
      className="h-6 bg-secondary-foreground/20"
    />
  );
}

type ToolbarSection = {
  label: string;
  icon: IconType;
  onClick: () => void;
  isActive?: boolean;
};

type Props = {
  editor: Editor;
  disabled?: boolean;
};

export default function Toolbar({ editor, disabled }: Props) {
  const sections: ToolbarSection[][] = [
    [
      {
        label: "Undo",
        icon: MdOutlineUndo,
        onClick: () => editor.chain().focus().undo().run(),
      },
      {
        label: "Redo",
        icon: MdOutlineRedo,
        onClick: () => editor.chain().focus().redo().run(),
      },
      {
        label: "Print",
        icon: MdPrint,
        onClick: () => window.print(),
      },
      {
        label: "Spell Check",
        icon: MdSpellcheck,
        onClick: () => {
          const current = editor.view.dom.getAttribute("spellcheck");
          editor.view.dom.setAttribute(
            "spellcheck",
            current === "false" ? "true" : "false"
          );
        },
      },
    ],
    [
      {
        label: "Bold",
        icon: MdFormatBold,
        isActive: editor.isActive("bold"),
        onClick: () => editor.chain().focus().toggleBold().run(),
      },
      {
        label: "Italic",
        icon: MdFormatItalic,
        isActive: editor.isActive("italic"),
        onClick: () => editor.chain().focus().toggleItalic().run(),
      },
      {
        label: "Underline",
        icon: MdFormatUnderlined,
        isActive: editor.isActive("underline"),
        onClick: () => editor.chain().focus().toggleUnderline().run(),
      },
    ],
    [
      {
        label: "Comment",
        icon: MdMessage,
        isActive: false,
        onClick: () => console.log("Comment"),
      },
      {
        label: "List Todo",
        icon: MdOutlineChecklist,
        isActive: editor.isActive("taskList"),
        onClick: () => editor.chain().focus().toggleTaskList().run(),
      },
      {
        label: "Remove Formatting",
        icon: LuRemoveFormatting,
        onClick: () => editor.chain().focus().unsetAllMarks().run(),
      },
    ],
  ];

  return (
    <div className="flex min-h-[40px] w-full items-center gap-x-0.5 overflow-x-auto rounded-md border border-input bg-accent/70 px-2.5 py-1">
      {sections[0].map((section) => (
        <ToolbarButton key={section.label} {...section} disabled={disabled} />
      ))}

      <ToolBarSeparator />

      <FontFamilyButton editor={editor} disabled={disabled} />

      <ToolBarSeparator />

      <HeadingLevelButton editor={editor} disabled={disabled} />

      <ToolBarSeparator />

      {/* TODO: Font size */}

      {sections[1].map((section) => (
        <ToolbarButton key={section.label} {...section} disabled={disabled} />
      ))}

      {/* TODO: Text color */}

      {/* TODO: Highlight color */}

      <ToolBarSeparator />

      <LinkButton editor={editor} disabled={disabled} />

      <ImageButton editor={editor} disabled={disabled} />
      <AlignButton editor={editor} disabled={disabled} />
      <ListButton editor={editor} disabled={disabled} />

      {/* TODO: Line height */}

      <ToolBarSeparator />

      {sections[2].map((section) => (
        <ToolbarButton key={section.label} {...section} disabled={disabled} />
      ))}
    </div>
  );
}
