# Resume Rich Text Editor - Design Document

## Overview

The Resume Rich Text Editor feature adds formatted text editing capabilities to resume sections that require descriptions (Experience, Projects, Certifications, and Volunteer Work). This design leverages the existing Tiptap editor library and @react-pdf/renderer to provide a seamless editing experience with proper preview and PDF export support.

### Key Design Goals

1. **Reusability**: Create a single rich text editor component that can be used across multiple resume sections
2. **Type Safety**: Full TypeScript integration with TanStack Form
3. **Consistency**: Ensure formatting is preserved across edit → preview → PDF pipeline
4. **Simplicity**: Minimal configuration required to add rich text to any section
5. **User Experience**: Intuitive toolbar with common formatting options

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Resume Section Form                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │         RichTextEditor Component                    │    │
│  │  ┌──────────────┐  ┌──────────────────────────┐   │    │
│  │  │   Toolbar    │  │   Tiptap EditorContent   │   │    │
│  │  └──────────────┘  └──────────────────────────┘   │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│                    HTML Content                              │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
      ┌───────────────┐         ┌──────────────┐
      │    Preview    │         │  PDF Export  │
      │   (HTML)      │         │  (@react-pdf)│
      └───────────────┘         └──────────────┘
```

### Component Structure

```
packages/ui/src/components/
├── form/
│   ├── fields/
│   │   ├── rich-text.tsx          # New: Rich text editor field
│   │   └── ...
│   └── index.tsx                   # Updated: Export RichText field
└── rich-text-editor/
    ├── index.tsx                   # Main editor component
    ├── toolbar.tsx                 # Formatting toolbar
    ├── extensions.ts               # Tiptap extensions config
    └── utils.ts                    # HTML sanitization utilities

apps/web/src/components/resume/
├── sections/
│   ├── experience.tsx              # Updated: Use RichText field
│   ├── projects.tsx                # Updated: Use RichText field
│   ├── certifications.tsx          # Updated: Use RichText field
│   └── volunteer.tsx               # Updated: Use RichText field
├── templates/
│   └── default.tsx                 # Updated: Render HTML content
└── lib/
    ├── html-to-pdf.tsx             # New: HTML to PDF converter
    └── pdf-export.ts               # Updated: Use HTML converter
```

## Components and Interfaces

### 1. RichTextEditor Component

**Purpose**: Core rich text editing component using Tiptap

**Location**: `packages/ui/src/components/rich-text-editor/index.tsx`

```typescript
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
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
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const sanitized = sanitizeHtml(html)
      onChange(sanitized)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-3'
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
    <div className={cn('border rounded-md', className)}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      {maxLength && (
        <div className={cn(
          'px-3 py-2 text-xs text-muted-foreground border-t',
          isOverLimit && 'text-destructive'
        )}>
          {characterCount} / {maxLength} characters
        </div>
      )}
    </div>
  )
}
```

### 2. Toolbar Component

**Purpose**: Formatting controls for the editor

**Location**: `packages/ui/src/components/rich-text-editor/toolbar.tsx`

```typescript
import type { Editor } from '@tiptap/react'
import { Button } from '@rov/ui/components/button'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo
} from 'lucide-react'

interface ToolbarProps {
  editor: Editor
}

export function Toolbar({ editor }: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-2 border-b">
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
        size="sm"
        type="button"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
        size="sm"
        type="button"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
        size="sm"
        type="button"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
        size="sm"
        type="button"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        variant="ghost"
        size="sm"
        type="button"
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        variant="ghost"
        size="sm"
        type="button"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

### 3. HTML Sanitization Utility

**Purpose**: Sanitize HTML to prevent XSS and ensure only allowed tags

**Location**: `packages/ui/src/components/rich-text-editor/utils.ts`

```typescript
import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'b', 'i', 'u',
  'ul', 'ol', 'li', 'a'
]

const ALLOWED_ATTR = ['href', 'target', 'rel']

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false
  })
}

export function stripHtml(html: string): string {
  const temp = document.createElement('div')
  temp.innerHTML = html
  return temp.textContent || temp.innerText || ''
}

export function getTextLength(html: string): number {
  return stripHtml(html).length
}
```

### 4. TanStack Form Field Component

**Purpose**: Integrate RichTextEditor with TanStack Form

**Location**: `packages/ui/src/components/form/fields/rich-text.tsx`

```typescript
'use client'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@rov/ui/components/field'
import { RichTextEditor } from '@rov/ui/components/rich-text-editor'
import { useFieldContext } from '../context'

type Props = {
  label?: string
  description?: string
  placeholder?: string
  maxLength?: number
}

function RichText({ label, placeholder, description, maxLength }: Props) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <RichTextEditor
        value={field.state.value || ''}
        onChange={(html) => field.handleChange(html)}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default RichText
```

### 5. HTML to PDF Converter

**Purpose**: Convert HTML content to @react-pdf components

**Location**: `apps/web/src/components/resume/lib/html-to-pdf.tsx`

```typescript
import { Text, View } from '@react-pdf/renderer'
import { parse, type HTMLElement } from 'node-html-parser'

interface HtmlToPdfProps {
  html: string
  style?: any
}

export function HtmlToPdf({ html, style }: HtmlToPdfProps) {
  const root = parse(html)
  return <>{renderNode(root, style)}</>
}

function renderNode(node: HTMLElement | any, style?: any): React.ReactNode {
  if (node.nodeType === 3) {
    // Text node
    return node.textContent
  }

  if (!node.tagName) {
    return node.childNodes?.map((child: any, i: number) => (
      <React.Fragment key={i}>{renderNode(child, style)}</React.Fragment>
    ))
  }

  const children = node.childNodes?.map((child: any, i: number) => (
    <React.Fragment key={i}>{renderNode(child, style)}</React.Fragment>
  ))

  switch (node.tagName.toLowerCase()) {
    case 'p':
      return (
        <Text style={{ marginBottom: 4, ...style }}>
          {children}
        </Text>
      )

    case 'strong':
    case 'b':
      return (
        <Text style={{ fontWeight: 'bold', ...style }}>
          {children}
        </Text>
      )

    case 'em':
    case 'i':
      return (
        <Text style={{ fontStyle: 'italic', ...style }}>
          {children}
        </Text>
      )

    case 'ul':
      return (
        <View style={{ marginLeft: 12, marginBottom: 4 }}>
          {children}
        </View>
      )

    case 'ol':
      return (
        <View style={{ marginLeft: 12, marginBottom: 4 }}>
          {children}
        </View>
      )

    case 'li':
      return (
        <View style={{ flexDirection: 'row', marginBottom: 2 }}>
          <Text style={{ marginRight: 4, ...style }}>•</Text>
          <Text style={style}>{children}</Text>
        </View>
      )

    case 'br':
      return <Text>{'\n'}</Text>

    default:
      return children
  }
}
```

### 6. Updated Section Components

**Example**: Experience section with rich text

**Location**: `apps/web/src/components/resume/sections/experience.tsx`

```typescript
// ... existing imports
import { z } from 'zod'

// Updated schema with HTML description
export const experienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().max(2000, 'Description too long').optional()
})

export function ExperienceSection({ data, onSave }: ExperienceSectionProps) {
  // ... existing form setup

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
      {/* ... existing fields */}

      <form.AppField
        name="description"
        children={(field) => (
          <field.RichText
            label="Description"
            placeholder="Describe your responsibilities and achievements..."
            maxLength={2000}
            description="Use bullet points to highlight key accomplishments"
          />
        )}
      />

      {/* ... rest of form */}
    </form>
  )
}
```

## Data Models

### Database Schema Updates

No database schema changes required. The existing `description` fields in resume sections already store text and can store HTML strings.

### TypeScript Types

```typescript
// Experience with HTML description
interface Experience {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate?: string
  current: boolean
  description: string // HTML content
}

// Project with HTML description
interface Project {
  id: string
  name: string
  description: string // HTML content
  technologies: string[]
  startDate?: string
  endDate?: string
  url?: string
  order: number
}

// Certification with HTML description
interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expirationDate?: string
  description?: string // HTML content
}

// Volunteer with HTML description
interface Volunteer {
  id: string
  organization: string
  role: string
  startDate: string
  endDate?: string
  current: boolean
  description: string // HTML content
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing the prework analysis, I've identified the following consolidations:

- Properties 2.2, 3.2, 4.2, 5.2 (saving HTML to database) can be combined into a single property about HTML persistence across all sections
- Properties 2.3, 3.3, 4.3, 5.3 (preview rendering) can be combined into a single property about preview rendering
- Properties 2.4, 3.4, 4.4, 5.4 (PDF export) can be combined into a single property about PDF formatting preservation
- Properties 2.5 and 5.5 (maintaining formatting across entries) can be combined into a single invariant property
- Properties 8.1, 8.2, 8.3 (HTML sanitization) can be combined into a single property about XSS prevention

All edge cases (lists, empty content, specific formatting) will be handled by property test generators rather than separate properties.

### Correctness Properties

Property 1: HTML content round-trip
*For any* valid HTML content, setting it in the editor and then retrieving it should produce equivalent sanitized HTML
**Validates: Requirements 1.3, 1.5**

Property 2: HTML persistence across sections
*For any* resume section (experience, project, certification, volunteer) and any formatted HTML content, saving the content to the database and then retrieving it should preserve the HTML
**Validates: Requirements 2.2, 3.2, 4.2, 5.2**

Property 3: Preview rendering consistency
*For any* formatted HTML content, rendering it in the preview should display all formatting (bold, italic, lists) correctly with appropriate styling
**Validates: Requirements 2.3, 3.3, 4.3, 5.3, 9.2**

Property 4: PDF formatting preservation
*For any* formatted HTML content, exporting it to PDF should preserve all formatting including bold, italic, bullet lists, and numbered lists
**Validates: Requirements 2.4, 3.4, 4.4, 5.4**

Property 5: Entry formatting invariant
*For any* set of resume entries with formatted descriptions, switching between entries should maintain each entry's formatting unchanged
**Validates: Requirements 2.5, 5.5**

Property 6: XSS prevention through sanitization
*For any* HTML input including malicious scripts or disallowed tags, the sanitization should remove all dangerous content while preserving safe formatting
**Validates: Requirements 8.1, 8.2, 8.3**

Property 7: Form integration completeness
*For any* form submission with rich text content, the submitted data should include the HTML content and pass validation
**Validates: Requirements 10.2, 10.3**

Property 8: Multi-section rendering consistency
*For any* resume with multiple sections containing rich text, all sections should render with consistent styling and formatting rules
**Validates: Requirements 9.5**

## Testing Strategy

### Property-Based Testing

Use `fast-check` for property-based testing:

```typescript
import fc from 'fast-check'
import { sanitizeHtml } from './utils'
import { HtmlToPdf } from './html-to-pdf'

// Property 1: HTML round-trip
fc.assert(
  fc.property(
    fc.htmlElements(), // Generate random HTML
    (html) => {
      const sanitized = sanitizeHtml(html)
      const reSanitized = sanitizeHtml(sanitized)
      expect(sanitized).toBe(reSanitized) // Idempotent
    }
  ),
  { numRuns: 100 }
)

// Property 6: XSS prevention
fc.assert(
  fc.property(
    fc.string(), // Generate random strings including malicious content
    (input) => {
      const sanitized = sanitizeHtml(input)
      expect(sanitized).not.toContain('<script')
      expect(sanitized).not.toContain('javascript:')
      expect(sanitized).not.toContain('onerror=')
    }
  ),
  { numRuns: 100 }
)
```

### Unit Testing

Test individual components:

```typescript
describe('RichTextEditor', () => {
  it('should render with initial content', () => {
    const html = '<p><strong>Bold text</strong></p>'
    render(<RichTextEditor value={html} onChange={jest.fn()} />)
    expect(screen.getByText('Bold text')).toBeInTheDocument()
  })

  it('should call onChange with sanitized HTML', () => {
    const onChange = jest.fn()
    render(<RichTextEditor value="" onChange={onChange} />)
    // Simulate typing
    // Verify onChange called with sanitized HTML
  })
})
```

### Integration Testing

Test form integration:

```typescript
describe('Experience Form with Rich Text', () => {
  it('should save formatted description', async () => {
    render(<ExperienceSection data={null} onSave={mockSave} />)

    // Fill in form fields
    // Format text in rich text editor
    // Submit form
    // Verify onSave called with HTML content
  })
})
```

## Error Handling

### Validation Errors

```typescript
// In section schema
description: z.string()
  .max(2000, 'Description must be less than 2000 characters')
  .refine(
    (html) => getTextLength(html) <= 2000,
    'Description text content exceeds 2000 characters'
  )
  .optional()
```

### Sanitization Errors

```typescript
// Sanitization is always safe - never throws
// Invalid HTML is stripped, not rejected
const sanitized = sanitizeHtml(userInput) // Always returns safe HTML
```

### PDF Conversion Errors

```typescript
try {
  const pdfContent = <HtmlToPdf html={description} />
  // Render PDF
} catch (error) {
  console.error('PDF conversion failed:', error)
  // Fallback to plain text
  const plainText = stripHtml(description)
  return <Text>{plainText}</Text>
}
```

## Performance Considerations

### Debounced Updates

```typescript
// In RichTextEditor
const debouncedOnChange = useDebouncedCallback(
  (html: string) => onChange(html),
  300 // 300ms debounce
)

onUpdate: ({ editor }) => {
  const html = editor.getHTML()
  const sanitized = sanitizeHtml(html)
  debouncedOnChange(sanitized)
}
```

### Lazy Loading

```typescript
// Lazy load Tiptap editor
const RichTextEditor = lazy(() => import('./rich-text-editor'))

// In form
<Suspense fallback={<Skeleton className="h-32" />}>
  <RichTextEditor {...props} />
</Suspense>
```

## Migration Strategy

### Existing Data

Existing plain text descriptions will work as-is:
- Plain text is valid HTML
- Will be wrapped in `<p>` tags by Tiptap
- No data migration required

### Gradual Rollout

1. Deploy rich text editor to Experience section first
2. Monitor for issues
3. Roll out to Projects, Certifications, Volunteer
4. Gather user feedback and iterate

## Dependencies

### New Dependencies

```json
{
  "dependencies": {
    "isomorphic-dompurify": "^2.0.0",
    "node-html-parser": "^6.1.0"
  }
}
```

### Existing Dependencies (Already Installed)

- `@tiptap/react`: ^3.11.1
- `@tiptap/starter-kit`: ^3.11.1
- `@tiptap/extension-link`: ^3.11.1
- `@tiptap/extension-placeholder`: ^3.11.1
- `@react-pdf/renderer`: ^4.3.1

## Future Enhancements

### Phase 2 Features

- Link insertion and editing
- Text color and highlighting
- Heading styles (H1, H2, H3)
- Code blocks for technical resumes
- Table support
- Image insertion (for logos, etc.)

### Advanced Features

- Markdown import/export
- AI-powered content suggestions
- Grammar and spell checking
- Template-specific formatting presets
