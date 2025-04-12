import os
from dotenv import load_dotenv
from google.cloud import texttospeech
from google.api_core.exceptions import GoogleAPIError
from google.oauth2 import service_account
import logging
from typing import Generator

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TTSClient:
    def __init__(self):
        """Initialize the TTS client with configuration."""
        try:
            # Get API key from environment
            api_key = os.getenv("TTS_API_KEY")
            if not api_key:
                raise ValueError("TTS_API_KEY environment variable not set")

            # Get credentials path and make it relative to the project root if needed
            credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            if not credentials_path:
                raise ValueError("GOOGLE_APPLICATION_CREDENTIALS environment variable not set")

            # Convert to absolute path if it's relative
            if not os.path.isabs(credentials_path):
                credentials_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), credentials_path)

            if not os.path.exists(credentials_path):
                raise FileNotFoundError(f"Credentials file not found at {credentials_path}")

            # Initialize credentials
            credentials = service_account.Credentials.from_service_account_file(
                credentials_path,
                scopes=["https://www.googleapis.com/auth/cloud-platform"]
            )

            # Initialize client with credentials
            self.client = texttospeech.TextToSpeechClient(credentials=credentials)
            
            # Configure voice and audio settings
            self.voice_config = texttospeech.VoiceSelectionParams(
                name="en-US-Chirp3-HD-Charon",
                language_code="en-US",
            )
            self.audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3  # Using MP3 for browser compatibility
            )
            
            logger.info("TTS client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize TTS client: {e}")
            raise

    def synthesize_text(self, text: str) -> bytes:
        """Synthesize text to speech and return the audio content."""
        try:
            synthesis_input = texttospeech.SynthesisInput(text=text)
            response = self.client.synthesize_speech(
                input=synthesis_input,
                voice=self.voice_config,
                audio_config=self.audio_config
            )
            return response.audio_content
        except GoogleAPIError as e:
            logger.error(f"Google TTS API error: {e}")
            raise
        except Exception as e:
            logger.error(f"Error synthesizing text: {e}")
            raise

    def stream_synthesize(self, text_iterator) -> Generator[bytes, None, None]:
        """Stream synthesize text from an iterator and yield audio chunks."""
        try:
            streaming_config = texttospeech.StreamingSynthesizeConfig(
                voice=self.voice_config
            )
            config_request = texttospeech.StreamingSynthesizeRequest(
                streaming_config=streaming_config
            )

            def request_generator():
                yield config_request
                for text in text_iterator:
                    yield texttospeech.StreamingSynthesizeRequest(
                        input=texttospeech.StreamingSynthesisInput(text=text)
                    )

            streaming_responses = self.client.streaming_synthesize(request_generator())
            
            for response in streaming_responses:
                if response.audio_content:
                    yield response.audio_content
                    logger.debug(f"Yielding audio chunk of size: {len(response.audio_content)} bytes")
                    
        except GoogleAPIError as e:
            logger.error(f"Google TTS API error during streaming: {e}")
            raise
        except Exception as e:
            logger.error(f"Error in stream synthesis: {e}")
            raise

def run_streaming_tts_quickstart():
    """Example usage of the TTS client with streaming."""
    try:
        tts_client = TTSClient()
        
        text_iterator = [
            "Hello there. ",
            "How are you ",
            "today? It's ",
            "such nice weather outside.",
        ]

        # Just demonstrate streaming without playing
        for chunk in tts_client.stream_synthesize(text_iterator):
            logger.info(f"Received audio chunk of size: {len(chunk)} bytes")
            
    except Exception as e:
        logger.error(f"Error in quickstart example: {e}")
        raise

if __name__ == "__main__":
    run_streaming_tts_quickstart()