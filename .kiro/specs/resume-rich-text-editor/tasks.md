# Implementation Plan - Resume Rich Text Editor

## Overview

This plan adds rich text editing capabilities to resume sections (Experience, Projects, Certifications, Volunteer) using Tiptap editor and @react-pdf/renderer. The implementation creates a reusable RichTextEditor component that integrates with TanStack Form and ensures formatting is preserved in preview and PDF export.

**Key Deliverables**:
- Reusable RichTextEditor component in UI package
- TanStack Form field integration
- HTML to PDF converter for resume export
- Updated resume sections with rich text support

---

## Phase 1: Core Rich Text Editor Component

- [x] 1. Create rich text editor infrastructure
  - Build RichTextEditor component using Tiptap
  - Create formatting toolbar with common controls
  - Implement HTML sanitization utilities
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 8.1, 8.2, 8.3_

- [x] 1.1 Set up Tiptap editor component
  - Create `packages/ui/src/components/rich-text-editor/index.tsx`
  - Configure Tiptap with StarterKit, Link, and Placeholder extensions
  - Implement value/onChange props for controlled component
  - Add character count display with max length support
  - Handle editor initialization and content updates
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 1.2 Create formatting toolbar
  - Create `packages/ui/src/components/rich-text-editor/toolbar.tsx`
  - Add buttons for bold, italic, bullet list, numbered list
  - Add undo/redo buttons
  - Implement active state highlighting for current formatting
  - Disable buttons when actions are not available
  - _Requirements: 1.2, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 1.3 Implement HTML sanitization
  - Create `packages/ui/src/components/rich-text-editor/utils.ts`
  - Install and configure isomorphic-dompurify
  - Define allowed HTML tags (p, br, strong, em, b, i, u, ul, ol, li, a)
  - Define allowed attributes (href, target, rel)
  - Implement sanitizeHtml function
  - Implement stripHtml and getTextLength helper functions
  - _Requirements: 8.1, 8.2, 8.3_

- [ ]* 1.4 Write property test for HTML round-trip
  - **Property 1: HTML content round-trip**
  - **Validates: Requirements 1.3, 1.5**
  - Test that setting HTML in editor and retrieving it produces equivalent sanitized HTML
  - Use fast-check to generate random HTML content
  - Verify sanitization is idempotent
  - _Requirements: 1.3, 1.5_

- [ ]* 1.5 Write property test for XSS prevention
  - **Property 6: XSS prevention through sanitization**
  - **Validates: Requirements 8.1, 8.2, 8.3**
  - Test that malicious HTML is sanitized
  - Generate strings with script tags, javascript:, onerror, etc.
  - Verify all dangerous content is removed
  - _Requirements: 8.1, 8.2, 8.3_

---

## Phase 2: TanStack Form Integration

- [x] 2. Create form field component
  - Build RichText field component for TanStack Form
  - Integrate with form validation
  - Add error display and field states
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 2.1 Create RichText form field
  - Create `packages/ui/src/components/form/fields/rich-text.tsx`
  - Use useFieldContext hook to access field state
  - Wrap RichTextEditor with Field, FieldLabel, FieldDescription, FieldError
  - Handle field.handleChange to update form state
  - Display validation errors when field is touched and invalid
  - _Requirements: 10.1, 10.4_

- [x] 2.2 Export RichText field
  - Update `packages/ui/src/components/form/index.tsx`
  - Import RichText component
  - Add RichText to fieldComponents in createFormHook
  - Export for use in forms
  - _Requirements: 10.1_

- [ ]* 2.3 Write property test for form integration
  - **Property 7: Form integration completeness**
  - **Validates: Requirements 10.2, 10.3**
  - Test that form submission includes HTML content
  - Test that validation works correctly
  - Generate random form data with rich text
  - _Requirements: 10.2, 10.3_

---

## Phase 3: HTML to PDF Conversion

- [x] 3. Implement PDF rendering for HTML content
  - Create HTML to PDF converter component
  - Support all formatting types (bold, italic, lists)
  - Handle nested structures
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 3.1 Create HTML parser and converter
  - Create `apps/web/src/components/resume/lib/html-to-pdf.tsx`
  - Install node-html-parser dependency
  - Implement HtmlToPdf component that parses HTML
  - Convert HTML nodes to @react-pdf components (Text, View)
  - Handle p, strong, em, b, i, ul, ol, li, br tags
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 3.2 Add PDF styling
  - Apply appropriate styles to PDF components
  - Bold text: fontWeight: 'bold'
  - Italic text: fontStyle: 'italic'
  - Lists: proper indentation and bullet markers
  - Paragraphs: appropriate spacing
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 3.3 Write property test for PDF formatting preservation
  - **Property 4: PDF formatting preservation**
  - **Validates: Requirements 2.4, 3.4, 4.4, 5.4**
  - Test that HTML content exported to PDF preserves formatting
  - Generate random formatted HTML
  - Verify PDF contains all formatting elements
  - _Requirements: 2.4, 3.4, 4.4, 5.4_

---

## Phase 4: Update Resume Sections

- [ ] 4. Add rich text to Experience section
  - Update Experience section to use RichText field
  - Update schema to validate HTML content
  - Test form submission and preview
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4.1 Update Experience section component
  - Edit `apps/web/src/components/resume/sections/experience.tsx`
  - Update experienceSchema to include description as string with max length
  - Replace description Textarea field with RichText field
  - Set maxLength to 2000 characters
  - Add placeholder and description text
  - _Requirements: 2.1, 2.2_

- [x] 4.2 Update Experience preview rendering
  - Edit `apps/web/src/components/resume/templates/default.tsx`
  - Import HtmlToPdf component
  - Replace plain text description with HtmlToPdf component
  - Pass experience.description as html prop
  - _Requirements: 2.3_

- [ ]* 4.3 Write property test for HTML persistence
  - **Property 2: HTML persistence across sections**
  - **Validates: Requirements 2.2, 3.2, 4.2, 5.2**
  - Test that saving HTML to database and retrieving preserves content
  - Generate random HTML for different sections
  - Verify round-trip through database
  - _Requirements: 2.2, 3.2, 4.2, 5.2_

- [ ]* 4.4 Write property test for entry formatting invariant
  - **Property 5: Entry formatting invariant**
  - **Validates: Requirements 2.5, 5.5**
  - Test that switching between entries maintains formatting
  - Create multiple entries with different formatting
  - Verify each entry's formatting remains unchanged
  - _Requirements: 2.5, 5.5_

---

## Phase 5: Update Projects Section

- [x] 5. Add rich text to Projects section
  - Update Projects section to use RichText field
  - Update schema and preview rendering
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5.1 Update Projects section component
  - Edit `apps/web/src/components/resume/sections/projects.tsx`
  - Update projectSchema to include description as string with max length
  - Replace description Textarea field with RichText field
  - Set maxLength to 2000 characters
  - Add appropriate placeholder text
  - _Requirements: 3.1, 3.2_

- [x] 5.2 Update Projects preview rendering
  - Edit `apps/web/src/components/resume/templates/default.tsx`
  - Replace plain text project description with HtmlToPdf component
  - Pass project.description as html prop
  - _Requirements: 3.3_

---

## Phase 6: Update Certifications Section

- [x] 6. Add rich text to Certifications section
  - Update Certifications section to use RichText field
  - Handle optional description field
  - Update preview rendering
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6.1 Update Certifications section component
  - Edit `apps/web/src/components/resume/sections/certifications.tsx`
  - Update certificationSchema to include optional description field
  - Add RichText field for description
  - Set maxLength to 1000 characters
  - Make field optional with appropriate placeholder
  - _Requirements: 4.1, 4.2, 4.5_

- [x] 6.2 Update Certifications preview rendering
  - Edit `apps/web/src/components/resume/templates/default.tsx`
  - Add conditional rendering for certification description
  - Use HtmlToPdf component when description exists
  - Handle null/empty descriptions gracefully
  - _Requirements: 4.3, 4.5_

---

## Phase 7: Update Volunteer Section

- [x] 7. Add rich text to Volunteer section
  - Update Volunteer section to use RichText field
  - Update schema and preview rendering
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7.1 Update Volunteer section component
  - Edit `apps/web/src/components/resume/sections/volunteer.tsx`
  - Update volunteerSchema to include description as string with max length
  - Replace description Textarea field with RichText field
  - Set maxLength to 2000 characters
  - Add appropriate placeholder text
  - _Requirements: 5.1, 5.2_

- [x] 7.2 Update Volunteer preview rendering
  - Edit `apps/web/src/components/resume/templates/default.tsx`
  - Replace plain text volunteer description with HtmlToPdf component
  - Pass volunteer.description as html prop
  - _Requirements: 5.3_

---

## Phase 8: Preview and PDF Integration

- [ ] 8. Ensure consistent rendering across preview and PDF
  - Test preview rendering with formatted content
  - Test PDF export with formatted content
  - Verify consistency across all sections
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 8.1 Test preview rendering
  - Create test resumes with formatted content in all sections
  - Verify bold, italic, lists render correctly in preview
  - Check that styling is consistent across sections
  - Test with nested lists and mixed formatting
  - _Requirements: 9.2, 9.3, 9.4_

- [ ]* 8.2 Write property test for preview rendering consistency
  - **Property 3: Preview rendering consistency**
  - **Validates: Requirements 2.3, 3.3, 4.3, 5.3, 9.2**
  - Test that HTML renders correctly in preview with styling
  - Generate random formatted HTML
  - Verify all formatting is displayed
  - _Requirements: 2.3, 3.3, 4.3, 5.3, 9.2_

- [ ]* 8.3 Write property test for multi-section consistency
  - **Property 8: Multi-section rendering consistency**
  - **Validates: Requirements 9.5**
  - Test that multiple sections render with consistent styling
  - Create resume with formatted content in all sections
  - Verify consistent rendering rules
  - _Requirements: 9.5_

- [ ] 8.4 Test PDF export
  - Export resumes with formatted content to PDF
  - Verify all formatting is preserved in PDF
  - Check that lists, bold, italic appear correctly
  - Test with various content lengths and structures
  - _Requirements: 2.4, 3.4, 4.4, 5.4_

---

## Phase 9: Styling and Polish

- [ ] 9. Add styling and improve user experience
  - Style editor to match resume builder design
  - Add loading states and transitions
  - Improve toolbar accessibility
  - _Requirements: 7.1, 8.4, 9.1_

- [ ] 9.1 Style RichTextEditor component
  - Add Tailwind classes for consistent styling
  - Match border, padding, and spacing with other form fields
  - Style toolbar with proper button states
  - Add focus states and transitions
  - Ensure dark mode compatibility
  - _Requirements: 7.1_

- [ ] 9.2 Add character count styling
  - Style character count display
  - Show warning color when approaching limit
  - Show error color when over limit
  - Position counter appropriately
  - _Requirements: 8.4_

- [ ] 9.3 Improve accessibility
  - Add ARIA labels to toolbar buttons
  - Ensure keyboard navigation works
  - Add screen reader support
  - Test with keyboard-only navigation
  - _Requirements: 7.1_

---

## Phase 10: Testing and Documentation

- [ ] 10. Comprehensive testing and documentation
  - Run all property-based tests
  - Write unit tests for components
  - Create usage documentation
  - Test edge cases
  - _Requirements: All_

- [ ]* 10.1 Run all property-based tests
  - Execute all 8 property tests with 100 iterations each
  - Verify all properties pass
  - Fix any failures discovered
  - Document test coverage

- [ ]* 10.2 Write unit tests
  - Test RichTextEditor component rendering
  - Test toolbar button interactions
  - Test HTML sanitization functions
  - Test HtmlToPdf converter
  - Test form field integration

- [ ] 10.3 Create usage documentation
  - Document how to use RichText field in forms
  - Provide examples for each resume section
  - Document HTML sanitization rules
  - Add troubleshooting guide
  - _Requirements: All_

- [ ] 10.4 Test edge cases
  - Test with empty content
  - Test with very long content
  - Test with nested lists (3+ levels)
  - Test with mixed formatting
  - Test with malformed HTML
  - _Requirements: 4.5, 8.5_

- [ ] 10.5 Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise

---

## Summary

This implementation plan adds rich text editing to resume sections by:
- Creating a reusable RichTextEditor component using Tiptap
- Integrating with TanStack Form for validation and state management
- Implementing HTML to PDF conversion for export
- Updating Experience, Projects, Certifications, and Volunteer sections
- Ensuring formatting is preserved across edit → preview → PDF pipeline
- Implementing comprehensive property-based testing

Each task builds incrementally, with clear requirements traceability and optional testing tasks marked with *.
