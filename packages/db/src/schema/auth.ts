import { relations } from 'drizzle-orm'
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { timestamps } from '../helper'
import { roadmap } from './roadmap'
import { university } from './university'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  username: text('username').unique(),
  displayUsername: text('display_username'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  bannerImage: text('banner_image'),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  phoneNumber: text('phone_number').unique(),
  phoneNumberVerified: boolean('phone_number_verified').default(false),

  // Onboarding fields
  universityEmail: text('university_email').unique(),
  universityId: text('university_id').references(() => university.id),
  major: text('major'),
  yearOfStudy: text('year_of_study'),
  interests: text('interests').array(),

  //  social fields
  bio: text('bio'),
  website: text('website'),
  whatsapp: text('whatsapp'),
  telegram: text('telegram'),
  instagram: text('instagram'),
  facebook: text('facebook'),
  twitter: text('twitter'),
  linkedin: text('linkedin'),

  // Verification status
  isVerified: boolean('is_verified').default(false).notNull(),

  ...timestamps
})

export const usersRelations = relations(user, ({ many }) => ({
  roadmap: many(roadmap)
}))

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  activeOrganizationId: text('active_organization_id'),
  activeTeamId: text('active_team_id'),
  ...timestamps
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  ...timestamps
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  ...timestamps
})

export const twoFactor = pgTable('two_factor', {
  id: text('id').primaryKey(),
  secret: text('secret').notNull(),
  backupCodes: text('backup_codes').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
})

export const organizationRole = pgTable('organization_role', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  permission: text('permission').notNull(),
  ...timestamps
})

export const team = pgTable('team', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  ...timestamps
})

export const teamMember = pgTable('team_member', {
  id: text('id').primaryKey(),
  teamId: text('team_id')
    .notNull()
    .references(() => team.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamps.createdAt
})

export const organization = pgTable('organization', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  logo: text('logo'),
  banner: text('banner'),
  type: text('type', { enum: ['student', 'university'] })
    .default('student')
    .notNull(),
  visibility: text('visibility', { enum: ['public', 'campus_only', 'private'] })
    .default('public')
    .notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  universityId: text('university_id').references(() => university.id),
  description: text('description'),
  tags: text('tags').array(),
  metadata: text('metadata'),
  ...timestamps
})

export const member = pgTable('member', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: text('role').default('member').notNull(),
  createdAt: timestamps.createdAt
})

export const invitation = pgTable('invitation', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role'),
  teamId: text('team_id'),
  status: text('status').default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  inviterId: text('inviter_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
})
