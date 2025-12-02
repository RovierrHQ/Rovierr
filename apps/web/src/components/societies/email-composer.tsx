'use client'

import { Button } from '@rov/ui/components/button'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Eye,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Send
} from 'lucide-react'
import { useState } from 'react'

interface EmailComposerProps {
  organizationId: string
  organizationName: string
  memberCount: number
  onSend: (data: {
    subject: string
    bodyHtml: string
    bodyText: string
  }) => Promise<void>
  onPreview: (data: { subject: string; bodyHtml: string }) => void
  isSending?: boolean
}

const AVAILABLE_VARIABLES = [
  { key: 'user.name', label: 'Member Name', example: 'John Doe' },
  { key: 'user.email', label: 'Member Email', example: 'john@university.edu' },
  {
    key: 'user.username',
    label: 'Username',
    example: 'johndoe'
  },
  {
    key: 'organization.name',
    label: 'Society Name',
    example: 'Computer Science Club'
  }
]

export function EmailComposer({
  organizationName,
  memberCount,
  onSend,
  onPreview,
  isSending = false
}: EmailComposerProps) {
  const [subject, setSubject] = useState('')
  const [errors, setErrors] = useState<{
    subject?: string
    body?: string
  }>({})

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline'
        }
      }),
      Placeholder.configure({
        placeholder: 'Write your email message here...'
      })
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none border rounded-md'
      }
    }
  })

  const insertVariable = (variable: string) => {
    if (editor) {
      editor.chain().focus().insertContent(`{{${variable}}}`).run()
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { subject?: string; body?: string } = {}

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required'
    } else if (subject.length > 200) {
      newErrors.subject = 'Subject must be 200 characters or less'
    }

    const bodyText = editor?.getText() || ''
    if (!bodyText.trim()) {
      newErrors.body = 'Email body is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSend = async () => {
    if (!validateForm()) return

    const bodyHtml = editor?.getHTML() || ''
    const bodyText = editor?.getText() || ''

    await onSend({
      subject,
      bodyHtml,
      bodyText
    })
  }

  const handlePreview = () => {
    const bodyHtml = editor?.getHTML() || ''
    onPreview({ subject, bodyHtml })
  }

  const canSend = memberCount > 0 && !isSending

  return (
    <div className="space-y-6">
      {/* Recipient Count */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-muted-foreground text-sm">
          This email will be sent to{' '}
          <span className="font-semibold text-foreground">{memberCount}</span>{' '}
          {memberCount === 1 ? 'member' : 'members'} of {organizationName}
        </p>
      </div>

      {/* Subject Line */}
      <div className="space-y-2">
        <Label htmlFor="subject">
          Subject <span className="text-destructive">*</span>
        </Label>
        <Input
          className={errors.subject ? 'border-destructive' : ''}
          id="subject"
          maxLength={200}
          onChange={(e) => {
            setSubject(e.target.value)
            if (errors.subject) {
              setErrors({ ...errors, subject: undefined })
            }
          }}
          placeholder="Enter email subject"
          value={subject}
        />
        <div className="flex justify-between text-muted-foreground text-xs">
          {errors.subject ? (
            <span className="text-destructive">{errors.subject}</span>
          ) : (
            <span />
          )}
          <span>{subject.length}/200</span>
        </div>
      </div>

      {/* Variable Picker */}
      <div className="space-y-2">
        <Label>Insert Variable</Label>
        <Select onValueChange={insertVariable}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a variable to insert" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_VARIABLES.map((variable) => (
              <SelectItem key={variable.key} value={variable.key}>
                <div className="flex flex-col">
                  <span className="font-medium">{variable.label}</span>
                  <span className="text-muted-foreground text-xs">
                    Example: {variable.example}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Editor Toolbar */}
      {editor && (
        <div className="flex flex-wrap gap-2 rounded-md border bg-muted/50 p-2">
          <Button
            className={editor.isActive('bold') ? 'bg-muted' : ''}
            onClick={() => editor.chain().focus().toggleBold().run()}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            className={editor.isActive('italic') ? 'bg-muted' : ''}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            className={editor.isActive('bulletList') ? 'bg-muted' : ''}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            size="sm"
            type="button"
            variant="ghost"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            className={editor.isActive('orderedList') ? 'bg-muted' : ''}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            size="sm"
            type="button"
            variant="ghost"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            className={editor.isActive('link') ? 'bg-muted' : ''}
            onClick={() => {
              const url = window.prompt('Enter URL')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Editor */}
      <div className="space-y-2">
        <Label>
          Message <span className="text-destructive">*</span>
        </Label>
        <EditorContent editor={editor} />
        {errors.body && (
          <p className="text-destructive text-xs">{errors.body}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          disabled={!(subject.trim() && editor?.getText().trim())}
          onClick={handlePreview}
          type="button"
          variant="outline"
        >
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <Button disabled={!canSend} onClick={handleSend} type="button">
          <Send className="mr-2 h-4 w-4" />
          {isSending ? 'Sending...' : `Send to ${memberCount} members`}
        </Button>
      </div>

      {memberCount === 0 && (
        <p className="text-destructive text-sm">
          Cannot send email: No active members in this society
        </p>
      )}
    </div>
  )
}
