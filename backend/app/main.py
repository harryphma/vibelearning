from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers.tts import router as tts_router
from app.routers.gemini import router as gemini_router
import tempfile
import os


app = FastAPI()

# Include routers
app.include_router(tts_router, prefix="/api")
app.include_router(gemini_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Hello World hehe"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify the allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)







