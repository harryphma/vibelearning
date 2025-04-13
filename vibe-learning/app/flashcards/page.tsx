"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { FlashcardDeckList } from "@/components/flashcard-deck-list"
import { FlashcardViewer } from "@/components/flashcard-viewer"
import { FlashcardChat } from "@/components/flashcard-chat"
import { FlashcardDeck } from "@/data/mock-flashcards"
import { Button } from "@/components/ui/button"
import { useFlashcardStore } from "@/store/flashcard-store"

export default function FlashcardsPage() {
  const [isCreateMode, setIsCreateMode] = useState(false)
  
  // Use the Zustand store for state management
  const {
    decks,
    activeDeckId,
    setDecks,
    setActiveDeckId,
    getDeck,
    getFlashcardsFromActiveDeck,
  } = useFlashcardStore();
  
  // Get selected deck from store based on active deck ID
  const selectedDeck = getDeck(activeDeckId || "");

  // Initialize with the first deck if no active deck is set
  useEffect(() => {
    if (decks.length > 0 && !activeDeckId) {
      setActiveDeckId(decks[0].id);
    }
  }, [decks, activeDeckId, setActiveDeckId]);

  // Handler for when a deck is selected in the FlashcardDeckList
  const handleDeckSelect = (deck: FlashcardDeck) => {
    setActiveDeckId(deck.id);
    setIsCreateMode(false);
  }

  // Handler for when a new deck is created via the FlashcardChat
  const handleNewDeckCreated = (deck: FlashcardDeck) => {
    setActiveDeckId(deck.id);
    setIsCreateMode(false);
  }

  // Handler for toggling create mode
  const toggleCreateMode = () => {
    setIsCreateMode(!isCreateMode);
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
            selectedDeckId={activeDeckId}
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
                title={selectedDeck?.title}
                deckId={activeDeckId || undefined}
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
