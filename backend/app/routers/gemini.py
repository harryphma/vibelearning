from fastapi import APIRouter, HTTPException, UploadFile, Form
from typing import Optional
import os
import tempfile
from app.utils import generate_cards, parsePDF_to_text, topic_selection

router = APIRouter(
    prefix="/gemini",
    tags=["gemini"],
)


@router.post("/auto")
async def generate_flashcards(file: UploadFile):
    # Check if the file is a PDF
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        # Create a temporary file to store the uploaded PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            # Write the uploaded file content to the temporary file
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Parse PDF to text
        text = parsePDF_to_text(temp_file_path)
        
        # Generate flashcards
        cards = generate_cards(text)
        
        # Clean up the temporary file
        os.unlink(temp_file_path)
        
        return {"flashcards": cards}
        
    except Exception as e:
        # Clean up the temporary file in case of error
        if 'temp_file_path' in locals():
            os.unlink(temp_file_path)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/manual")
async def generate_topic_flashcards(subject: str = Form(...)):
    """
    Generate flashcards based on a subject/topic.
    
    Args:
        subject (str): The subject or topic to generate flashcards for (e.g., "Arithmetic")
        
    Returns:
        dict: A dictionary containing the generated flashcards
    """
    try:
        # Generate flashcards based on the subject
        cards = topic_selection(subject)
        
        if not cards:
            raise HTTPException(status_code=500, detail="Failed to generate flashcards")
            
        return cards
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

