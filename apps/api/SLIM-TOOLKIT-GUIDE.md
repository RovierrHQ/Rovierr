# Slim Toolkit Integration Guide for Rovierr Server

## Overview

This guide shows how to use slim-toolkit to optimize the Rovierr server Docker image, potentially reducing it by 10-30x while maintaining full functionality.

## Installation

### macOS (Intel)
```bash
curl -L -o ds.zip https://github.com/slimtoolkit/slim/releases/download/1.40.11/dist_mac.zip
unzip ds.zip
sudo mv dist_mac/slim /usr/local/bin/
sudo mv dist_mac/slim-sensor /usr/local/bin/
```

### macOS (Apple Silicon)
```bash
curl -L -o ds.zip https://github.com/slimtoolkit/slim/releases/download/1.40.11/dist_mac_m1.zip
unzip ds.zip
sudo mv dist_mac_m1/slim /usr/local/bin/
sudo mv dist_mac_m1/slim-sensor /usr/local/bin/
```

### Linux
```bash
curl -L -o ds.tar.gz https://github.com/slimtoolkit/slim/releases/download/1.40.11/dist_linux.tar.gz
tar -xvf ds.tar.gz
sudo mv dist_linux/slim /usr/local/bin/
sudo mv dist_linux/slim-sensor /usr/local/bin/
```

### Homebrew
```bash
brew install docker-slim
```

### Verify Installation
```bash
slim version
```

## Quick Start

### 1. Build Your Original Image
```bash
# From the monorepo root
docker build -f apps/server/Dockerfile -t rovierr-server:latest .
```

### 2. Check Original Size
```bash
docker images rovierr-server:latest
```

### 3. Analyze the Image (Optional but Recommended)
```bash
slim xray --target rovierr-server:latest
```

This generates a detailed report showing:
- Image layers and their sizes
- Files and directories
- Exposed ports
- Environment variables
- Reverse-engineered Dockerfile

### 4. Minify the Image

#### Basic Minification
```bash
slim build --target rovierr-server:latest --tag rovierr-server:slim
```

#### Advanced Minification (Recommended for Rovierr)
```bash
slim build \
  --target rovierr-server:latest \
  --tag rovierr-server:slim \
  --http-probe=true \
  --http-probe-cmd=/health \
  --http-probe-cmd-wait=10 \
  --continue-after=60 \
  --include-path=/usr/src/app/apps/server \
  --include-path=/usr/src/app/packages \
  --include-bin=/usr/local/bin/bun \
  --include-bin=/bin/bash \
  --include-bin=/usr/bin/curl \
  --preserve-path=/tmp \
  --preserve-path=/var/tmp
```

### 5. Compare Sizes
```bash
docker images | grep rovierr-server
```

### 6. Test the Minified Image
```bash
# Run with your environment variables
docker run --rm \
  --env-file apps/server/.env \
  -p 3000:3000 \
  rovierr-server:slim
```

## Recommended Configuration for Rovierr

Create a slim configuration file for consistent builds:

```bash
# apps/server/.slim.yaml
```

See the configuration file below for the full setup.

## Build Script

Create a convenient build script:

```bash
# apps/server/build-slim.sh
```

See the script file below for the full implementation.

## Understanding the Flags

### `--http-probe=true`
Enables HTTP probing to ensure all runtime dependencies are captured. Slim will make HTTP requests to your app to trigger code paths.

### `--http-probe-cmd=/health`
Specifies the health check endpoint. Adjust if your health endpoint is different.

### `--continue-after=60`
Waits 60 seconds after probing before finalizing. Increase if your app has slow startup or lazy-loaded modules.

### `--include-path`
Explicitly includes paths that might not be detected during probing. Essential for:
- Configuration files
- Static assets
- Template files
- Workspace packages

### `--include-bin`
Includes specific binaries needed at runtime:
- `bun` - Required to run your TypeScript code
- `bash` - Required by start.sh
- `curl` - Required by health check

### `--preserve-path`
Keeps directories that might be needed for runtime operations:
- `/tmp` - Temporary file operations
- `/var/tmp` - Alternative temp directory

## Advanced Usage

### Interactive Mode
```bash
slim build --target rovierr-server:latest --tag rovierr-server:slim
```

When prompted, you can:
1. Test the container manually
2. Run custom commands
3. Verify functionality before finalizing

### Custom Probing
If you have specific endpoints to test:

```bash
slim build \
  --target rovierr-server:latest \
  --tag rovierr-server:slim \
  --http-probe-cmd=/health \
  --http-probe-cmd=/api/user/profile \
  --http-probe-cmd=/api/chat/conversations
```

### Include Environment-Specific Files
```bash
slim build \
  --target rovierr-server:latest \
  --tag rovierr-server:slim \
  --include-path=/usr/src/app/apps/server/.env.production
```

## Troubleshooting

### Issue: "Module not found" errors
**Solution:** Add the missing module path with `--include-path`

```bash
--include-path=/usr/src/app/node_modules/missing-module
```

### Issue: Binary not found (e.g., curl, bash)
**Solution:** Include the binary explicitly

```bash
--include-bin=/usr/bin/curl \
--include-bin=/bin/bash
```

### Issue: App crashes on startup
**Solution:** Increase `--continue-after` time to capture more runtime behavior

```bash
--continue-after=120
```

### Issue: Dynamic imports fail
**Solution:** Use `--include-path` for dynamically loaded modules

```bash
--include-path=/usr/src/app/apps/server/src/plugins
```

## Security Benefits

Slim automatically generates:
1. **Seccomp profile** - Restricts syscalls to only what's needed
2. **AppArmor profile** - Limits file system access
3. **Reduced attack surface** - Removes unnecessary binaries and files

### Using Generated Security Profiles

```bash
# Run with Seccomp profile
docker run --rm \
  --security-opt seccomp=rovierr-server-slim-seccomp.json \
  rovierr-server:slim

# Run with AppArmor profile (Linux only)
docker run --rm \
  --security-opt apparmor=rovierr-server-slim-apparmor \
  rovierr-server:slim
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Install Slim
  run: |
    curl -L -o ds.tar.gz https://github.com/slimtoolkit/slim/releases/download/1.40.11/dist_linux.tar.gz
    tar -xvf ds.tar.gz
    sudo mv dist_linux/slim /usr/local/bin/

- name: Build and Minify
  run: |
    docker build -f apps/server/Dockerfile -t rovierr-server:${{ github.sha }} .
    slim build --target rovierr-server:${{ github.sha }} --tag rovierr-server:${{ github.sha }}-slim

- name: Push Minified Image
  run: |
    docker push rovierr-server:${{ github.sha }}-slim
```

## Monitoring and Validation

### Check What Was Removed
```bash
slim xray --target rovierr-server:slim --changes-output=changes.json
```

### Compare Before/After
```bash
# Original image report
slim xray --target rovierr-server:latest --report-location=./reports/original

# Minified image report
slim xray --target rovierr-server:slim --report-location=./reports/minified
```

## Best Practices

1. **Always test thoroughly** - Run your full test suite against the minified image
2. **Use health checks** - Ensure your health endpoint is working
3. **Include all runtime paths** - Better to include too much than too little
4. **Version your slim configs** - Keep `.slim.yaml` in version control
5. **Monitor startup time** - Minified images should start faster
6. **Check logs** - Ensure no "file not found" errors in production

## Expected Results

For a typical Bun/Node.js application:
- **Original size:** ~500-800 MB
- **Minified size:** ~50-150 MB
- **Reduction:** 5-15x smaller
- **Startup time:** Similar or faster
- **Runtime performance:** Identical

## Resources

- [Slim Toolkit GitHub](https://github.com/slimtoolkit/slim)
- [Slim Toolkit Documentation](https://github.com/slimtoolkit/slim#readme)
- [Examples Repository](https://github.com/slimtoolkit/examples)
- [CNCF Sandbox Project](https://www.cncf.io/projects/slim/)
