"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Plus, Search } from "lucide-react"
import { FlashcardDeck } from "@/data/mock-flashcards"

interface FlashcardDeckListProps {
  onDeckSelect?: (deck: FlashcardDeck) => void;
  onCreateNew?: () => void;
  disableCreateButton?: boolean;
  decks: FlashcardDeck[];
  selectedDeckId?: string | null;
}

export function FlashcardDeckList({ 
  onDeckSelect, 
  onCreateNew, 
  disableCreateButton,
  decks,
  selectedDeckId: propSelectedDeckId
}: FlashcardDeckListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(propSelectedDeckId || null)

  // Update selectedDeckId when prop changes
  useEffect(() => {
    if (propSelectedDeckId) {
      setSelectedDeckId(propSelectedDeckId);
    }
  }, [propSelectedDeckId]);
  
  const handleDeckClick = (deck: FlashcardDeck) => {
    setSelectedDeckId(deck.id);
    
    // Notify parent component about selected deck
    if (onDeckSelect) {
      onDeckSelect(deck);
    }
  }

  // Select the first deck initially if none is selected
  useEffect(() => {
    if (decks.length > 0 && !selectedDeckId) {
      const initialDeck = decks[0];
      setSelectedDeckId(initialDeck.id);
      if (onDeckSelect) {
        onDeckSelect(initialDeck);
      }
    }
  }, [decks, selectedDeckId, onDeckSelect]);

  const filteredDecks = decks.filter((deck) => 
    deck.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Button 
          className="w-full mb-4" 
          size="sm"
          onClick={onCreateNew}
          disabled={disableCreateButton}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Deck
        </Button>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search decks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredDecks.length > 0 ? (
            filteredDecks.map((deck) => (
              <button
                key={deck.id}
                className={cn(
                  "w-full text-left p-3 rounded-md mb-1 transition-colors",
                  selectedDeckId === deck.id ? "bg-primary/10 text-primary" : "hover:bg-muted",
                )}
                onClick={() => handleDeckClick(deck)}
              >
                <div className="font-medium truncate">{deck.title}</div>
                <div className="text-xs text-muted-foreground flex justify-between mt-1">
                  <span>{deck.cards.length} cards</span>
                  <span>{formatDate(deck.createdAt)}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">No decks found</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)
}
