#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Rovierr Server - Slim Build Script${NC}"
echo ""

# Configuration
IMAGE_NAME="${IMAGE_NAME:-rovierr-server}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
SLIM_TAG="${SLIM_TAG:-slim}"
DOCKERFILE="${DOCKERFILE:-apps/server/Dockerfile}"

# Check if slim is installed
if ! command -v slim &> /dev/null; then
    echo -e "${RED}❌ Slim toolkit is not installed${NC}"
    echo ""
    echo "Install it with:"
    echo "  macOS (Intel):  curl -L -o ds.zip https://github.com/slimtoolkit/slim/releases/download/1.40.11/dist_mac.zip && unzip ds.zip && sudo mv dist_mac/slim /usr/local/bin/"
    echo "  macOS (M1/M2):  curl -L -o ds.zip https://github.com/slimtoolkit/slim/releases/download/1.40.11/dist_mac_m1.zip && unzip ds.zip && sudo mv dist_mac_m1/slim /usr/local/bin/"
    echo "  Linux:          curl -L -o ds.tar.gz https://github.com/slimtoolkit/slim/releases/download/1.40.11/dist_linux.tar.gz && tar -xvf ds.tar.gz && sudo mv dist_linux/slim /usr/local/bin/"
    echo "  Homebrew:       brew install docker-slim"
    exit 1
fi

echo -e "${GREEN}✅ Slim toolkit found: $(slim version | head -n 1)${NC}"
echo ""

# Step 1: Build original image
echo -e "${BLUE}📦 Step 1: Building original Docker image...${NC}"
echo "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""

docker build -f "${DOCKERFILE}" -t "${IMAGE_NAME}:${IMAGE_TAG}" .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Original image built successfully${NC}"
echo ""

# Step 2: Show original size
echo -e "${BLUE}📊 Original image size:${NC}"
docker images "${IMAGE_NAME}:${IMAGE_TAG}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
echo ""

# Step 3: Run slim build
echo -e "${BLUE}🔬 Step 2: Minifying image with Slim...${NC}"
echo "This may take a few minutes..."
echo ""

slim build \
  --target "${IMAGE_NAME}:${IMAGE_TAG}" \
  --tag "${IMAGE_NAME}:${SLIM_TAG}" \
  --http-probe=true \
  --http-probe-cmd=/health \
  --http-probe-cmd-wait=10 \
  --continue-after=60 \
  --include-path=/usr/src/app/apps/server \
  --include-path=/usr/src/app/packages \
  --include-bin=/usr/local/bin/bun \
  --include-bin=/bin/bash \
  --include-bin=/bin/sh \
  --include-bin=/usr/bin/curl \
  --preserve-path=/tmp \
  --preserve-path=/var/tmp \
  --show-clogs

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Slim build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Minified image created successfully${NC}"
echo ""

# Step 4: Compare sizes
echo -e "${BLUE}📊 Size comparison:${NC}"
docker images | grep "${IMAGE_NAME}" | grep -E "(${IMAGE_TAG}|${SLIM_TAG})"
echo ""

# Calculate reduction
ORIGINAL_SIZE=$(docker images "${IMAGE_NAME}:${IMAGE_TAG}" --format "{{.Size}}")
SLIM_SIZE=$(docker images "${IMAGE_NAME}:${SLIM_TAG}" --format "{{.Size}}")

echo -e "${GREEN}✨ Optimization complete!${NC}"
echo ""
echo "Original: ${ORIGINAL_SIZE}"
echo "Minified: ${SLIM_SIZE}"
echo ""

# Step 5: Optional - Test the image
echo -e "${YELLOW}💡 To test the minified image:${NC}"
echo ""
echo "  docker run --rm \\"
echo "    --env-file apps/server/.env \\"
echo "    -p 3000:3000 \\"
echo "    ${IMAGE_NAME}:${SLIM_TAG}"
echo ""

# Step 6: Optional - Push to registry
echo -e "${YELLOW}💡 To push to registry:${NC}"
echo ""
echo "  docker tag ${IMAGE_NAME}:${SLIM_TAG} your-registry/${IMAGE_NAME}:${SLIM_TAG}"
echo "  docker push your-registry/${IMAGE_NAME}:${SLIM_TAG}"
echo ""

echo -e "${GREEN}🎉 Done!${NC}"
