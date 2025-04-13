import { FlashcardData } from "@/data/mock-flashcards";

// API URL - default to localhost if not provided in env
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Generate flashcards from a subject using the AI
 * 
 * @param subject The subject to generate flashcards for
 * @returns Array of FlashcardData
 */
export async function generateFlashcards(subject: string): Promise<FlashcardData[]> {
  const formData = new FormData();
  formData.append('subject', subject.trim());
  
  try {
    const response = await fetch(`${API_URL}/gemini/manual`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const cards = await response.json();
    return processCards(cards);
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
}

/**
 * Generate flashcards from a PDF file
 * 
 * @param file The PDF file to generate flashcards from
 * @returns Array of FlashcardData
 */
export async function generateFlashcardsFromPDF(file: File): Promise<FlashcardData[]> {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${API_URL}/gemini/auto`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    // Extract cards from the response - handle both formats
    const cards = result.flashcards || result;
    
    if (!cards || !Array.isArray(cards)) {
      throw new Error("Invalid response format from server");
    }
    
    return processCards(cards);
  } catch (error) {
    console.error("Error generating flashcards from PDF:", error);
    throw error;
  }
}

/**
 * Edit existing flashcards using the AI
 * 
 * @param userInput The user's input on how to modify the flashcards
 * @param existingCards The current flashcards to edit - should be the most recent from Zustand store
 * @returns Updated array of FlashcardData
 */
export async function editFlashcards(
  userInput: string, 
  existingCards: FlashcardData[]
): Promise<FlashcardData[]> {
  try {
    const formData = new FormData();
    formData.append('user_input', userInput.trim());
    // Fix: Change the form field name from 'flashcards' to 'current_flashcards' to match the backend
    formData.append('current_flashcards', JSON.stringify(existingCards));
    
    console.log("Sending flashcards for edit:", existingCards.length);
    
    const response = await fetch(`${API_URL}/gemini/edit`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    const cards = result.flashcards || result;
    
    if (!cards || !Array.isArray(cards)) {
      throw new Error("Invalid response format from server");
    }
    
    return processCards(cards);
  } catch (error) {
    console.error("Error editing flashcards:", error);
    throw error;
  }
}

/**
 * Helper function to process cards from the API and ensure they match the FlashcardData format
 */
function processCards(cards: any[]): FlashcardData[] {
  return cards.map((card, index) => ({
    id: card.id || `card-${Date.now()}-${index}`,
    question: card.question || "Question not available",
    answer: card.answer || "Answer not available"
  }));
}