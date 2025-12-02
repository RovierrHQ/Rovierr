'use client'

import { Button } from '@rov/ui/components/button'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Smile
} from 'lucide-react'
import { useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  disabled?: boolean
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "What's on your mind?",
  disabled = false
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3]
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline'
        }
      })
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor: updatedEditor }) => {
      onChange(updatedEditor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[150px] px-3 py-2'
      }
    }
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addEmoji = () => {
    const emoji = window.prompt('Enter emoji (or paste):')
    if (emoji) {
      editor.chain().focus().insertContent(emoji).run()
    }
  }

  return (
    <div className="rounded-lg border border-border">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-border border-b bg-muted/50 p-2">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          size="sm"
          type="button"
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          size="sm"
          type="button"
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-6 w-px bg-border" />
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          size="sm"
          type="button"
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          size="sm"
          type="button"
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-6 w-px bg-border" />
        <Button onClick={addLink} size="sm" type="button" variant="ghost">
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button onClick={addEmoji} size="sm" type="button" variant="ghost">
          <Smile className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
