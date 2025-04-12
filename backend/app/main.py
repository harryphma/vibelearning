from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.utils import generate_cards, parsePDF_to_text
import tempfile
import os


app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello World hehe"}

@app.post("/generate")
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
        
        return cards
        
    except Exception as e:
        # Clean up the temporary file in case of error
        if 'temp_file_path' in locals():
            os.unlink(temp_file_path)
        raise HTTPException(status_code=500, detail=str(e))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify the allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)







