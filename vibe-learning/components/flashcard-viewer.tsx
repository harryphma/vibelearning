"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"

type Flashcard = {
  id: string
  question: string
  answer: string
}

export function FlashcardViewer() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)

  // Sample flashcards
  const flashcards: Flashcard[] = [
    {
      id: "card1",
      question: "What is photosynthesis?",
      answer:
        "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water. Photosynthesis in plants generally involves the green pigment chlorophyll and generates oxygen as a by-product.",
    },
    {
      id: "card2",
      question: "What are the main components needed for photosynthesis?",
      answer: "Sunlight, water, carbon dioxide, and chlorophyll.",
    },
    {
      id: "card3",
      question: "What is the chemical equation for photosynthesis?",
      answer: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
    },
  ]

  const currentCard = flashcards[currentCardIndex]

  const handleFlip = () => {
    if (!isFlipping) {
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
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
    }
  }

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
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
            <p className="text-xl">{currentCard.question}</p>
          </div>
          <div
            className={cn(
              "absolute inset-0 backface-hidden rotate-y-180 flex flex-col justify-center items-center p-8 text-center",
              isFlipped ? "visible" : "invisible",
            )}
          >
            <h3 className="text-2xl font-bold mb-4">Answer</h3>
            <p className="text-lg">{currentCard.answer}</p>
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
            Card {currentCardIndex + 1} of {flashcards.length}
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
          disabled={currentCardIndex === flashcards.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next card</span>
        </Button>
      </div>
    </div>
  )
}
