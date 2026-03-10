# Members UI Update Plan

## Task Summary
Show total members, pending invitations, join requests, roles on top as summary cards. When clicked on each card, show their corresponding details below. Remove the duplicate navigation from under.

## Changes Required

### 1. Edit `apps/web/src/routes/spaces/societies/mine/$clubID/members.tsx`
- [x] Read and understand the file
- [ ] Remove the duplicate TabsList (tab triggers)
- [ ] Keep the TabsContent components
- [ ] Ensure child components receive `showHeader={false}` to avoid duplicate headers
- [ ] Test that clicking summary cards navigates to correct content

## Implementation Notes
- The summary cards at top already have click handlers that set `activeTab` state
- The Tabs component already manages which content to show based on `activeTab`
- We just need to remove the duplicate TabsList and keep the visual design clean
