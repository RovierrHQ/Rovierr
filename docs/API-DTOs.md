# TODO List API — DTOs and request/response models

The API uses Data Transfer Objects (DTOs) / ViewModels for request and response bodies. Types are aligned with Zod schemas in the route layer and service DTOs in `apps/api/src/service/todo/types.ts`.

## Response DTOs

### Issue (TODO)

Single TODO/issue. Exposed as `IssueSchema` in OpenAPI and `IssueDto` in the service.

| Field        | Type     | Description                                |
|-------------|----------|--------------------------------------------|
| `id`        | string   | Unique ID                                  |
| `teamId`    | string   | Team that owns the TODO                    |
| `title`     | string   | TODO name (spec: "Name")                   |
| `description` | string \| null | Optional description                   |
| `status`    | `"todo"` \| `"in_progress"` \| `"done"` | Not Started / In Progress / Completed |
| `priority`  | `"high"` \| `"medium"` \| `"low"`       | Priority                              |
| `assigneeId`| string \| null | Assigned user ID                     |
| `dueDate`   | string \| null | ISO8601 due date                       |
| `position`  | number   | Order in board/list                        |
| `createdAt` | string   | ISO8601                                   |
| `updatedAt` | string   | ISO8601                                   |

### Paginated issues

Team list endpoint returns `PaginatedIssuesResponseSchema`:

| Field       | Type           | Description     |
|------------|----------------|-----------------|
| `data`     | Issue[]        | Page of issues  |
| `totalCount` | number       | Total matching  |

## Request DTOs

### Create TODO (POST body)

| Field        | Type     | Required | Description        |
|-------------|----------|----------|--------------------|
| `title`     | string   | yes      | TODO name          |
| `description` | string | no       | Optional            |
| `status`    | enum     | no       | Default `"todo"`   |
| `priority`  | enum     | no       | Default `"medium"` |
| `assigneeId`| string \| null | no  | Assignee            |
| `dueDate`   | string \| null | no  | ISO8601             |
| `labelIds`  | string[] | no       | Label IDs           |

### Update TODO (PATCH body)

All fields optional. Same shape as create, plus:

| Field     | Type   | Description      |
|----------|--------|------------------|
| `position` | number | Board/list order |

## List filters and sort

- **Filters:** `status`, `dueBefore`, `dueAfter`, `search`, `priority`, `assigneeId`, `labelIds` (query params).
- **Sort:** `sort=field:asc|desc` with `field` in `title`, `status`, `dueDate`, `createdAt`, `priority`.
- **Pagination:** `page`, `perPage` (team list only).

See README “TODO List API” and OpenAPI `/doc` for full details.
