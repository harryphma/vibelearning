from fastapi import APIRouter, UploadFile, HTTPException, Form, Request, Depends
from typing import Optional
import os
import tempfile
from app.utils import generate_cards, parsePDF_to_text, topic_selection, edit_flashcards
from typing import List, Dict, Any, Optional

router = APIRouter(
    prefix="/gemini",
    tags=["gemini"],
)




@router.post("/auto")
async def auto_generate(request: Request, file: UploadFile):
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

        # Save flashcards to session
        save_flashcards_to_session(request, "auto", cards)
        
        # Clean up the temporary file
        os.unlink(temp_file_path)
        
        return cards
        
    except Exception as e:
        # Clean up the temporary file in case of error
        if 'temp_file_path' in locals():
            os.unlink(temp_file_path)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/manual")
async def manual_generate(request: Request, subject: str = Form(...)):
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
        
        # Save flashcards to session
        save_flashcards_to_session(request, "manual", cards)
            
        return cards
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/edit")
async def edit_flashcards_endpoint(
    request: Request,
    user_input: str = Form(...)
):
    """
    Edit flashcards based on user input.
    
    Args:
        user_input (str): User instructions for modifying the flashcards
        
    Returns:
        dict: A dictionary containing the updated flashcards
    """
    # Get the latest flashcard set from session
    if "flashcards" not in request.session:
        request.session["flashcards"] = {}
    
    # Get the latest flashcard set (either auto or manual)
    latest_type = "auto" if "auto" in request.session["flashcards"] else "manual"
    flashcards = request.session["flashcards"].get(latest_type, [])
    
    if not flashcards:
        raise HTTPException(status_code=404, detail="No flashcards found")
    
    try:
        # Edit flashcards using the Gemini API
        updated_flashcards = edit_flashcards(flashcards, user_input)
        
        # Save updated flashcards to session
        request.session["flashcards"][latest_type] = updated_flashcards
        
        return updated_flashcards
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Helper function to get flashcards from session
def get_flashcards_from_session(request: Request, flashcard_type: str) -> List[Dict[str, str]]:
    """Get flashcards from session or return empty list if not found"""
    if "flashcards" not in request.session:
        request.session["flashcards"] = {}
    
    if flashcard_type not in request.session["flashcards"]:
        request.session["flashcards"][flashcard_type] = []
    
    return request.session["flashcards"][flashcard_type]

# Helper function to save flashcards to session
def save_flashcards_to_session(request: Request, flashcard_type: str, flashcards: List[Dict[str, str]]):
    """Save flashcards to session"""
    if "flashcards" not in request.session:
        request.session["flashcards"] = {}
    
    request.session["flashcards"][flashcard_type] = flashcards

