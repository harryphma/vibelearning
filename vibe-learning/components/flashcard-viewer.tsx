"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { FlashcardData } from "@/data/mock-flashcards"

interface FlashcardViewerProps {
  cards: FlashcardData[];
  title?: string;
}

export function FlashcardViewer({ cards = [], title }: FlashcardViewerProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)

  // Add safety check before accessing cards array
  const currentCard = cards && cards.length > 0 ? cards[currentCardIndex] : null;

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
      <div className="w-full max-w-2xl flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground text-center">
          No flashcards available in this deck. Create some flashcards to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      {title && (
        <h2 className="text-xl font-bold mb-4">{title}</h2>
      )}
      
      <div
        className={cn("w-full aspect-[3/2] perspective-1000 cursor-pointer", isFlipping && "animate-flip")}
        onClick={handleFlip}
      >
        <Card
          className={cn(
            "w-full h-full relative p-8 shadow-lg transform-style-3d transition-transform duration-300",
            isFlipped && "rotate-y-180",
          )}
        >
          <div
            className={cn(
              "absolute inset-0 backface-hidden flex flex-col justify-center items-center p-8 text-center",
              !isFlipped ? "visible" : "invisible",
            )}
          >
            <h3 className="text-2xl font-bold mb-4">Question</h3>
            <p className="text-xl">{currentCard?.question}</p>
          </div>
          <div
            className={cn(
              "absolute inset-0 backface-hidden rotate-y-180 flex flex-col justify-center items-center p-8 text-center",
              isFlipped ? "visible" : "invisible",
            )}
          >
            <h3 className="text-2xl font-bold mb-4">Answer</h3>
            <p className="text-lg">{currentCard?.answer}</p>
          </div>
        </Card>
      </div>

      <div className="mt-8 flex items-center justify-between w-full">
        <Button variant="outline" size="icon" onClick={handlePrevious} disabled={currentCardIndex === 0}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous card</span>
        </Button>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            Card {currentCardIndex + 1} of {cards.length}
          </div>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setIsFlipped(false)}>
            <RotateCcw className="h-3 w-3 mr-2" />
            Reset
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentCardIndex === cards.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next card</span>
        </Button>
      </div>
    </div>
  )
}
