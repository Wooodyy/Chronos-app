"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import TextStyle from "@tiptap/extension-text-style"
import FontSize from "@tiptap/extension-font-size"
import { EditorToolbar } from "./toolbar"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Начните писать...",
  className,
  minHeight = "200px",
}: RichTextEditorProps) {
  // Заменим неправильную конфигурацию заголовков
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      FontSize.configure({
        types: ["textStyle"],
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn("prose prose-sm dark:prose-invert focus:outline-none max-w-none", "min-h-[200px] p-4"),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className={cn("border rounded-md", className)}>
      <EditorToolbar editor={editor} className="border-b rounded-t-md" />
      <EditorContent editor={editor} className={cn("min-h-[200px]", minHeight && `min-h-[${minHeight}]`)} />
    </div>
  )
}

