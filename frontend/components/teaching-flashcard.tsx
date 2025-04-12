"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"

export function TeachingFlashcard() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)

  const flashcards = [
    {
      id: "1",
      question: "What is photosynthesis?",
      answer:
        "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water. Photosynthesis in plants generally involves the green pigment chlorophyll and generates oxygen as a by-product.",
    },
    {
      id: "2",
      question: "What are the main components needed for photosynthesis?",
      answer: "Sunlight, water, carbon dioxide, and chlorophyll.",
    },
  ]

  const currentCard = flashcards[currentCardIndex]

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
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
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Current Flashcard</CardTitle>
          <div className="text-sm text-muted-foreground">
            Card {currentCardIndex + 1} of {flashcards.length}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-2xl cursor-pointer mb-6" onClick={handleFlip}>
            <Card className={cn("border-2", isFlipped ? "border-secondary" : "border-primary")}>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">{isFlipped ? "Answer" : "Question"}</h3>
                <p className="text-lg">{isFlipped ? currentCard.answer : currentCard.question}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <Button variant="outline" size="icon" onClick={handlePrevious} disabled={currentCardIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous card</span>
            </Button>

            <Button variant="outline" onClick={handleFlip}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Flip Card
            </Button>

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
      </CardContent>
    </Card>
  )
}
