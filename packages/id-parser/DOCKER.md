# Docker Setup Guide

This service uses separate Dockerfiles for development and production environments.

## File Structure

- **`Dockerfile`** - Production build (optimized, no hot reload)
- **`Dockerfile.dev`** - Development build (with hot reload, dev dependencies)
- **`.dockerignore`** - Files excluded from Docker builds

## Development

When running `bun dev`, Turborepo uses `docker-compose.yml` which:
- Uses `Dockerfile.dev`
- Mounts source code as a volume for hot reloading
- Includes dev dependencies

**Hot reloading:** Changes to `main.py` automatically restart the server.

## Production

For production deployments, use the standard `Dockerfile`:

```bash
docker build -t id-parser:prod -f Dockerfile .
docker run -p 8001:8000 id-parser:prod
```

Or with docker-compose (create `docker-compose.prod.yml`):

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

## Best Practices Explained

### Why Separate Dockerfiles?

1. **Development (`Dockerfile.dev`)**:
   - Includes dev dependencies (debugging tools, etc.)
   - Uses `--reload` flag for hot reloading
   - Mounts source code as volume
   - Larger image size is acceptable

2. **Production (`Dockerfile`)**:
   - Only production dependencies (`--no-dev`)
   - No reload flag (better performance)
   - Code baked into image (immutable)
   - Optimized for smaller size and security

### Alternative Patterns

**Pattern 1: Separate Dockerfiles** (What we're using)
- ✅ Clear separation
- ✅ Easy to understand
- ✅ Different optimization strategies

**Pattern 2: Multi-stage builds**
```dockerfile
FROM python:3.10-slim as base
# ... common setup ...

FROM base as dev
# ... dev-specific ...

FROM base as prod
# ... prod-specific ...
```
- ✅ Single file
- ❌ More complex
- ❌ Harder to maintain

**Pattern 3: docker-compose.override.yml**
- Auto-loaded in dev (Docker Compose feature)
- Override production settings
- ✅ No code changes needed
- ❌ Less explicit

## Commands

```bash
# Development (via Turborepo)
bun dev

# Manual dev build
docker build -f Dockerfile.dev -t id-parser:dev .
docker run -p 8001:8000 -v $(pwd):/app id-parser:dev

# Production build
docker build -f Dockerfile -t id-parser:prod .
docker run -p 8001:8000 id-parser:prod
```
