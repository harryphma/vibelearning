import os
import tempfile
import logging
import sys
import traceback
from typing import Dict, List, Optional, Union, BinaryIO
from gtts import gTTS
from google.cloud import speech
import io
from dotenv import load_dotenv
import google.generativeai as genai


# Set up logger
logger = logging.getLogger("tts_utils")
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

async def generate_speech_from_text(text: str, language: str = "en") -> BinaryIO:
    """
    Generate speech audio from text using Google Text-to-Speech
    
    Args:
        text: The text to convert to speech
        language: The language code (default: "en")
        
    Returns:
        An audio file object
    """
    try:
        # Create a temporary file to store the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
            # Generate speech
            tts = gTTS(text=text, lang=language)
            tts.save(temp_file.name)
            
            # Return the file object
            return open(temp_file.name, 'rb')
            
    except Exception as e:
        logger.error(f"Error in generate_speech_from_text: {str(e)}")
        logger.error(traceback.format_exc())
        raise Exception(f"Failed to generate speech: {str(e)}")

async def transcribe_speech_from_audio(
    audio_content: bytes, 
    language_code: str = "en-US"
) -> List[Dict[str, Union[str, float, int]]]:
    """
    Transcribe speech from audio bytes using Google Cloud Speech-to-Text API
    
    Args:
        audio_content: The audio content as bytes
        language_code: The language code (default: "en-US")
        
    Returns:
        A list of transcription results with transcript and confidence score
    """
    try:
        logger.debug(f"Processing audio content of size: {len(audio_content)} bytes")
        
        # Analyze audio header bytes for more accurate format detection
        format_info = "Unknown"
        encoding = speech.RecognitionConfig.AudioEncoding.LINEAR16  # Default to LINEAR16 (WAV)
        
        if len(audio_content) > 12:
            header = audio_content[:12]
            header_hex = ' '.join(f'{b:02x}' for b in header)
            logger.debug(f"Audio file header (hex): {header_hex}")
            
            # WAV file detection
            if header.startswith(b'RIFF') and b'WAVE' in header:
                format_info = "WAV format detected from header"
                encoding = speech.RecognitionConfig.AudioEncoding.LINEAR16
            # MP3 detection
            elif header.startswith(b'\xFF\xFB') or header.startswith(b'ID3'):
                format_info = "MP3 format detected from header"
                encoding = speech.RecognitionConfig.AudioEncoding.MP3
            # WebM detection
            elif header.startswith(b'\x1A\x45\xDF\xA3'):
                format_info = "WebM format detected from header"
                encoding = speech.RecognitionConfig.AudioEncoding.WEBM_OPUS
        
        logger.debug(f"Audio format analysis: {format_info}")
        
        # Create a temporary file to store the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            logger.debug(f"Created temporary file: {temp_file.name}")
            temp_file.write(audio_content)
            temp_file.flush()
            
            # Initialize the client
            logger.debug("Initializing Google Speech-to-Text client")
            client = speech.SpeechClient()
            
            # Configure the recognition
            logger.debug(f"Configuring recognition with language code: {language_code}")
            
            config = speech.RecognitionConfig(
                encoding=encoding,
                language_code=language_code,
                audio_channel_count=1,
                enable_automatic_punctuation=True,
                model="default",
                use_enhanced=True  # Use enhanced model for better accuracy
            )
            
            # Create the audio object
            audio = speech.RecognitionAudio(content=audio_content)
            
            # Perform the transcription
            logger.debug(f"Sending request to Google Speech-to-Text API")
            
            try:
                response = client.recognize(config=config, audio=audio)
                logger.debug(f"Received response from Google: {response}")
            except Exception as speech_error:
                # Try to convert to a standard WAV format using ffmpeg if available
                logger.warning(f"First transcription attempt failed: {str(speech_error)}")
                logger.debug("Attempting to convert audio to standard WAV format")
                
                try:
                    import subprocess
                    converted_file = f"{temp_file.name}_converted.wav"
                    
                    # Try to convert using ffmpeg (if installed)
                    cmd = ["ffmpeg", "-y", "-i", temp_file.name, "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", converted_file]
                    logger.debug(f"Running conversion command: {' '.join(cmd)}")
                    
                    process = subprocess.run(cmd, capture_output=True, text=True)
                    if process.returncode != 0:
                        logger.error(f"Conversion failed: {process.stderr}")
                        raise Exception(f"Audio conversion failed: {process.stderr}")
                    
                    logger.debug(f"Conversion successful, using converted file: {converted_file}")
                    
                    # Read the converted file and try again
                    with open(converted_file, "rb") as conv_file:
                        converted_content = conv_file.read()
                    
                    audio = speech.RecognitionAudio(content=converted_content)
                    config = speech.RecognitionConfig(
                        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,  # Standard WAV
                        language_code=language_code,
                        sample_rate_hertz=16000,
                        audio_channel_count=1,
                        enable_automatic_punctuation=True,
                    )
                    
                    response = client.recognize(config=config, audio=audio)
                    logger.debug(f"Received response from Google after conversion: {response}")
                    
                    # Clean up the converted file
                    os.unlink(converted_file)
                except Exception as conv_error:
                    logger.error(f"Audio conversion attempt failed: {str(conv_error)}")
                    raise speech_error  # Re-raise the original error if conversion fails
            
            # Clean up the temporary file
            os.unlink(temp_file.name)
            logger.debug(f"Cleaned up temporary file: {temp_file.name}")
            
            # Process the response
            transcriptions = []
            for result in response.results:
                for alternative in result.alternatives:
                    transcription = {
                        "transcript": alternative.transcript,
                        "confidence": alternative.confidence,
                        "channel_tag": 0  # Default to 0 since we're using mono
                    }
                    transcriptions.append(transcription)
                    logger.debug(f"Added transcription: {transcription}")
            
            if not transcriptions:
                logger.warning("No transcriptions found in the response.")
                
            logger.debug(f"Returning {len(transcriptions)} transcriptions")
            return transcriptions
            
    except Exception as e:
        error_msg = f"Error in transcribe_speech_from_audio: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise Exception(f"Failed to transcribe speech: {str(e)}")



def llm_learner_response(text: str) -> str:
    """
    Generate a response from the LLM learner
    """
    genai.configure(api_key=api_key)

    # Define the model and prompt
    model = genai.GenerativeModel(
        'gemini-2.0-flash',  
        generation_config={
            "temperature": 0.1,
            "top_p": 0.8,
            "top_k": 40,
        }
    )

