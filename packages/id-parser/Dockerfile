# Production Dockerfile
# Optimized for smaller image size and faster builds

FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 libgl1 libsm6 libxrender1 libxext6 \
    libgomp1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install UV via pip
RUN pip install --no-cache-dir uv

WORKDIR /app

# Copy dependency files first (for better layer caching)
COPY pyproject.toml uv.lock* ./

# Install production dependencies only
RUN uv sync --frozen --no-dev

# Install PaddlePaddle CPU separately (special index)
RUN uv pip install paddlepaddle==3.2.0 -i https://www.paddlepaddle.org.cn/packages/stable/cpu/

# Copy application code
COPY . .

EXPOSE 8000

# Production: no reload, single worker
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
