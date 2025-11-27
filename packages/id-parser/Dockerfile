FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 libgl1 libsm6 libxrender1 libxext6 \
    curl \
    && apt-get clean

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock* ./

# Install dependencies with UV
RUN uv sync --frozen --no-dev

# Install PaddlePaddle CPU separately (special index)
RUN uv pip install paddlepaddle==3.2.0 -i https://www.paddlepaddle.org.cn/packages/stable/cpu/

# Copy application code
COPY . .

EXPOSE 8000

# Run with UV
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
