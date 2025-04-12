from fastapi import APIRouter, HTTPException, Body, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import Optional
import os
import logging
import traceback
import sys
from pydantic import BaseModel

# Import utility functions
from app.routers.utils.tts_utils import generate_speech_from_text, transcribe_speech_from_audio

# Set up logger
logger = logging.getLogger("tts_router")
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

router = APIRouter(
    prefix="/tts",
    tags=["text-to-speech"]
)

class TTSRequest(BaseModel):
    text: str
    language: Optional[str] = "en"

class STTRequest(BaseModel):
    language_code: Optional[str] = "en-US"
    sample_rate_hertz: Optional[int] = 16000

@router.get("/generate")
async def generate_speech_get(text: str, language: Optional[str] = "en"):
    """
    Generate speech from text using Google Text-to-Speech (GET version)
    """
    return await generate_speech(text, language)

@router.post("/generate")
async def generate_speech_post(request: TTSRequest = Body(...)):
    """
    Generate speech from text using Google Text-to-Speech (POST version)
    """
    return await generate_speech(request.text, request.language)

@router.post("/transcribe")
async def transcribe_speech(
    audio_file: UploadFile = File(...),
    language_code: str = "en-US"
):
    """
    Transcribe speech from audio file using Google Cloud Speech-to-Text API
    """
    try:
        logger.debug(f"Received audio file: {audio_file.filename}, content_type: {audio_file.content_type}")
        
        # Read the uploaded file
        audio_content = await audio_file.read()
        logger.debug(f"Audio content size: {len(audio_content)} bytes")
        
        # Use the utility function for transcription
        transcriptions = await transcribe_speech_from_audio(
            audio_content=audio_content,
            language_code=language_code
        )
        
        return {"transcriptions": transcriptions}
            
    except Exception as e:
        error_msg = f"Error in transcribe_speech: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)

async def generate_speech(text: str, language: str):
    """
    Common function to generate speech
    """
    try:
        # Use the utility function for speech generation
        audio_file = await generate_speech_from_text(text, language)
        
        # Create a streaming response
        async def cleanup():
            try:
                os.unlink(audio_file.name)
            except Exception:
                pass  # Ignore cleanup errors
        
        return StreamingResponse(
            audio_file,
            media_type="audio/mpeg",
            background=cleanup
        )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 


    
