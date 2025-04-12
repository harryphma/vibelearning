import google.generativeai as genai
import PyPDF2
import typing_extensions as typing
import os
from dotenv import load_dotenv
import json


class Card(typing.TypedDict):
    question: str
    answer: str

load_dotenv()
api_key = os.getenv("TTS_API_KEY")

def parsePDF_to_text(file_name):
    #take an input pdf, convert to text
    text = ""
    with open(file_name, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() or ''
    return text

def generate_cards(text):
    genai.configure(api_key=api_key)

    # Define the model and prompt
    model = genai.GenerativeModel(
        'gemini-2.0-flash',  # Using gemini-pro for better JSON handling
        generation_config={
            "temperature": 0.1,
            "top_p": 0.8,
            "top_k": 40,
        }
    )
    
    prompt = f"""
    You are a JSON generator. Your task is to create exactly 5 flashcards from the given text.
    You must respond with ONLY a JSON array containing exactly 5 objects.
    
    Each object in the array must have exactly these two fields:
    - "question": A clear, concise question about the text
    - "answer": The corresponding answer from the text
    
    Example format:
    [
        {{"question": "What is X?", "answer": "X is Y"}},
        {{"question": "How does Z work?", "answer": "Z works by..."}}
    ]
    
    IMPORTANT:
    1. Respond with ONLY the JSON array - no other text, no explanations
    2. The response must start with [ and end with ]
    3. Use double quotes for all strings
    4. Include exactly 5 flashcards
    5. Each flashcard must be unique
    
    Text to process:
    {text}
    """

    try:
        # Generate the flashcards
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Debug: Print the raw response
        # print("Raw response from model:")
        # print(response_text)
        # print("\nResponse length:", len(response_text))
        # print("First character:", repr(response_text[0]) if response_text else "empty")
        # print("Last character:", repr(response_text[-1]) if response_text else "empty")
        
        # Clean the response text
        # Remove any markdown code block markers if present
        response_text = response_text.replace('```json', '').replace('```', '').strip()
        
        # Ensure the response starts with [ and ends with ]
        if not response_text.startswith('['):
            response_text = '[' + response_text
        if not response_text.endswith(']'):
            response_text = response_text + ']'
            
        # Convert the response text to JSON
        flashcards = json.loads(response_text)
        
        if not isinstance(flashcards, list):
            raise ValueError("Response is not a JSON array")
            
        # Format and validate the flashcards
        formatted_flashcards = []
        for card in flashcards:
            if not isinstance(card, dict):
                continue
            question = card.get("question", "").strip()
            answer = card.get("answer", "").strip()
            if question and answer:
                formatted_flashcards.append({"question": question, "answer": answer})
        
        # Ensure we have exactly 5 cards
        if len(formatted_flashcards) != 5:
            raise ValueError(f"Expected 5 cards, got {len(formatted_flashcards)}")
            
        return formatted_flashcards
        
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON response: {e}")
        print(f"Raw response: {response_text}")
        return []
    except Exception as e:
        print(f"Error generating flashcards: {e}")
        print(f"Raw response: {response_text}")
        return []


text = parsePDF_to_text("tech.pdf")
cards = generate_cards(text)
print(json.dumps(cards, indent=2))