"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { FlashcardDeckList } from "@/components/flashcard-deck-list"
import { FlashcardViewer } from "@/components/flashcard-viewer"
import { FlashcardChat } from "@/components/flashcard-chat"
import { FlashcardDeck, FlashcardData } from "@/data/mock-flashcards"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function FlashcardsPage() {
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null)
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([])
  const [isCreateMode, setIsCreateMode] = useState(false)
  
  // Moved deck state to parent component
  const [decks, setDecks] = useState<FlashcardDeck[]>([
    {
      id: "deck1",
      title: "Biology: Photosynthesis",
      subject: "biology",
      cards: [
        {
          id: "card1",
          question: "What is photosynthesis?",
          answer: "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water."
        },
        {
          id: "card2",
          question: "What are the main components needed for photosynthesis?",
          answer: "Sunlight, water, carbon dioxide, and chlorophyll."
        }
      ],
      createdAt: "2023-04-10",
    },
    {
      id: "deck2",
      title: "Spanish Verbs",
      subject: "language",
      cards: [],
      createdAt: "2023-04-08",
    }
  ])

  // Initialize with the first deck
  useEffect(() => {
    if (decks.length > 0 && !selectedDeck) {
      setSelectedDeck(decks[0]);
      setFlashcards(decks[0].cards);
    }
  }, [decks, selectedDeck]);

  // Handler for when a deck is selected in the FlashcardDeckList
  const handleDeckSelect = (deck: FlashcardDeck) => {
    setSelectedDeck(deck)
    setFlashcards(deck.cards)
    setIsCreateMode(false)
  }

  // Handler for when a new deck is created via the FlashcardChat
  const handleNewDeckCreated = (deck: FlashcardDeck) => {
    // Add the new deck to the decks array if it doesn't exist already
    setDecks(prevDecks => {
      const existingDeck = prevDecks.find(d => d.id === deck.id);
      
      if (existingDeck) {
        // Update existing deck
        return prevDecks.map(d => d.id === deck.id ? deck : d);
      } else {
        // Add new deck
        return [...prevDecks, {
          ...deck,
          createdAt: new Date().toISOString() // Ensure createdAt is set
        }];
      }
    });
    
    setSelectedDeck(deck)
    setFlashcards(deck.cards)
    setIsCreateMode(false)
  }

  // Handler for toggling create mode
  const toggleCreateMode = () => {
    setIsCreateMode(!isCreateMode)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-10 divide-x">
        <div className="md:col-span-2 border-r">
          <FlashcardDeckList 
            onDeckSelect={handleDeckSelect}
            onCreateNew={toggleCreateMode}
            disableCreateButton={isCreateMode}
            decks={decks}
            selectedDeckId={selectedDeck?.id}
          />
        </div>
        
        {isCreateMode ? (
          <div className="md:col-span-8 p-4">
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h2 className="text-xl font-bold">Create New Flashcard Deck</h2>
                <Button variant="outline" onClick={toggleCreateMode}>
                  Cancel
                </Button>
              </div>
              <div className="flex-1">
                <FlashcardChat 
                  onNewDeckCreated={handleNewDeckCreated} 
                  isFullPage={true}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="md:col-span-5 flex items-center justify-center p-4">
              <FlashcardViewer 
                cards={flashcards}
                title={selectedDeck?.title}
              />
            </div>
            <div className="md:col-span-3 border-l">
              {selectedDeck && (
                <FlashcardChat 
                  onNewDeckCreated={handleNewDeckCreated}
                  selectedDeck={selectedDeck}
                  isEditMode={true} 
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
