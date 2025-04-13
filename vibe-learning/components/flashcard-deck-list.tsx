"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Plus, Search, BookOpen, Clock } from "lucide-react"
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
  const [animateDeckId, setAnimateDeckId] = useState<string | null>(null)

  // Update selectedDeckId when prop changes
  useEffect(() => {
    if (propSelectedDeckId) {
      setSelectedDeckId(propSelectedDeckId);
      setAnimateDeckId(propSelectedDeckId);
      setTimeout(() => setAnimateDeckId(null), 1000);
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
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-indigo-50/30 rounded-lg border border-indigo-100">
      <div className="p-4 border-b border-indigo-100">
        <Button 
          className="w-full mb-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-sm transition-all"
          size="sm"
          onClick={onCreateNew}
          disabled={disableCreateButton}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Deck
        </Button>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-indigo-400" />
          <Input
            type="search"
            placeholder="Search decks..."
            className="pl-8 border-indigo-200 placeholder:text-indigo-300 focus-visible:ring-indigo-400 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-1">
        <div className="p-2">
          {filteredDecks.length > 0 ? (
            filteredDecks.map((deck) => (
              <button
                key={deck.id}
                className={cn(
                  "w-full text-left p-3 rounded-xl mb-2 transition-all",
                  "hover:shadow-md border",
                  selectedDeckId === deck.id 
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 border-indigo-200 shadow-sm" 
                    : "hover:bg-indigo-50/50 text-gray-700 border-transparent",
                  animateDeckId === deck.id && "animate-appear"
                )}
                onClick={() => handleDeckClick(deck)}
              >
                <div className="font-medium truncate flex items-center">
                  <div className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center mr-2 flex-shrink-0",
                    selectedDeckId === deck.id 
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                      : "bg-gradient-to-br from-indigo-100 to-purple-200 text-indigo-700"
                  )}>
                    <BookOpen className="h-3.5 w-3.5" />
                  </div>
                  {deck.title}
                </div>
                
                <div className="text-xs flex justify-between mt-1.5 pl-9">
                  <span className={cn(
                    "flex items-center",
                    selectedDeckId === deck.id ? "text-indigo-700" : "text-indigo-400"
                  )}>
                    <span className="font-medium">{deck.flashcards?.length || 0}</span>
                    <span className="ml-1">cards</span>
                  </span>
                  
                  <span className={cn(
                    "flex items-center",
                    selectedDeckId === deck.id ? "text-purple-600" : "text-purple-400"
                  )}>
                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                    {formatDate(deck.createdAt)}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 flex items-center justify-center mb-3">
                <BookOpen className="h-6 w-6 text-indigo-300" />
              </div>
              <p className="text-indigo-600 font-medium">No decks found</p>
              <p className="text-xs text-indigo-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
        <div className="h-2"></div>
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
