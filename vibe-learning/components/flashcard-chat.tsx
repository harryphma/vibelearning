"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FlashcardDeck, FlashcardData } from "@/data/mock-flashcards"
import { ChatInput } from "@/components/chat-input"
import { useFlashcardStore, Message } from "@/store/flashcard-store"
import { editFlashcards, generateFlashcards, generateFlashcardsFromPDF } from "@/lib/api/flashcards"
import { useRouter } from "next/navigation"

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
  const router = useRouter();

  // Use the Zustand store for deck-specific flashcards and messages
  const { 
    setDeckFlashcards,
    getDeckFlashcards,
    addDeck,
    updateDeck,
    deckFlashcards,
    // Add message-related methods
    getDeckMessages,
    addMessageToDeck,
    setDeckMessages,
    setActiveTeachingDeck
  } = useFlashcardStore();

  // Initialize messages state from Zustand store if a deck is selected
  const [messages, setMessages] = useState<Message[]>(() => {
    if (isEditMode && selectedDeck) {
      const storedMessages = getDeckMessages(selectedDeck.id);
      if (storedMessages.length > 0) {
        return storedMessages;
      }
    }
    return [{
      id: "1",
      content: isEditMode && selectedDeck 
        ? `You're now editing "${selectedDeck.title}". What would you like to modify or add to this deck?` 
        : "Welcome to the flashcard creator! What subject would you like to create flashcards for? You can also upload a PDF file to generate flashcards.",
      sender: "ai",
      timestamp: new Date(),
    }];
  });
  
  const [isAiResponding, setIsAiResponding] = useState(false)
  const [awaitingDeckName, setAwaitingDeckName] = useState(false)
  const [pendingFileCards, setPendingFileCards] = useState<FlashcardData[] | null>(null)
  const [pendingSubject, setPendingSubject] = useState<string | null>(null)

  // Only initialize messages when first mounting or when switching to a new deck
  useEffect(() => {
    if (isEditMode && selectedDeck) {
      const storedMessages = getDeckMessages(selectedDeck.id);
      
      // Use stored messages if they exist, otherwise initialize with welcome message
      if (storedMessages.length > 0) {
        setMessages(storedMessages);
      } else {
        const initialMessage = {
          id: `deck-${selectedDeck.id}`,
          content: `You're now editing "${selectedDeck.title}". What would you like to modify or add to this deck?`,
          sender: "ai" as const,
          timestamp: new Date(),
        };
        
        setMessages([initialMessage]);
        // Save this initial message to the store
        setDeckMessages(selectedDeck.id, [initialMessage]);
      }
      
      // Update deckFlashcards in the store when selecting a deck to edit
      if (selectedDeck.cards) {
        setDeckFlashcards(selectedDeck.id, selectedDeck.cards);
      }
    } else if (!isEditMode && !selectedDeck) {
      // Reset messages for creating a new deck
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
  }, [isEditMode, selectedDeck?.id]); // Only trigger when selected deck ID changes, not the entire object

  // Function to update both local state and store messages
  const updateMessages = (newMessages: Message[], deckId?: string) => {
    setMessages(newMessages);
    
    // If in edit mode and we have a valid deck, save messages to store
    if (isEditMode && selectedDeck && deckId) {
      setDeckMessages(deckId, newMessages);
    }
  };
  
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

    // Update messages in both local state and store (if editing)
    const updatedMessages = [...messages, userDisplayMessage, loadingMessage];
    updateMessages(updatedMessages, selectedDeck?.id);
    
    setIsAiResponding(true);

    try {
      if (awaitingDeckName && (pendingFileCards || pendingSubject)) {
        // User is providing a name for the deck
        const deckName = message.trim();
        let finalCards = pendingFileCards;
        
        // ... existing deck creation code ...
        
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

          const filteredMessages = updatedMessages.filter(msg => !msg.isLoading);
          const responseMessage = {
            id: `ai-${Date.now()}`,
            content: `I've created your "${deckName}" deck with ${finalCards.length} flashcards. You can now start studying!`,
            sender: "ai" as const,
            timestamp: new Date(),
          };
          
          const finalMessages = [...filteredMessages, responseMessage];
          updateMessages(finalMessages, deckId);
        }

        // Reset states
        setAwaitingDeckName(false);
        setPendingFileCards(null);
        setPendingSubject(null);
      } 
      else if (file) {
        // ... existing file handling code ...
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
          
          // Remove loading message and add response
          const filteredMessages = updatedMessages.filter(msg => !msg.isLoading);
          const responseMessage = {
            id: `ai-${Date.now()}`,
            content: `Great! I've processed your file and created ${processedCards.length} flashcards. What would you like to name this deck?`,
            sender: "ai" as const,
            timestamp: new Date(),
          };
          
          updateMessages([...filteredMessages, responseMessage]);
        } catch (error) {
          console.error("Error processing file:", error);
          const filteredMessages = updatedMessages.filter(msg => !msg.isLoading);
          const errorMessage = {
            id: `ai-${Date.now()}`,
            content: "Sorry, there was an error processing your file. Please try again.",
            sender: "ai" as const,
            timestamp: new Date(),
          };
          
          updateMessages([...filteredMessages, errorMessage]);
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
          updateDeck(selectedDeck.id, { cards: updatedCards });
          
          // For backward compatibility with the props pattern
          if (onNewDeckCreated) {
            onNewDeckCreated({
              ...selectedDeck,
              cards: updatedCards
            });
          }

          const filteredMessages = updatedMessages.filter(msg => !msg.isLoading);
          const responseMessage = {
            id: `ai-${Date.now()}`,
            content: `I've updated the "${selectedDeck.title}" deck based on your input. The deck now has ${updatedCards.length} cards.`,
            sender: "ai" as const,
            timestamp: new Date(),
          };
          
          updateMessages([...filteredMessages, responseMessage], selectedDeck.id);
        } catch (error) {
          console.error("Error editing flashcards:", error);
          const filteredMessages = updatedMessages.filter(msg => !msg.isLoading);
          const errorMessage = {
            id: `ai-${Date.now()}`,
            content: "Sorry, there was an error updating the flashcards. Please try again.",
            sender: "ai" as const,
            timestamp: new Date(),
          };
          
          updateMessages([...filteredMessages, errorMessage], selectedDeck.id);
        }
      } 
      else {
        // Generate flashcards using subject
        // ... existing subject handling code ...
        try {
          const cards = await generateFlashcards(message.trim());
          
          setPendingFileCards(cards);
          setAwaitingDeckName(true);
          setPendingSubject(message.trim());

          const filteredMessages = updatedMessages.filter(msg => !msg.isLoading);
          const responseMessage = {
            id: `ai-${Date.now()}`,
            content: `I can create ${cards.length} flashcards for the subject "${message}". What would you like to name this deck?`,
            sender: "ai" as const,
            timestamp: new Date(),
          };
          
          updateMessages([...filteredMessages, responseMessage]);
        } catch (error) {
          console.error("Error fetching flashcards:", error);
          const filteredMessages = updatedMessages.filter(msg => !msg.isLoading);
          const errorMessage = {
            id: `ai-${Date.now()}`,
            content: "Sorry, there was an error processing your request. Please try again.",
            sender: "ai" as const,
            timestamp: new Date(),
          };
          
          updateMessages([...filteredMessages, errorMessage]);
        }
      }
    } catch (error) {
      console.error("Error processing request:", error);
      const filteredMessages = updatedMessages.filter(msg => !msg.isLoading);
      const errorMessage = {
        id: `ai-${Date.now()}`,
        content: "Sorry, there was an error processing your request. Please try again.",
        sender: "ai" as const,
        timestamp: new Date(),
      };
      
      updateMessages([...filteredMessages, errorMessage], selectedDeck?.id);
    } finally {
      setIsAiResponding(false);
    }
  }

  const handleTeach = () => {
    if (!selectedDeck) return;
    
    // Get the latest flashcards from the store or the deck
    const flashcardsToUse = getDeckFlashcards(selectedDeck.id);
    
    // Create a complete deck with the latest flashcards
    const deckToTeach = {
      ...selectedDeck,
      flashcards: flashcardsToUse && flashcardsToUse.length > 0 
        ? flashcardsToUse 
        : selectedDeck.cards || []
    };
    
    // Set as active teaching deck and navigate
    setActiveTeachingDeck(deckToTeach);
    console.log("Teaching deck:", deckToTeach);
    console.log("Teaching flashcards:", flashcardsToUse);
    router.push("/teach");
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-gradient-to-br from-white to-indigo-50/20 rounded-lg border border-indigo-100",
      isFullPage && "max-w-4xl mx-auto"
    )}>
      <div className="p-4 border-b border-indigo-100 bg-white flex justify-between items-center">
        <div>
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
        
        {/* Teach button properly positioned in the header */}
        {selectedDeck && ((selectedDeck.cards && selectedDeck.cards.length > 0) || 
                          (getDeckFlashcards(selectedDeck.id) && 
                           getDeckFlashcards(selectedDeck.id).length > 0)) && (
          <Button 
            onClick={handleTeach}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
          >
            Teach with these cards
          </Button>
        )}
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

function formatTime(date: Date | string): string {
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid before formatting
  if (isNaN(dateObject.getTime())) {
    return 'Invalid date';
  }
  
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
  }).format(dateObject);
}
