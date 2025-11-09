import { useStore } from '@tanstack/react-form'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group'
import ColorSelect from '../../custom/color-select'
import { withFieldGroup } from '..'

const TitleColorGroup = withFieldGroup({
  defaultValues: { color: '', title: '' },
  props: { placeholder: 'Enter project name' },
  render: ({ group, placeholder }) => {
    const titleMeta = useStore(
      group.form.store,
      (state) => state.fieldMeta.title
    )

    const isInvalid = titleMeta?.isTouched && !titleMeta?.isValid
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor="title">Project Name</FieldLabel>
        <InputGroup>
          <group.AppField
            children={(field) => {
              return (
                <InputGroupInput
                  aria-invalid={isInvalid}
                  autoComplete={field.name}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={placeholder}
                  value={field.state.value}
                />
              )
            }}
            name="title"
          />
          <InputGroupAddon>
            <group.AppField
              children={(field) => (
                <>
                  <ColorSelect
                    onColorChange={(color) => field.handleChange(color.value)}
                    selectedColor={field.state.value}
                  />
                </>
              )}
              name="color"
            />
          </InputGroupAddon>
        </InputGroup>

        {isInvalid && <FieldError errors={titleMeta.errors} />}
      </Field>
    )
  }
})

export default TitleColorGroup
