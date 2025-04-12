"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Edit2, Send, Plus } from "lucide-react"
import { FlashcardDeck, FlashcardData, searchDecks, mockDecks } from "@/data/mock-flashcards"

type Message = {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isLoading?: boolean
}

interface FlashcardChatProps {
  onNewDeckCreated?: (deck: FlashcardDeck) => void;
  selectedDeck?: FlashcardDeck | null;
  isEditMode?: boolean;
  isFullPage?: boolean;
}

export function FlashcardChat({ 
  onNewDeckCreated,
  selectedDeck,
  isEditMode = false,
  isFullPage = false
}: FlashcardChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: isEditMode && selectedDeck 
        ? `You're now editing "${selectedDeck.title}". What would you like to modify or add to this deck?` 
        : "Welcome to the flashcard creator! What subject would you like to create flashcards for?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isAiResponding, setIsAiResponding] = useState(false)

  // Reset messages when selected deck changes or edit mode changes
  useEffect(() => {
    if (isEditMode && selectedDeck) {
      setMessages([{
        id: `deck-${selectedDeck.id}`,
        content: `You're now editing "${selectedDeck.title}". What would you like to modify or add to this deck?`,
        sender: "ai",
        timestamp: new Date(),
      }]);
    } else if (!isEditMode && !selectedDeck) {
      setMessages([{
        id: "new-deck",
        content: "Welcome to the flashcard creator! What subject would you like to create flashcards for?",
        sender: "ai",
        timestamp: new Date(),
      }]);
    }
  }, [isEditMode, selectedDeck]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isAiResponding) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    const loadingMessage: Message = {
      id: `ai-loading-${Date.now()}`,
      content: isEditMode ? "Updating flashcards..." : "Generating flashcards...",
      sender: "ai",
      timestamp: new Date(),
      isLoading: true,
    }

    setMessages([...messages, userMessage, loadingMessage])
    setInput("")
    setIsAiResponding(true)

    // Process the user input
    setTimeout(() => {
      let aiResponse = ""
      let finalDeck: FlashcardDeck | null = null
      
      if (isEditMode && selectedDeck) {
        // In edit mode, simulate updating the selected deck
        finalDeck = {
          ...selectedDeck,
          cards: simulateCardUpdate(selectedDeck.cards, input)
        };
        aiResponse = `I've updated the "${selectedDeck.title}" deck based on your input. The deck now has ${finalDeck.cards.length} cards.`;
      } else {
        // In create mode, look for matching decks or create new ones
        const matchedDeck = searchDecks(input);
        finalDeck = matchedDeck;
        
        // If no direct match but contains arithmetic related words, use arithmetic deck
        const arithmeticTerms = ["math", "arithmetic", "addition", "subtraction", "multiplication", "division", "numbers", "calculation"]
        const inputLower = input.toLowerCase()
        const isArithmeticRelated = arithmeticTerms.some(term => inputLower.includes(term))
        
        if (!matchedDeck && isArithmeticRelated) {
          finalDeck = mockDecks.arithmetic
          aiResponse = `I've created ${mockDecks.arithmetic.cards.length} flashcards about Basic Arithmetic for you! These include multiplication, division, addition and other fundamental operations.`
        } else if (matchedDeck) {
          aiResponse = `I found a deck on "${matchedDeck.title}" with ${matchedDeck.cards.length} cards! I've created this deck for you.`
        } else {
          aiResponse = "I couldn't find a deck matching that subject. Try topics like 'arithmetic', 'biology', or 'programming'."
        }
      }

      // Remove loading message and add real response
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading)
        return [...filteredMessages, {
          id: `ai-${Date.now()}`,
          content: aiResponse,
          sender: "ai",
          timestamp: new Date(),
        }]
      })
      
      // Call the callback function to create/update the deck in the parent component
      if (finalDeck && onNewDeckCreated) {
        onNewDeckCreated(finalDeck)
      }
      
      setIsAiResponding(false)
    }, 1500) // Slightly longer delay for more realistic AI "thinking"
  }

  // Helper function to simulate updating cards based on user input
  function simulateCardUpdate(existingCards: FlashcardData[], userInput: string): FlashcardData[] {
    // This is a simplified simulation - in a real app, you'd likely use AI to generate new cards
    // or modify existing ones based on user input
    const lowercaseInput = userInput.toLowerCase();
    
    // Check if user is asking to add a new card
    if (lowercaseInput.includes("add") || lowercaseInput.includes("new card") || lowercaseInput.includes("create")) {
      // Simulate adding a new card
      const newId = `card-${Date.now()}`;
      const newCard = {
        id: newId,
        question: `New question about ${lowercaseInput.split(" ").slice(-2).join(" ")}?`,
        answer: `Answer related to ${lowercaseInput.split(" ").slice(-2).join(" ")}.`
      };
      
      return [...existingCards, newCard];
    }
    
    // Just return the existing cards if no clear action requested
    return [...existingCards];
  }

  return (
    <div className={cn(
      "flex flex-col h-full",
      isFullPage && "max-w-4xl mx-auto"
    )}>
      <div className="p-4 border-b">
        <h2 className="font-semibold">
          {isEditMode ? "Flashcard Editor" : "Flashcard Creator"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isEditMode 
            ? "Chat with AI to edit and improve your flashcards" 
            : "Chat with AI to create new flashcard decks"
          }
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {message.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="mt-1 text-xs opacity-70">{formatTime(message.timestamp)}</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isEditMode 
              ? "Type what you want to modify or add to this deck..." 
              : "Type a subject (e.g., 'arithmetic', 'biology')..."
            }
            className={cn(
              "resize-none pr-12",
              isFullPage ? "min-h-[120px]" : "min-h-[80px]"
            )}
            disabled={isAiResponding}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e)
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute bottom-2 right-2 rounded-full" 
            disabled={!input.trim() || isAiResponding}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  )
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
  }).format(date)
}
