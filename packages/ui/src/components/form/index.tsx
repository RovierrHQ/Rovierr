'use client'

import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext } from './context'
import Calendar from './fields/calendar'
import Currency from './fields/currency'
import MultiSelect from './fields/multiselect'
import RadioGroup from './fields/radio'
import Select from './fields/select'
import Slider from './fields/slider'
import Switch from './fields/switch'
import Text from './fields/text'
import TextArea from './fields/text-area'
import TextWithUnit from './fields/text-with-unit'

export const { useAppForm, withFieldGroup, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Text,
    TextArea,
    Currency,
    Calendar,
    Slider,
    Select,
    Switch,
    RadioGroup,
    TextWithUnit,
    MultiSelect
  },
  formComponents: {}
})
