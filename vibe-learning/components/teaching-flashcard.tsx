"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, RotateCw, Sparkles, Lightbulb, BookOpen } from "lucide-react"
import { useFlashcardStore } from "@/store/flashcard-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TeachingFlashcard() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)
  
  const decks = useFlashcardStore((state) => state.decks)
  const activeTeachingDeck = useFlashcardStore((state) => state.activeTeachingDeck)
  const setActiveTeachingDeck = useFlashcardStore((state) => state.setActiveTeachingDeck)
  
  // Get flashcards for the active deck
  const flashcards = activeTeachingDeck?.flashcards || []

  // Initial animation
  useEffect(() => {
    setShowAnimation(true);
    const timer = setTimeout(() => setShowAnimation(false), 800);
    return () => clearTimeout(timer);
  }, []);
  
  // Reset card index when changing decks
  useEffect(() => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
  }, [activeTeachingDeck])

  const currentCard = flashcards[currentCardIndex] || {
    id: "empty",
    question: "No flashcard available",
    answer: "Please select a teaching deck"
  }

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
  
  const handleSelectDeck = (deck) => {
    setActiveTeachingDeck(deck)
  }

  return (
    <Card className={cn(
      "border border-indigo-100 shadow-md overflow-visible flex flex-col",
      showAnimation && "animate-appear"
    )}>
      <CardHeader className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-indigo-900 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-purple-500" />
            {activeTeachingDeck ? (
              <span className="truncate max-w-[150px]" title={activeTeachingDeck.title}>
                {activeTeachingDeck.title}
              </span>
            ) : (
              "Select a Deck"
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {flashcards.length > 0 && (
              <div className="text-sm text-purple-600 font-medium">
                {currentCardIndex + 1} of {flashcards.length}
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-indigo-200 hover:bg-indigo-50">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Decks
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {decks.length === 0 ? (
                  <DropdownMenuItem disabled>No decks available</DropdownMenuItem>
                ) : (
                  decks.map((deck) => (
                    <DropdownMenuItem
                      key={deck.id}
                      onClick={() => handleSelectDeck(deck)}
                      className={cn(
                        "cursor-pointer",
                        activeTeachingDeck?.id === deck.id && "bg-indigo-50 text-indigo-700"
                      )}
                    >
                      {deck.title}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <div className="flex flex-col items-center h-full">
          <div className="w-full max-w-2xl cursor-pointer mb-6 perspective-1000 h-64 md:h-80" onClick={handleFlip}>
            <div className={cn(
              "relative w-full h-full transform-style-3d transition-transform duration-500",
              isFlipped && "rotate-y-180"
            )}>
              {/* Question side */}
              <Card className={cn(
                "border-2 absolute w-full h-full backface-hidden",
                isFlipped ? "invisible" : "visible",
                "border-indigo-100 bg-card-gradient rounded-xl overflow-auto"
              )}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-800 mb-4 text-center">Question</h3>
                  <p className="text-lg text-center flex-grow overflow-auto">{currentCard.question}</p>
                  <div className="opacity-70 text-right mt-4">
                    <p className="text-xs text-indigo-400">Click to flip</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Answer side */}
              <Card className={cn(
                "border-2 absolute w-full h-full backface-hidden rotate-y-180",
                !isFlipped ? "invisible" : "visible",
                "border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl overflow-auto"
              )}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-500"></div>
                <CardContent className="p-6 flex flex-col h-full">
                  <h3 className="text-xl font-semibold text-purple-800 mb-4 text-center">Answer</h3>
                  <p className="text-lg text-center flex-grow overflow-auto">{currentCard.answer}</p>
                  <div className="opacity-70 text-right mt-4">
                    <p className="text-xs text-purple-400">Click to flip back</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex items-center justify-between w-full max-w-md mt-auto">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrevious} 
              disabled={currentCardIndex === 0 || flashcards.length === 0}
              className="rounded-full border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous card</span>
            </Button>

            <Button 
              variant="outline" 
              onClick={handleFlip}
              disabled={flashcards.length === 0}
              className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 hover:border-indigo-300 transition-all"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Flip Card
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentCardIndex === flashcards.length - 1 || flashcards.length === 0}
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
