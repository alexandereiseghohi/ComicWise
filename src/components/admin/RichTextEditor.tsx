"use client";

import { Button } from "@/components/ui/button";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
} from "lucide-react";
import { cn } from "utils";

interface RichTextEditorProps {
  value: string;
  onChange(value: string): void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder: _placeholder = "Write something...",
  className,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <div className="flex flex-wrap gap-1 border-b bg-muted/50 p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("size-8 p-0", editor.isActive("bold") && "bg-muted")}
          disabled={disabled}
        >
          <Bold className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("size-8 p-0", editor.isActive("italic") && "bg-muted")}
          disabled={disabled}
        >
          <Italic className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn("size-8 p-0", editor.isActive("code") && "bg-muted")}
          disabled={disabled}
        >
          <Code className="size-4" />
        </Button>
        <div className="w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn("size-8 p-0", editor.isActive("heading", { level: 2 }) && "bg-muted")}
          disabled={disabled}
        >
          <Heading2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn("size-8 p-0", editor.isActive("heading", { level: 3 }) && "bg-muted")}
          disabled={disabled}
        >
          <Heading3 className="size-4" />
        </Button>
        <div className="w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("size-8 p-0", editor.isActive("bulletList") && "bg-muted")}
          disabled={disabled}
        >
          <List className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("size-8 p-0", editor.isActive("orderedList") && "bg-muted")}
          disabled={disabled}
        >
          <ListOrdered className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn("size-8 p-0", editor.isActive("blockquote") && "bg-muted")}
          disabled={disabled}
        >
          <Quote className="size-4" />
        </Button>
        <div className="w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo() || disabled}
          className="size-8 p-0"
        >
          <Undo className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo() || disabled}
          className="size-8 p-0"
        >
          <Redo className="size-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
