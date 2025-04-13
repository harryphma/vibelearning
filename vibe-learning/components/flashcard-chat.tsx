"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { FlashcardDeck, FlashcardData } from "@/data/mock-flashcards"
import { ChatInput } from "@/components/chat-input"
import { useFlashcardStore } from "@/store/flashcard-store"
import { editFlashcards, generateFlashcards, generateFlashcardsFromPDF } from "@/lib/api/flashcards"

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

export function FlashcardChat({ 
  onNewDeckCreated,
  selectedDeck,
  isEditMode = false,
  isFullPage = false
}: FlashcardChatProps) {
  // Use the Zustand store for deck-specific flashcards
  const { 
    setDeckFlashcards,
    getDeckFlashcards,
    addDeck,
    updateDeck,
    deckFlashcards
  } = useFlashcardStore();

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
      
      // Update deckFlashcards in the store when selecting a deck to edit
      if (selectedDeck.flashcards) {
        setDeckFlashcards(selectedDeck.id, selectedDeck.flashcards);
      }
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
  }, [isEditMode, selectedDeck, setDeckFlashcards]);

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
          const deckId = `deck-${Date.now()}`;
          const newDeck: FlashcardDeck = {
            id: deckId,
            title: deckName,
            description: `Flashcards about ${pendingSubject || deckName}`,
            flashcards: finalCards,
            createdAt: new Date().toISOString(),
          };

          // Store the deck and its flashcards in Zustand
          addDeck(newDeck);
          
          // Also call the onNewDeckCreated prop if provided (for compatibility)
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
        // Handle file upload to generate flashcards using our API function
        try {
          const cards = await generateFlashcardsFromPDF(file);
          
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
        } catch (error) {
          console.error("Error processing file:", error);
          setMessages(prev => {
            const filteredMessages = prev.filter(msg => !msg.isLoading);
            return [...filteredMessages, {
              id: `ai-${Date.now()}`,
              content: "Sorry, there was an error processing your file. Please try again.",
              sender: "ai",
              timestamp: new Date(),
            }];
          });
        }
      } 
      else if (isEditMode && selectedDeck) {
        // In edit mode, send the current flashcards from the Zustand store for editing
        try {
          // Get the most recent flashcards for this deck from the store
          const currentCards = getDeckFlashcards(selectedDeck.id);
          
          // Edit the flashcards based on user input
          const updatedCards = await editFlashcards(message, currentCards);
          
          // Update the flashcards in the store for this specific deck
          setDeckFlashcards(selectedDeck.id, updatedCards);
          
          // Also update the actual deck in the store
          updateDeck(selectedDeck.id, { flashcards: updatedCards });
          
          // For backward compatibility with the props pattern
          if (onNewDeckCreated) {
            onNewDeckCreated({
              ...selectedDeck,
              flashcards: updatedCards
            });
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
        } catch (error) {
          console.error("Error editing flashcards:", error);
          setMessages(prev => {
            const filteredMessages = prev.filter(msg => !msg.isLoading);
            return [...filteredMessages, {
              id: `ai-${Date.now()}`,
              content: "Sorry, there was an error updating the flashcards. Please try again.",
              sender: "ai",
              timestamp: new Date(),
            }];
          });
        }
      } 
      else {
        // Generate flashcards using subject
        try {
          const cards = await generateFlashcards(message.trim());
          
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

  return (
    <div className={cn(
      "flex flex-col h-full bg-gradient-to-br from-white to-indigo-50/20 rounded-lg border border-indigo-100",
      isFullPage && "max-w-4xl mx-auto"
    )}>
      <div className="p-4 border-b border-indigo-100 bg-white">
        <h2 className="font-semibold text-indigo-900 flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs">AI</span>
          </div>
          {isEditMode ? "Flashcard Editor" : "Flashcard Creator"}
        </h2>
        <p className="text-sm text-indigo-600 mt-1">
          {isEditMode 
            ? "Chat with AI to edit and improve your flashcards" 
            : awaitingDeckName
              ? "Please provide a name for your flashcard deck"
              : "Chat with AI to create new flashcard decks or upload a PDF"
          }
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-1">
          {messages.map((message, index) => (
            <div 
              key={message.id} 
              className={cn(
                "flex", 
                message.sender === "user" ? "justify-end" : "justify-start",
                index === messages.length - 1 && !message.isLoading && "animate-appear"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl p-4 shadow-sm",
                  message.sender === "user" 
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-br-none" 
                    : "bg-gradient-to-r from-white to-indigo-50 text-gray-700 border border-indigo-100 rounded-bl-none",
                )}
              >
                {message.isLoading ? (
                  <div className="flex items-center space-x-2 py-1">
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse-dot1"></div>
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse-dot2"></div>
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse-dot3"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="mt-2 text-xs opacity-70 flex justify-between items-center">
                      <span>{formatTime(message.timestamp)}</span>
                      {message.hasFile && (
                        <span className="flex items-center ml-2 bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
                          PDF
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-indigo-100 bg-gradient-to-b from-white to-indigo-50/30">
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
