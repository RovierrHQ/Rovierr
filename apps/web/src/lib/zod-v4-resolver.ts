import { zodResolver as baseZodResolver } from '@hookform/resolvers/zod'
import type { FieldValues, Resolver } from 'react-hook-form'
import type z from 'zod'

type ZodFormValues<T extends z.ZodTypeAny> = z.output<T> & FieldValues

export const zodV4Resolver = <T extends z.ZodTypeAny>(
  schema: T
): Resolver<ZodFormValues<T>> =>
  baseZodResolver(
    schema as unknown as Parameters<typeof baseZodResolver>[0]
  ) as unknown as Resolver<ZodFormValues<T>>
