'use client'

import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext } from './context'
import Calendar from './fields/calendar'
import Checkbox from './fields/checkbox'
import OTP from './fields/input-otp'
import MultiSelect from './fields/multiselect'
import RadioGroup from './fields/radio'
import RichText from './fields/rich-text'
import Select from './fields/select'
import Slider from './fields/slider'
import Switch from './fields/switch'
import TagInput from './fields/tag-input'
import Text from './fields/text'
import TextArea from './fields/text-area'
import TextWithUnit from './fields/text-with-unit'

export const { useAppForm, withFieldGroup, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Text,
    TextArea,
    RichText,
    Calendar,
    Slider,
    Select,
    Switch,
    Checkbox,
    RadioGroup,
    TextWithUnit,
    MultiSelect,
    OTP,
    TagInput
  },
  formComponents: {
    // SubmitButton
  }
})
