import { pgTable, text } from 'drizzle-orm/pg-core'
import { primaryId, timestamps } from '../helper'

/** ========================
 *  UNIVERSITY
 *  ======================== */
export const university = pgTable('university', {
  id: primaryId,
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  logo: text('logo'),
  country: text('country').notNull(),
  city: text('city').notNull(),
  address: text('address').notNull(),
  validEmailDomains: text('valid_email_domains').array().notNull(),
  ...timestamps
})
