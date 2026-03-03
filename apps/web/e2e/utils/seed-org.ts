import crypto from 'node:crypto'
import { createDB, eq } from '@rov/db'
import {
  member,
  organization,
  session,
  team,
  teamMember
} from '@rov/db/schema/auth'
import { TEST_USER } from './auth-setup'

export const TEST_ORG_ID = 'e2e-test-org-id'
export const TEST_TEAM_ID = 'e2e-test-team-id'

export type SeedOrgResult = { orgId: string; teamId: string }

export async function setupOrgAndTeam(
  databaseUrl: string,
  userId: string
): Promise<SeedOrgResult> {
  const db = createDB(databaseUrl)
  const now = new Date().toISOString()

  const existingOrg = await db.query.organization.findFirst({
    where: eq(organization.id, TEST_ORG_ID)
  })

  if (!existingOrg) {
    await db.insert(organization).values({
      id: TEST_ORG_ID,
      name: 'E2E Test Org',
      slug: 'e2e-test-org',
      createdAt: now
    })

    await db.insert(team).values({
      id: TEST_TEAM_ID,
      name: 'E2E Test Team',
      organizationId: TEST_ORG_ID,
      createdAt: now
    })
  }

  const existingMember = await db.query.member.findFirst({
    where: eq(member.organizationId, TEST_ORG_ID)
  })
  if (!existingMember) {
    await db.insert(member).values({
      id: crypto.randomUUID(),
      organizationId: TEST_ORG_ID,
      userId,
      role: 'owner',
      createdAt: now
    })
  }

  const existingTeamMember = await db.query.teamMember.findFirst({
    where: eq(teamMember.teamId, TEST_TEAM_ID)
  })
  if (!existingTeamMember) {
    await db.insert(teamMember).values({
      id: crypto.randomUUID(),
      teamId: TEST_TEAM_ID,
      userId,
      createdAt: now
    })
  }

  await db
    .update(session)
    .set({
      activeOrganizationId: TEST_ORG_ID,
      activeTeamId: TEST_TEAM_ID,
      updatedAt: now
    })
    .where(eq(session.token, TEST_USER.sessionToken))

  return { orgId: TEST_ORG_ID, teamId: TEST_TEAM_ID }
}

export async function cleanupOrgAndTeam(databaseUrl: string): Promise<void> {
  const db = createDB(databaseUrl)

  await db.delete(teamMember).where(eq(teamMember.teamId, TEST_TEAM_ID))
  await db.delete(team).where(eq(team.id, TEST_TEAM_ID))
  await db.delete(member).where(eq(member.organizationId, TEST_ORG_ID))
  await db.delete(organization).where(eq(organization.id, TEST_ORG_ID))
}
