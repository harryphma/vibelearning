"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, RotateCw, Sparkles, BookOpen } from "lucide-react"
import { FlashcardData } from "@/data/mock-flashcards"
import { useFlashcardStore } from "@/store/flashcard-store"

interface FlashcardViewerProps {
  cards?: FlashcardData[];
  title?: string;
  deckId?: string; // Add deckId prop to fetch cards from Zustand store
}

export function FlashcardViewer({ cards: propCards, title, deckId }: FlashcardViewerProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  
  // Get flashcards from the Zustand store if deckId is provided
  const { getDeckFlashcards, getFlashcardsFromActiveDeck } = useFlashcardStore();
  
  // Determine which cards to use - prefer Zustand store cards if deckId is provided
  const cards = deckId 
    ? getDeckFlashcards(deckId)
    : propCards || [];

  // Add safety check before accessing cards array
  const currentCard = cards && cards.length > 0 ? cards[currentCardIndex] : null;

  // Show animation when component first mounts or cards change
  useEffect(() => {
    setShowAnimation(true);
    const timer = setTimeout(() => setShowAnimation(false), 800);
    return () => clearTimeout(timer);
  }, [cards]);

  const handleFlip = () => {
    if (!isFlipping && cards.length > 0) {
      setIsFlipping(true)
      setTimeout(() => {
        setIsFlipped(!isFlipped)
        setIsFlipping(false)
      }, 300)
    }
  }

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
    }
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="w-full max-w-2xl flex flex-col items-center justify-center p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-sm border border-purple-100">
        <BookOpen className="h-12 w-12 text-indigo-300 mb-4 opacity-70" />
        <p className="text-indigo-600 text-center font-medium">
          No flashcards available in this deck. Create some flashcards to get started!
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full max-w-2xl flex flex-col items-center",
      showAnimation && "animate-appear"
    )}>
      {title && (
        <div className="relative mb-6 flex items-center gap-2">
          <h2 className="text-xl font-semibold text-indigo-900">{title}</h2>
          <div className="absolute -right-8 top-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </span>
          </div>
        </div>
      )}
      
      <div
        className={cn(
          "w-full aspect-[3/2] perspective-1000 cursor-pointer relative"
        )}
        onClick={handleFlip}
      >
        <div
          className={cn(
            "w-full h-full relative transform-style-3d transition-transform duration-100", // Changed from 500ms to 300ms
            isFlipped && "rotate-y-180",
          )}
        >
          {/* Question side */}
          <div
            className={cn(
              "absolute inset-0 backface-hidden rounded-2xl",
              !isFlipped ? "visible" : "invisible",
            )}
          >
            <Card
              className="w-full h-full border-2 border-indigo-100 shadow-lg flex flex-col justify-center bg-card-gradient rounded-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-center text-lg font-semibold text-indigo-800 mb-2">Question</h3>
              <div className="px-8 py-4 max-h-[240px] overflow-auto">
                <p className="text-lg text-center">{currentCard?.question}</p>
              </div>
              <div className="absolute bottom-3 right-3 opacity-70">
                <p className="text-xs text-indigo-400">Click to flip</p>
              </div>
            </Card>
          </div>

          {/* Answer side */}
          <div
            className={cn(
              "absolute inset-0 backface-hidden rotate-y-180 rounded-2xl",
              isFlipped ? "visible" : "invisible",
            )}
          >
            <Card
              className="w-full h-full border-2 border-purple-100 shadow-lg flex flex-col justify-center bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-500"></div>
              <h3 className="text-center text-lg font-semibold text-purple-800 mb-2">Answer</h3>
              <div className="px-8 py-4 max-h-[240px] overflow-auto">
                <p className="text-lg text-center">{currentCard?.answer}</p>
              </div>
              <div className="absolute bottom-3 right-3 opacity-70">
                <p className="text-xs text-purple-400">Click to flip back</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between w-full">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePrevious} 
          disabled={currentCardIndex === 0}
          className="rounded-full border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous card</span>
        </Button>

        <div className="text-center">
          <div className="text-sm text-purple-600 font-medium">
            Card {currentCardIndex + 1} of {cards.length}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50" 
            onClick={() => setIsFlipped(false)}
          >
            <RotateCw className="h-3 w-3 mr-2" />
            Flip back
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentCardIndex === cards.length - 1}
          className="rounded-full border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next card</span>
        </Button>
      </div>
    </div>
  )
}
