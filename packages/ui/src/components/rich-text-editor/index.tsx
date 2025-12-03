'use client'

import { cn } from '@rov/ui/lib/utils'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { Toolbar } from './toolbar'
import { sanitizeHtml } from './utils'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  maxLength?: number
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter description...',
  maxLength,
  className
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content: value,
    onUpdate: ({ editor: edtr }) => {
      const html = edtr.getHTML()
      const sanitized = sanitizeHtml(html)
      onChange(sanitized)
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-3 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:ml-2'
      }
    }
  })

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  const characterCount = editor.storage.characterCount?.characters() || 0
  const isOverLimit = maxLength && characterCount > maxLength

  return (
    <div className={cn('rounded-md border bg-background', className)}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      {maxLength && (
        <div
          className={cn(
            'border-t px-3 py-2 text-muted-foreground text-xs',
            isOverLimit && 'text-destructive'
          )}
        >
          {characterCount} / {maxLength} characters
        </div>
      )}
    </div>
  )
}
