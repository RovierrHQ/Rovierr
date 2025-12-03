'use client'

import { Button } from '@rov/ui/components/button'
import type { Editor } from '@tiptap/react'
import { Bold, Italic, List, ListOrdered, Redo, Undo } from 'lucide-react'

interface ToolbarProps {
  editor: Editor
}

export function Toolbar({ editor }: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 border-b bg-muted/50 p-2">
      <Button
        aria-label="Bold"
        disabled={!editor.can().chain().focus().toggleBold().run()}
        onClick={() => editor.chain().focus().toggleBold().run()}
        size="sm"
        type="button"
        variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        aria-label="Italic"
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        size="sm"
        type="button"
        variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
      >
        <Italic className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-6 w-px bg-border" />

      <Button
        aria-label="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        size="sm"
        type="button"
        variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        aria-label="Numbered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        size="sm"
        type="button"
        variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-6 w-px bg-border" />

      <Button
        aria-label="Undo"
        disabled={!editor.can().chain().focus().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        aria-label="Redo"
        disabled={!editor.can().chain().focus().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}
