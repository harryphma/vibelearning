from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
import os
import tempfile
from gtts import gTTS

router = APIRouter(
    prefix="/tts",
    tags=["text-to-speech"]
)

@router.get("/generate")
@router.post("/generate")
async def generate_speech(text: str, language: Optional[str] = "en"):
    """
    Generate speech from text using Google Text-to-Speech
    """
    try:
        # Create a temporary file to store the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
            # Generate speech
            tts = gTTS(text=text, lang=language)
            tts.save(temp_file.name)
            
            # Create a streaming response
            async def cleanup():
                try:
                    os.unlink(temp_file.name)
                except Exception:
                    pass  # Ignore cleanup errors
            
            return StreamingResponse(
                open(temp_file.name, 'rb'),
                media_type="audio/mpeg",
                background=cleanup
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 