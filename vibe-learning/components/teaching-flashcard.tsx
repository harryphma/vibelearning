"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, RotateCw, Sparkles, Lightbulb } from "lucide-react"

export function TeachingFlashcard() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)

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

  // Initial animation
  useEffect(() => {
    setShowAnimation(true);
    const timer = setTimeout(() => setShowAnimation(false), 800);
    return () => clearTimeout(timer);
  }, []);

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
    <Card className={cn(
      "border border-indigo-100 shadow-md overflow-visible",
      showAnimation && "animate-appear"
    )}>
      <CardHeader className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-indigo-900 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-purple-500" />
            Current Flashcard
          </CardTitle>
          <div className="text-sm text-purple-600 font-medium flex items-center gap-2">
            Card {currentCardIndex + 1} of {flashcards.length}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-2xl cursor-pointer mb-6 perspective-1000" onClick={handleFlip}>
            <div className={cn(
              "relative w-full transform-style-3d transition-transform duration-500",
              isFlipped && "rotate-y-180"
            )}>
              {/* Question side */}
              <Card className={cn(
                "border-2 absolute w-full h-full backface-hidden",
                isFlipped ? "invisible" : "visible",
                "border-indigo-100 bg-card-gradient rounded-xl overflow-hidden"
              )}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-800 mb-4 text-center">Question</h3>
                  <p className="text-lg text-center">{currentCard.question}</p>
                  <div className="absolute bottom-3 right-3 opacity-70">
                    <p className="text-xs text-indigo-400">Click to flip</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Answer side */}
              <Card className={cn(
                "border-2 absolute w-full h-full backface-hidden rotate-y-180",
                !isFlipped ? "invisible" : "visible",
                "border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl overflow-hidden"
              )}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-500"></div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-purple-800 mb-4 text-center">Answer</h3>
                  <p className="text-lg text-center">{currentCard.answer}</p>
                  <div className="absolute bottom-3 right-3 opacity-70">
                    <p className="text-xs text-purple-400">Click to flip back</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrevious} 
              disabled={currentCardIndex === 0}
              className="rounded-full border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous card</span>
            </Button>

            <Button 
              variant="outline" 
              onClick={handleFlip}
              className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 hover:border-indigo-300 transition-all"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Flip Card
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentCardIndex === flashcards.length - 1}
              className="rounded-full border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
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
