"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { FlashcardDeck, FlashcardData } from "@/data/mock-flashcards"
import { ChatInput } from "@/components/chat-input"

type Message = {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isLoading?: boolean
  hasFile?: boolean
  fileName?: string
}

interface FlashcardChatProps {
  onNewDeckCreated?: (deck: FlashcardDeck) => void;
  selectedDeck?: FlashcardDeck | null;
  isEditMode?: boolean;
  isFullPage?: boolean;
}

// API URL - default to localhost if not provided in env
const API_URL ="http://localhost:8000/api";

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
        : "Welcome to the flashcard creator! What subject would you like to create flashcards for? You can also upload a PDF file to generate flashcards.",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [isAiResponding, setIsAiResponding] = useState(false)
  const [awaitingDeckName, setAwaitingDeckName] = useState(false)
  const [pendingFileCards, setPendingFileCards] = useState<FlashcardData[] | null>(null)
  const [pendingSubject, setPendingSubject] = useState<string | null>(null)

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
        content: "Welcome to the flashcard creator! What subject would you like to create flashcards for? You can also upload a PDF file to generate flashcards.",
        sender: "ai",
        timestamp: new Date(),
      }]);
    }
    setAwaitingDeckName(false);
    setPendingFileCards(null);
    setPendingSubject(null);
  }, [isEditMode, selectedDeck]);

  const handleSendMessage = async (message: string, file: File | null = null) => {
    if (isAiResponding) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: message,
      sender: "user",
      timestamp: new Date(),
      hasFile: !!file,
      fileName: file?.name
    }

    const displayContent = file 
      ? `${message ? message + " " : ""}[File: ${file.name}]` 
      : message;

    const userDisplayMessage: Message = {
      ...userMessage,
      content: displayContent,
    };

    const loadingMessage: Message = {
      id: `ai-loading-${Date.now()}`,
      content: isEditMode 
        ? "Updating flashcards..." 
        : file 
          ? "Processing your file..." 
          : awaitingDeckName 
            ? "Creating your deck..." 
            : "Generating flashcards...",
      sender: "ai",
      timestamp: new Date(),
      isLoading: true,
    }

    setMessages(prev => [...prev, userDisplayMessage, loadingMessage]);
    setIsAiResponding(true);

    try {
      if (awaitingDeckName && (pendingFileCards || pendingSubject)) {
        // User is providing a name for the deck
        const deckName = message.trim();
        let finalCards = pendingFileCards;
        
        // If we have pending subject but no cards (text-only flow),
        // create some sample flashcards for this subject if API call failed earlier
        if (!finalCards && pendingSubject) {
          // Fallback cards if API call failed
          finalCards = [
            {
              id: `card-${Date.now()}-1`,
              question: `What is ${pendingSubject}?`,
              answer: `${pendingSubject} is a subject that needs to be learned.`
            },
            {
              id: `card-${Date.now()}-2`,
              question: `Why is ${pendingSubject} important?`,
              answer: `${pendingSubject} is important for understanding key concepts.`
            }
          ];
        }

        if (finalCards) {
          const newDeck: FlashcardDeck = {
            id: `deck-${Date.now()}`,
            title: deckName,
            subject: pendingSubject || deckName.toLowerCase(),
            cards: finalCards,
            createdAt: new Date().toISOString(),
          };

          if (onNewDeckCreated) {
            onNewDeckCreated(newDeck);
          }

          setMessages(prev => {
            const filteredMessages = prev.filter(msg => !msg.isLoading);
            return [...filteredMessages, {
              id: `ai-${Date.now()}`,
              content: `I've created your "${deckName}" deck with ${finalCards.length} flashcards. You can now start studying!`,
              sender: "ai",
              timestamp: new Date(),
            }];
          });
        }

        // Reset states
        setAwaitingDeckName(false);
        setPendingFileCards(null);
        setPendingSubject(null);
      } 
      else if (file) {
        // Handle file upload to generate flashcards
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/gemini/auto`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        // Extract cards from the response - handle both formats
        const cards = result.flashcards || result;
        
        console.log("File upload response:", result);
        
        if (!cards || !Array.isArray(cards)) {
          throw new Error("Invalid response format from server");
        }
        
        // Process cards to ensure they match FlashcardData format
        const processedCards = cards.map((card: any, index: number) => ({
          id: card.id || `card-${Date.now()}-${index}`,
          question: card.question || "Question not available",
          answer: card.answer || "Answer not available"
        }));
        
        // Store the generated cards and ask for deck name
        setPendingFileCards(processedCards);
        setAwaitingDeckName(true);
        
        // Remove loading message and add response asking for deck name
        setMessages(prev => {
          const filteredMessages = prev.filter(msg => !msg.isLoading);
          return [...filteredMessages, {
            id: `ai-${Date.now()}`,
            content: `Great! I've processed your file and created ${processedCards.length} flashcards. What would you like to name this deck?`,
            sender: "ai",
            timestamp: new Date(),
          }];
        });
      } 
      else if (isEditMode && selectedDeck) {
        // In edit mode, update the selected deck
        const updatedCards = simulateCardUpdate(selectedDeck.cards, message);
        const finalDeck = {
          ...selectedDeck,
          cards: updatedCards
        };
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (onNewDeckCreated) {
          onNewDeckCreated(finalDeck);
        }

        setMessages(prev => {
          const filteredMessages = prev.filter(msg => !msg.isLoading);
          return [...filteredMessages, {
            id: `ai-${Date.now()}`,
            content: `I've updated the "${selectedDeck.title}" deck based on your input. The deck now has ${updatedCards.length} cards.`,
            sender: "ai",
            timestamp: new Date(),
          }];
        });
      } 
      else {
        try {
          const response = await fetch(`${API_URL}/gemini/manual`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subject: message.trim() }),
          });
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const cards = await response.json();
          setPendingFileCards(cards);
          setAwaitingDeckName(true);
          setPendingSubject(message.trim());

          setMessages(prev => {
            const filteredMessages = prev.filter(msg => !msg.isLoading);
            return [...filteredMessages, {
              id: `ai-${Date.now()}`,
              content: `I can create ${cards.length} flashcards for the subject "${message}". What would you like to name this deck?`,
              sender: "ai",
              timestamp: new Date(),
            }];
          });
        } catch (error) {
          console.error("Error fetching flashcards:", error);
          setMessages(prev => {
            const filteredMessages = prev.filter(msg => !msg.isLoading);
            return [...filteredMessages, {
              id: `ai-${Date.now()}`,
              content: "Sorry, there was an error processing your request. Please try again.",
              sender: "ai",
              timestamp: new Date(),
            }];
          });
        } finally {
          setIsAiResponding(false);
        }
      }
    } catch (error) {
      console.error("Error processing request:", error);
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        return [...filteredMessages, {
          id: `ai-${Date.now()}`,
          content: "Sorry, there was an error processing your request. Please try again.",
          sender: "ai",
          timestamp: new Date(),
        }];
      });
    } finally {
      setIsAiResponding(false);
    }
  }

  // Helper function to simulate updating cards based on user input
  function simulateCardUpdate(existingCards: FlashcardData[], userInput: string): FlashcardData[] {
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
            : awaitingDeckName
              ? "Please provide a name for your flashcard deck"
              : "Chat with AI to create new flashcard decks or upload a PDF"
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
        <ChatInput
          onSendMessage={handleSendMessage}
          isDisabled={isAiResponding}
          placeholder={
            isEditMode 
              ? "Type what you want to modify or add to this deck..." 
              : awaitingDeckName
                ? "Enter a name for your flashcard deck..."
                : "Type a subject or upload a PDF file..."
          }
          minHeight={isFullPage ? "120px" : "80px"}
        />
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
