/**
 * Registration Service
 * Handles registration settings configuration and availability checks
 */

import {
  type DB,
  member as memberTable,
  organization as organizationTable,
  registrationSettings as registrationSettingsTable
} from '@rov/db'
import type {
  CreateRegistrationSettingsInput,
  UpdateRegistrationSettingsInput
} from '@rov/orpc-contracts'
import type { InferSelectModel } from 'drizzle-orm'
import { count, eq } from 'drizzle-orm'

type RegistrationSettings = InferSelectModel<typeof registrationSettingsTable>

export class RegistrationService {
  private db: DB

  constructor(db: DB) {
    this.db = db
  }

  /**
   * Get registration settings for a society
   */
  async getRegistrationSettings(
    societyId: string
  ): Promise<RegistrationSettings | null> {
    const result = await this.db
      .select()
      .from(registrationSettingsTable)
      .where(eq(registrationSettingsTable.societyId, societyId))
      .limit(1)

    return result[0] || null
  }

  /**
   * Create registration settings for a society
   */
  async createRegistrationSettings(
    input: CreateRegistrationSettingsInput
  ): Promise<RegistrationSettings> {
    const result = await this.db
      .insert(registrationSettingsTable)
      .values({
        societyId: input.societyId,
        isEnabled: input.isEnabled ?? false,
        approvalMode: input.approvalMode ?? 'manual',
        formId: input.formId ?? null,
        maxCapacity: input.maxCapacity ?? null,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        welcomeMessage: input.welcomeMessage ?? null,
        customBanner: input.customBanner ?? null,
        notificationsEnabled: input.notificationsEnabled ?? true,
        isPaused: input.isPaused ?? false
      })
      .returning()

    return result[0]
  }

  /**
   * Update registration settings
   */
  async updateRegistrationSettings(
    id: string,
    input: UpdateRegistrationSettingsInput
  ): Promise<RegistrationSettings> {
    const updateData: Record<string, unknown> = {}

    if (input.isEnabled !== undefined) {
      updateData.isEnabled = input.isEnabled
    }
    if (input.approvalMode !== undefined) {
      updateData.approvalMode = input.approvalMode
    }
    if (input.formId !== undefined) {
      updateData.formId = input.formId
    }
    if (input.maxCapacity !== undefined) {
      updateData.maxCapacity = input.maxCapacity
    }
    if (input.startDate !== undefined) {
      updateData.startDate = input.startDate
    }
    if (input.endDate !== undefined) {
      updateData.endDate = input.endDate
    }
    if (input.welcomeMessage !== undefined) {
      updateData.welcomeMessage = input.welcomeMessage
    }
    if (input.customBanner !== undefined) {
      updateData.customBanner = input.customBanner
    }
    if (input.notificationsEnabled !== undefined) {
      updateData.notificationsEnabled = input.notificationsEnabled
    }
    if (input.isPaused !== undefined) {
      updateData.isPaused = input.isPaused
    }

    const result = await this.db
      .update(registrationSettingsTable)
      .set(updateData)
      .where(eq(registrationSettingsTable.id, id))
      .returning()

    return result[0]
  }

  /**
   * Generate registration URL for a society
   */
  generateRegistrationUrl(societySlug: string): string {
    return `/join/${societySlug}`
  }

  /**
   * Check if registration is open for a society
   */
  async isRegistrationOpen(societyId: string): Promise<boolean> {
    const settings = await this.getRegistrationSettings(societyId)

    if (!settings) {
      return false
    }

    // Check if registration is enabled
    if (!settings.isEnabled) {
      return false
    }

    // Check if registration is paused
    if (settings.isPaused) {
      return false
    }

    // Check capacity
    const capacityCheck = await this.checkCapacity(societyId)
    if (capacityCheck.isFull) {
      return false
    }

    // Check date range
    const now = new Date()

    if (settings.startDate && new Date(settings.startDate) > now) {
      return false
    }

    if (settings.endDate && new Date(settings.endDate) < now) {
      return false
    }

    return true
  }

  /**
   * Check capacity for a society
   */
  async checkCapacity(
    societyId: string
  ): Promise<{ current: number; max: number | null; isFull: boolean }> {
    const settings = await this.getRegistrationSettings(societyId)

    // Get current member count
    const result = await this.db
      .select({ count: count() })
      .from(memberTable)
      .where(eq(memberTable.organizationId, societyId))

    const currentCount = result[0]?.count || 0
    const maxCapacity = settings?.maxCapacity || null

    const isFull = maxCapacity !== null && currentCount >= maxCapacity

    return {
      current: currentCount,
      max: maxCapacity,
      isFull
    }
  }

  /**
   * Check registration availability with detailed reason
   */
  async checkRegistrationAvailability(societySlug: string): Promise<{
    isAvailable: boolean
    reason:
      | 'disabled'
      | 'paused'
      | 'full'
      | 'not_started'
      | 'ended'
      | 'private'
      | null
    message: string | null
  }> {
    // Get society by slug
    const society = await this.db
      .select()
      .from(organizationTable)
      .where(eq(organizationTable.slug, societySlug))
      .limit(1)

    if (!society[0]) {
      return {
        isAvailable: false,
        reason: null,
        message: 'Society not found'
      }
    }

    // Check if society is private
    if (society[0].visibility === 'private') {
      return {
        isAvailable: false,
        reason: 'private',
        message: 'This society is invite-only'
      }
    }

    const settings = await this.getRegistrationSettings(society[0].id)

    if (!settings) {
      return {
        isAvailable: false,
        reason: 'disabled',
        message: 'Registration is not configured for this society'
      }
    }

    // Check if registration is enabled
    if (!settings.isEnabled) {
      return {
        isAvailable: false,
        reason: 'disabled',
        message: 'Registration is currently disabled'
      }
    }

    // Check if registration is paused
    if (settings.isPaused) {
      return {
        isAvailable: false,
        reason: 'paused',
        message: 'Registration is temporarily paused'
      }
    }

    // Check capacity
    const capacityCheck = await this.checkCapacity(society[0].id)
    if (capacityCheck.isFull) {
      return {
        isAvailable: false,
        reason: 'full',
        message: 'Registration is full'
      }
    }

    // Check date range
    const now = new Date()

    if (settings.startDate && new Date(settings.startDate) > now) {
      return {
        isAvailable: false,
        reason: 'not_started',
        message: `Registration opens on ${new Date(settings.startDate).toLocaleDateString()}`
      }
    }

    if (settings.endDate && new Date(settings.endDate) < now) {
      return {
        isAvailable: false,
        reason: 'ended',
        message: 'Registration has closed'
      }
    }

    return {
      isAvailable: true,
      reason: null,
      message: null
    }
  }
}
