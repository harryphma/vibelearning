'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { FlashcardData } from '@/data/mock-flashcards';
import { useFlashcardStore } from '@/store/flashcard-store';
import { BookOpen, ChevronLeft, ChevronRight, RotateCw, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { cn } from '@/lib/utils';

interface FlashcardViewerProps {
  cards?: FlashcardData[];
  title?: string;
  deckId?: string; // Add deckId prop to fetch cards from Zustand store
}

export function FlashcardViewer({ cards: propCards, title, deckId }: FlashcardViewerProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  // Get flashcards from the Zustand store if deckId is provided
  const { getDeckFlashcards, getFlashcardsFromActiveDeck } = useFlashcardStore();

  // Determine which cards to use - prefer Zustand store cards if deckId is provided
  const cards = deckId ? getDeckFlashcards(deckId) : propCards || [];

  console.log('Cards from Zustand store:', cards);

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
      setIsFlipping(true);
      setTimeout(() => {
        setIsFlipped(!isFlipped);
        setIsFlipping(false);
      }, 550); // Increased to 550ms to match CSS duration + small buffer
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="flex w-full max-w-2xl flex-col items-center justify-center rounded-2xl border border-purple-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-8 shadow-sm">
        <BookOpen className="mb-4 h-12 w-12 text-indigo-300 opacity-70" />
        <p className="text-center font-medium text-indigo-600">
          No flashcards available in this deck. Create some flashcards to get started!
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex w-full max-w-2xl flex-col items-center',
        showAnimation && 'animate-appear'
      )}
    >
      {title && (
        <div className="relative mb-6 flex items-center gap-2">
          <h2 className="text-xl font-semibold text-indigo-900">{title}</h2>
          <div className="absolute top-0 -right-8">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-purple-500"></span>
            </span>
          </div>
        </div>
      )}

      <div
        className={cn('perspective-1000 relative aspect-[3/2] w-full cursor-pointer')}
        onClick={handleFlip}
      >
        <div
          className={cn(
            'transform-style-3d relative h-full w-full transition-transform duration-500 ease-in-out', // Increased duration and added easing
            isFlipped && 'rotate-y-180'
          )}
        >
          {/* Question side */}
          <div
            className={cn(
              'absolute inset-0 rounded-2xl backface-hidden',
              !isFlipped ? 'visible' : 'invisible'
            )}
          >
            <Card className="bg-card-gradient flex h-full w-full flex-col justify-center overflow-hidden rounded-2xl border-2 border-indigo-100 shadow-lg">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-100 to-purple-100">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <h3 className="mb-2 text-center text-lg font-semibold text-indigo-800">Question</h3>
              <div className="max-h-[240px] overflow-auto px-8 py-4">
                <p className="text-center text-lg">{currentCard?.question}</p>
              </div>
              <div className="absolute right-3 bottom-3 opacity-70">
                <p className="text-xs text-indigo-400">Click to flip</p>
              </div>
            </Card>
          </div>

          {/* Answer side */}
          <div
            className={cn(
              'absolute inset-0 rotate-y-180 rounded-2xl backface-hidden',
              isFlipped ? 'visible' : 'invisible'
            )}
          >
            <Card className="flex h-full w-full flex-col justify-center overflow-hidden rounded-2xl border-2 border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-lg">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-500"></div>
              <h3 className="mb-2 text-center text-lg font-semibold text-purple-800">Answer</h3>
              <div className="max-h-[240px] overflow-auto px-8 py-4">
                <p className="text-center text-lg">{currentCard?.answer}</p>
              </div>
              <div className="absolute right-3 bottom-3 opacity-70">
                <p className="text-xs text-purple-400">Click to flip back</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="mt-8 flex w-full items-center justify-between">
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
          <div className="text-sm font-medium text-purple-600">
            Card {currentCardIndex + 1} of {cards.length}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800"
            onClick={() => setIsFlipped(false)}
          >
            <RotateCw className="mr-2 h-3 w-3" />
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
  );
}
