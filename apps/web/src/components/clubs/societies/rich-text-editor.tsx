'use client'

import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
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
import { useEffect, useState } from 'react'

type RichTextEditorProps = {
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

  const [promptState, setPromptState] = useState<
    { type: 'link'; value: string } | { type: 'emoji'; value: string } | null
  >(null)

  if (!editor) {
    return null
  }

  const applyLink = () => {
    if (promptState?.type === 'link' && promptState.value.trim()) {
      editor.chain().focus().setLink({ href: promptState.value.trim() }).run()
    }
    setPromptState(null)
  }
  const applyEmoji = () => {
    if (promptState?.type === 'emoji' && promptState.value.trim()) {
      editor.chain().focus().insertContent(promptState.value.trim()).run()
    }
    setPromptState(null)
  }

  const addLink = () => {
    setPromptState({ type: 'link', value: '' })
  }
  const addEmoji = () => {
    setPromptState({ type: 'emoji', value: '' })
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

      <Dialog
        onOpenChange={(open) => !open && setPromptState(null)}
        open={!!promptState}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {promptState?.type === 'link' ? 'Enter URL' : 'Enter emoji'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="prompt-input">
              {promptState?.type === 'link' ? 'URL' : 'Emoji (or paste)'}
            </Label>
            <Input
              id="prompt-input"
              onChange={(e) =>
                setPromptState(
                  promptState ? { ...promptState, value: e.target.value } : null
                )
              }
              placeholder={
                promptState?.type === 'link' ? 'https://...' : 'e.g. 🙂'
              }
              value={promptState?.value ?? ''}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => setPromptState(null)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={promptState?.type === 'link' ? applyLink : applyEmoji}
              type="button"
            >
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
