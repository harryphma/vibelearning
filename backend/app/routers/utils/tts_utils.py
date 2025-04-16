import os
import tempfile
import logging
import sys
import traceback
import json
from typing import Dict, List, Optional, Union, BinaryIO

# Hypothetical OpenAI TTS + official OpenAI Whisper STT
from openai import OpenAI

# For LLM calls (Gemini) - we'll keep these if you still need Google's LLM
import google.generativeai as genai

from dotenv import load_dotenv
import typing_extensions as typing

# Load environment variables
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
    Generate speech audio from text using a hypothetical OpenAI Text-to-Speech.
    
    Args:
        text (str): The text to convert to speech.
        language (str): The language code (default: "en").
        
    Returns:
        BinaryIO: An audio file object opened in 'rb' mode.
    """
    try:
        # Load environment variables (for OPENAI_API_KEY, etc.)
        load_dotenv()

        # Hypothetical initialization of your OpenAI TTS client
        # If you have an actual TTS provider, use their real client instead

        # Create a temporary file to store the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
            # Hypothetical TTS call
            with client.audio.speech.with_streaming_response.create(
                model="gpt-4o-mini-tts",        # Hypothetical TTS model name
                voice="coral",                  # Hypothetical voice name
                input=text,
                instructions="Speak in a pick-me-girl tone."
            ) as response:
                response.stream_to_file(temp_file.name)

            return open(temp_file.name, 'rb')

    except Exception as e:
        logger.error(f"Error in generate_speech_from_text: {str(e)}")
        logger.error(traceback.format_exc())
        raise Exception(f"Failed to generate speech: {str(e)}")


async def transcribe_speech_from_audio(
    audio_content: bytes, 
    language_code: str = "en"
) -> List[Dict[str, Union[str, float, int]]]:
    """
    Transcribe speech from audio bytes using OpenAI Whisper API.
    
    Args:
        audio_content (bytes): The raw audio content as bytes.
        language_code (str): The language code in ISO-639-1 format (default: "en").
        
    Returns:
        A list of transcription results in the format:
        [
            {
                "transcript": str,
                "confidence": float,
                "channel_tag": int
            },
            ...
        ]
    """
    try:
        logger.debug(f"Processing audio content of size: {len(audio_content)} bytes")

        # Load environment variables (for OPENAI_API_KEY, etc.)
        load_dotenv()

        # Write bytes to a temporary file so we can pass it to openai.Audio.transcribe()
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(audio_content)
            temp_file.flush()
            temp_file_path = temp_file.name

        logger.debug(f"Created temporary WAV file: {temp_file_path}")

        # Extract ISO-639-1 language code if needed (e.g., "en-US" -> "en")
        iso_language = language_code.split('-')[0].lower()
        
        # Use OpenAI Whisper for STT
        with open(temp_file_path, "rb") as f:
            whisper_response = client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                language=iso_language
            )

        # Cleanup the temp file
        os.unlink(temp_file_path)
        logger.debug(f"Cleaned up temporary file: {temp_file_path}")

        # Build a list of transcriptions to match your original return shape
        # Note: Whisper API doesn't provide confidence by default,
        # so you might assign a placeholder or omit it.
        transcriptions = [{
            "transcript": whisper_response.text,
            "confidence": 1.0,  # OpenAI Whisper doesn't provide a confidence score
            "channel_tag": 0
        }]

        return transcriptions

    except Exception as e:
        error_msg = f"Error in transcribe_speech_from_audio: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise Exception(f"Failed to transcribe speech: {str(e)}")


def llm_learner_response(chat_history: List[Dict[str, str]]) -> str:
    """
    Generate a response from an LLM based on the chat history.
    (Retaining Google's Gemini usage for LLM if needed.)
    
    Args:
        chat_history (List[Dict[str, str]]): 
            A list of message dictionaries with the following format:
            {
                "role": "user" | "assistant" | "system",
                "content": "..."
            }
        
    Returns:
        str: The LLM's response
    """
    # Load the Google Gemini API key from environment
    load_dotenv()
    api_key = os.getenv("API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set")

    genai.configure(api_key=api_key)

    # Load the system prompt from prompt.txt
    try:
        prompt_file_path = os.path.join(os.path.dirname(__file__), "prompt.txt")
        with open(prompt_file_path, "r") as file:
            system_prompt = file.read()
    except Exception as e:
        logger.error(f"Error reading prompt file: {str(e)}")
        raise Exception(f"Failed to read prompt file: {str(e)}")

    # Convert to the format Gemini expects
    formatted_messages = []

    # Add system prompt as a user message
    formatted_messages.append({
        "role": "user",
        "parts": [{"text": system_prompt}]
    })

    # Convert chat_history to Gemini roles
    for message in chat_history:
        role = message.get("role", "")
        content = message.get("content", "")

        # Skip system messages (already added the system prompt)
        if role == "system":
            continue

        gemini_role = "model" if role == "assistant" else "user"
        formatted_messages.append({
            "role": gemini_role,
            "parts": [{"text": content}]
        })

    # Define the Gemini model
    model = genai.GenerativeModel(
        'gemini-2.0-flash',
        generation_config={
            "temperature": 0.7,
            "top_p": 0.85,
            "top_k": 40,
            "max_output_tokens": 800,
        },
    )

    try:
        response = model.generate_content(formatted_messages)
        return response.text
    except Exception as e:
        logger.error(f"Error generating LLM response: {str(e)}")
        logger.error(traceback.format_exc())
        raise Exception(f"Failed to generate LLM response: {str(e)}")


class Evaluation(typing.TypedDict):
    knowledge_accuracy: int
    explanation_quality: int
    intuitiveness: int
    overall_score: int


def evaluate(chat_history_json: str) -> Dict[str, int]:
    """
    Evaluate a conversation between a user and an AI assistant using Google's Gemini API.
    
    Args:
        chat_history_json (str): A JSON string with an array of message objects (role + content).
        
    Returns:
        Dict[str, int]: A dictionary with evaluation scores.
    """
    load_dotenv()
    api_key = os.getenv("API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set")

    genai.configure(api_key=api_key)

    model = genai.GenerativeModel(
        'gemini-2.0-flash', 
        generation_config={
            "temperature": 0.7,
            "response_mime_type": "application/json",
        },
    )

    try:
        prompt_file_path = os.path.join(os.path.dirname(__file__), "evaluation_prompt.txt")
        with open(prompt_file_path, "r") as file:
            system_prompt = file.read()
    except Exception as e:
        logger.error(f"Error reading prompt file: {str(e)}")
        raise Exception(f"Failed to read prompt file: {str(e)}")

    logger.debug(f"chat_history_json: {chat_history_json}")

    formatted_messages = []

    # Add system prompt as a user message
    formatted_messages.append({
        "role": "user",
        "parts": [{"text": system_prompt}]
    })

    chat_history = json.loads(chat_history_json)
    for message in chat_history:
        role = message.get("role", "")
        content = message.get("content", "")

        # Skip system messages if you don't want them in the final prompt
        if role == "system":
            continue

        gemini_role = "model" if role == "assistant" else "user"
        formatted_messages.append({
            "role": gemini_role,
            "parts": [{"text": content}]
        })

    try:
        response = model.generate_content(formatted_messages)
        response_text = response.text.strip()

        # Try parsing the returned content as JSON
        try:
            result = json.loads(response_text)
            return result
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse response as JSON: {e}")
            # Return a default structure if parsing fails
            return {
                "knowledge_accuracy": 0,
                "explanation_quality": 0,
                "intuitiveness": 0,
                "overall_score": 0
            }
    except Exception as e:
        logger.error(f"Error generating LLM response: {str(e)}")
        logger.error(traceback.format_exc())
        raise Exception(f"Failed to generate LLM response: {str(e)}")
