#!/usr/bin/env python3
import os
import sys
import logging
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

try:
    from faster_whisper import WhisperModel
except ImportError:
    print("ERROR: faster-whisper not installed. Run: pip install faster-whisper", file=sys.stderr)
    sys.exit(1)

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Whisper Transcription Service", version="1.0.0")

model: Optional[WhisperModel] = None
MODEL_NAME = os.getenv("WHISPER_MODEL", "medium")
DEVICE = os.getenv("WHISPER_DEVICE", "cuda")
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "float16")

class TranscribeRequest(BaseModel):
    audio_path: str

class TranscribeResponse(BaseModel):
    text: str
    language: str
    duration: float

@app.on_event("startup")
async def load_model():
    global model
    logger.info(f"Loading Whisper model: {MODEL_NAME}")
    logger.info(f"Device: {DEVICE}, Compute Type: {COMPUTE_TYPE}")
    
    try:
        model = WhisperModel(
            MODEL_NAME,
            device=DEVICE,
            compute_type=COMPUTE_TYPE
        )
        logger.info("✅ Whisper model loaded successfully")
    except Exception as e:
        logger.error(f"❌ Failed to load Whisper model: {e}")
        logger.info("Attempting to load with CPU fallback...")
        try:
            model = WhisperModel(
                MODEL_NAME,
                device="cpu",
                compute_type="int8"
            )
            logger.info("✅ Whisper model loaded on CPU")
        except Exception as cpu_error:
            logger.error(f"❌ CPU fallback failed: {cpu_error}")
            sys.exit(1)

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "model_loaded": model is not None
    }

@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(request: TranscribeRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    audio_path = request.audio_path
    
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail=f"Audio file not found: {audio_path}")
    
    logger.info(f"Transcribing: {audio_path}")
    
    try:
        segments, info = model.transcribe(
            audio_path,
            beam_size=5,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500)
        )
        
        transcript_text = " ".join([segment.text.strip() for segment in segments])
        
        logger.info(f"✅ Transcription complete. Language: {info.language}, Duration: {info.duration:.2f}s")
        
        return TranscribeResponse(
            text=transcript_text,
            language=info.language,
            duration=info.duration
        )
    
    except Exception as e:
        logger.error(f"❌ Transcription failed: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")

@app.post("/transcribe-file")
async def transcribe_uploaded_file(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    temp_path = f"/tmp/whisper-upload-{file.filename}"
    
    try:
        with open(temp_path, "wb") as f:
            f.write(await file.read())
        
        logger.info(f"Transcribing uploaded file: {file.filename}")
        
        segments, info = model.transcribe(
            temp_path,
            beam_size=5,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500)
        )
        
        transcript_text = " ".join([segment.text.strip() for segment in segments])
        
        os.remove(temp_path)
        
        logger.info(f"✅ Transcription complete. Language: {info.language}")
        
        return TranscribeResponse(
            text=transcript_text,
            language=info.language,
            duration=info.duration
        )
    
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        logger.error(f"❌ File transcription failed: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8001"))
    host = os.getenv("HOST", "127.0.0.1")
    
    logger.info(f"🚀 Starting Whisper service on {host}:{port}")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )
