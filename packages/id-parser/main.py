from fastapi import FastAPI, UploadFile, File, Header, HTTPException
from paddleocr import PaddleOCR
import numpy as np
import cv2
import re
import logging
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file in development (only if it exists)
# In production, environment variables are set by Docker/Koyeb
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    load_dotenv(env_path)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Log if .env was loaded
if env_path.exists():
    logger.info(f"Loaded environment variables from {env_path}")

app = FastAPI()

# Required API key for authentication (set via environment variable or .env file)
API_KEY = os.getenv("API_KEY", "")
if not API_KEY:
    logger.warning("API_KEY is not set - service will reject all requests")

def verify_api_key(x_api_key: str | None = None):
    """Verify API key (required)"""
    if not API_KEY:
        raise HTTPException(
            status_code=500,
            detail="API key not configured on server"
        )
    if not x_api_key or x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return True

@app.get("/")
async def health_check():
    """Health check endpoint for Koyeb monitoring"""
    return {"status": "ok", "service": "id-parser"}

ocr = PaddleOCR(
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
    lang="en"
)

HK_UNIS = [
    "The Chinese University of Hong Kong",
    "The University of Hong Kong",
    "The Hong Kong Polytechnic University",
    "The Hong Kong University of Science and Technology",
    "City University of Hong Kong",
    "Hong Kong Baptist University",
    "Lingnan University",
    "The Education University of Hong Kong",
]

def parse_student_id(text):
    patterns = [
        r"[A-Z]{1,3}\d{6,10}",
        r"\d{7,12}",
        r"[A-Za-z]\d{7,10}"
    ]
    for p in patterns:
        m = re.search(p, text)
        if m:
            return m.group()
    return None

def parse_expiry(text):
    patterns = [
        r"(0[1-9]|1[0-2])[/\-](20\d{2})",
        r"(20\d{2})[/\-](0[1-9]|1[0-2])",
    ]
    for p in patterns:
        m = re.search(p, text)
        if m:
            return m.group()
    return None

def detect_university(text):
    t = text.lower()
    for uni in HK_UNIS:
        if uni.lower() in t:
            return uni
    return None

@app.post("/parse")
async def parse(
    file: UploadFile = File(...),
    x_api_key: str | None = Header(None, alias="X-API-Key")
):
    # Verify API key if configured
    verify_api_key(x_api_key)
    print(f"\n{'='*60}")
    print(f"Received file: {file.filename}, content_type: {file.content_type}")

    img_bytes = await file.read()
    print(f"Read {len(img_bytes)} bytes")

    img_np = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
    print(f"Decoded image shape: {img.shape if img is not None else 'None'}")

    # Save temp file for PaddleOCR predict
    temp_path = "/tmp/temp_ocr_image.jpg"
    cv2.imwrite(temp_path, img)
    print(f"Saved temp image to {temp_path}")

    result = ocr.predict(temp_path)
    print(f"OCR result type: {type(result)}")
    print(f"OCR result length: {len(result) if result else 0}")
    print(f"OCR result: {result}")

    # Extract text from result
    lines = []
    for idx, res in enumerate(result):
        print(f"\nResult {idx}: type={type(res)}")

        # PaddleOCR returns dict-like objects with 'rec_texts' key
        if isinstance(res, dict) and 'rec_texts' in res:
            texts = res['rec_texts']
            print(f"Found rec_texts: {texts}")
            lines.extend(texts)
        elif hasattr(res, 'get') and res.get('rec_texts'):
            texts = res.get('rec_texts')
            print(f"Found rec_texts via get: {texts}")
            lines.extend(texts)

    print(f"\nExtracted lines: {lines}")
    text = " ".join(lines)
    print(f"Combined text: {text}")

    university = detect_university(text)
    student_id = parse_student_id(text)
    expiry_date = parse_expiry(text)

    print(f"Parsed - University: {university}, Student ID: {student_id}, Expiry: {expiry_date}")
    print(f"{'='*60}\n")

    return {
        "raw_text": lines,
        "university": university,
        "student_id": student_id,
        "expiry_date": expiry_date
    }
