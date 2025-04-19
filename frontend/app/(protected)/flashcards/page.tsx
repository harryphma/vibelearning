'use client';

import { useEffect, useState } from 'react';

import { FlashcardDeck } from '@/data/mock-flashcards';
import { useFlashcardStore } from '@/store/flashcard-store';

import { FlashcardChat } from '@/components/flashcard-chat';
import { FlashcardDeckList } from '@/components/flashcard-deck-list';
import { FlashcardViewer } from '@/components/flashcard-viewer';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';

export default function FlashcardsPage() {
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Use the Zustand store for state management
  const { decks, activeDeckId, setDecks, setActiveDeckId, getDeck, getFlashcardsFromActiveDeck } =
    useFlashcardStore();

  // Get selected deck from store based on active deck ID
  const selectedDeck = getDeck(activeDeckId || '');

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
  };

  // Handler for when a new deck is created via the FlashcardChat
  const handleNewDeckCreated = (deck: FlashcardDeck) => {
    setActiveDeckId(deck.id);
    setIsCreateMode(false);
  };

  // Handler for toggling create mode
  const toggleCreateMode = () => {
    setIsCreateMode(!isCreateMode);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="grid flex-1 grid-cols-1 divide-x md:grid-cols-10">
        <div className="border-r md:col-span-2">
          <FlashcardDeckList
            onDeckSelect={handleDeckSelect}
            onCreateNew={toggleCreateMode}
            disableCreateButton={isCreateMode}
            decks={decks}
            selectedDeckId={activeDeckId}
          />
        </div>

        {isCreateMode ? (
          <div className="p-4 md:col-span-8">
            <div className="flex h-full flex-col">
              <div className="mb-4 flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-bold">Create New Flashcard Deck</h2>
                <Button variant="outline" onClick={toggleCreateMode}>
                  Cancel
                </Button>
              </div>
              <div className="flex-1">
                <FlashcardChat onNewDeckCreated={handleNewDeckCreated} isFullPage={true} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center p-4 md:col-span-5">
              <FlashcardViewer title={selectedDeck?.title} deckId={activeDeckId || undefined} />
            </div>
            <div className="border-l md:col-span-3">
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
  );
}
