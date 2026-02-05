export const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'Traditional Chinese',
  'Simplified Chinese',
  'Arabic',
  'Russian',
  'Portuguese',
  'German',
  'Japanese',
  'Hindi',
  'Italian',
  'Dutch',
  'Turkish',
  'Korean',
  'Hebrew'
]

export const PROFICIENCY_LEVELS = [
  { value: 'basic', label: 'Basic' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'native', label: 'Native' }
] as const

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

export const YEARS = Array.from({ length: 50 }, (_, i) => (2050 - i).toString())
