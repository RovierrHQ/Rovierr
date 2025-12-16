# Router Migration Checklist Template

Use this checklist for each router migration:

## Pre-Migration
- [ ] Identify ORPC contracts in `packages/orpc-contracts/src/{domain}/`
- [ ] Review existing router structure in `apps/server/src/routers/{domain}/`
- [ ] Determine if router should use Pattern A (simple) or Pattern B (complex)
- [ ] Check for existing service classes or business logic

## Migration Steps
- [ ] Create router directory structure
- [ ] Extract Zod schemas from ORPC contracts
- [ ] Create error classes if needed
- [ ] Implement routes using Elysia
- [ ] Apply authentication middleware where needed
- [ ] Preserve all business logic
- [ ] Maintain database queries unchanged
- [ ] Add OpenAPI metadata (description, summary, tags)

## Validation
- [ ] TypeScript compilation succeeds
- [ ] Server starts without errors
- [ ] Routes are registered correctly
- [ ] Authentication works for protected routes
- [ ] Manual testing of key endpoints
- [ ] Error handling works correctly

## Integration
- [ ] Update server index.ts to use new router
- [ ] Remove old ORPC imports
- [ ] Update any cross-router dependencies

## Documentation
- [ ] Document any breaking changes
- [ ] Update router-specific documentation
- [ ] Add inline code comments where needed

## Completion
- [ ] Code review completed
- [ ] All checklist items verified
- [ ] Router marked as completed in migration tracker