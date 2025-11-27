# ID Parser Service

Student ID card parser using PaddleOCR for Hong Kong universities.

## Setup with UV

### Install UV

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or with pip
pip install uv
```

### Local Development

```bash
# Install dependencies
uv sync

# Run the service
uv run uvicorn main:app --reload --port 8000
```

### Docker

```bash
# Build
docker build -t id-parser .

# Run
docker run -p 8000:8000 id-parser
```

## API Usage

```bash
curl -X POST "http://localhost:8000/parse" \
  -F "file=@student_id.jpg"
```

## Dependencies

- FastAPI - Web framework
- PaddleOCR - OCR engine
- OpenCV - Image processing
- UV - Package manager


## testing:
curl -X POST "http://localhost:8000/parse" \
  -F "file=@/Users/rexcode/Desktop/myphoto/cu_link.png" | jq