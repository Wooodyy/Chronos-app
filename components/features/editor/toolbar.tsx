"use client"

import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Link,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

export interface EditorToolbarProps {
  editor: any
  className?: string
}

export function EditorToolbar({ editor, className }: EditorToolbarProps) {
  if (!editor) {
    return null
  }

  const fontSizes = [
    { label: "Маленький", value: "12px" },
    { label: "Обычный", value: "16px" },
    { label: "Большой", value: "20px" },
    { label: "Очень большой", value: "24px" },
  ]

  const increaseFontSize = () => {
    const currentSize = editor.getAttributes("textStyle").fontSize
    let nextSize = "16px" // По умолчанию

    if (currentSize) {
      const sizeValue = Number.parseInt(currentSize)
      nextSize = `${Math.min(sizeValue + 2, 36)}px`
    }

    editor.chain().focus().setFontSize(nextSize).run()
  }

  const decreaseFontSize = () => {
    const currentSize = editor.getAttributes("textStyle").fontSize
    let nextSize = "16px" // По умолчанию

    if (currentSize) {
      const sizeValue = Number.parseInt(currentSize)
      nextSize = `${Math.max(sizeValue - 2, 10)}px`
    }

    editor.chain().focus().setFontSize(nextSize).run()
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1 rounded-md border bg-background p-1", className)}>
      <ToggleGroup type="multiple" size="sm" variant="outline">
        <ToggleGroupItem
          value="bold"
          aria-label="Жирный"
          data-state={editor.isActive("bold") ? "on" : "off"}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="italic"
          aria-label="Курсив"
          data-state={editor.isActive("italic") ? "on" : "off"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="underline"
          aria-label="Подчеркнутый"
          data-state={editor.isActive("underline") ? "on" : "off"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToggleGroup type="single" size="sm" variant="outline">
        <ToggleGroupItem
          value="h1"
          aria-label="Заголовок 1"
          data-state={editor.isActive("heading", { level: 1 }) ? "on" : "off"}
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }}
        >
          <Heading1 className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="h2"
          aria-label="Заголовок 2"
          data-state={editor.isActive("heading", { level: 2 }) ? "on" : "off"}
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }}
        >
          <Heading2 className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="h3"
          aria-label="Заголовок 3"
          data-state={editor.isActive("heading", { level: 3 }) ? "on" : "off"}
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }}
        >
          <Heading3 className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToggleGroup type="single" size="sm" variant="outline">
        <ToggleGroupItem
          value="left"
          aria-label="По левому краю"
          data-state={editor.isActive({ textAlign: "left" }) ? "on" : "off"}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="center"
          aria-label="По центру"
          data-state={editor.isActive({ textAlign: "center" }) ? "on" : "off"}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="right"
          aria-label="По правому краю"
          data-state={editor.isActive({ textAlign: "right" }) ? "on" : "off"}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToggleGroup type="multiple" size="sm" variant="outline">
        <ToggleGroupItem
          value="bulletList"
          aria-label="Маркированный список"
          data-state={editor.isActive("bulletList") ? "on" : "off"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="orderedList"
          aria-label="Нумерованный список"
          data-state={editor.isActive("orderedList") ? "on" : "off"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToggleGroup type="multiple" size="sm" variant="outline">
        <ToggleGroupItem
          value="blockquote"
          aria-label="Цитата"
          data-state={editor.isActive("blockquote") ? "on" : "off"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button variant="outline" size="sm" onClick={decreaseFontSize} title="Уменьшить размер шрифта">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={increaseFontSize} title="Увеличить размер шрифта">
        <ZoomIn className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const url = window.prompt("URL")
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        className={editor.isActive("link") ? "bg-muted" : ""}
      >
        <Link className="h-4 w-4" />
      </Button>
    </div>
  )
}

