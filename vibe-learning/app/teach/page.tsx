"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { WebcamView } from "@/components/webcam-view"
import { TeachingFlashcard } from "@/components/teaching-flashcard"
import { TeachingChat, TeachingChatHandle } from "@/components/teaching-chat"
import { useFlashcardStore } from "@/store/flashcard-store"
import { Button } from "@/components/ui/button"
import { Award } from "lucide-react"
import { evaluateChat } from "@/lib/api/flashcards"

export default function TeachPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const activeTeachingDeck = useFlashcardStore((state) => state.activeTeachingDeck)
  const router = useRouter()
  
  // Create a proper ref for the TeachingChat component
  const teachingChatRef = useRef<TeachingChatHandle>(null)

  // Handle audio recording from WebcamView
  const handleAudioRecorded = async (audioBlob: Blob, chatHistory: string[]) => {
    if (!activeTeachingDeck) return

    setIsProcessing(true)
    try {
      // Call the handleAudioRecorded method on the TeachingChat component
      if (teachingChatRef.current) {
        await teachingChatRef.current.handleAudioRecorded(audioBlob, chatHistory)
      }
    } catch (error) {
      console.error("Error processing audio recording:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle evaluation button click
  const handleEvaluate = async () => {
    if (!teachingChatRef.current || !activeTeachingDeck) return
    
    setIsEvaluating(true)
    try {
      // Get chat history from component
      const messages = teachingChatRef.current.getMessages();
      
      // Format messages for API
      const chatHistory = messages.map((msg: { sender: string; content: string }) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content
      }));
      
      // Call API to evaluate chat
      const evaluationResults = await evaluateChat(chatHistory);
      
      // Store results in sessionStorage for the evaluation page
      sessionStorage.setItem('evaluationResults', JSON.stringify(evaluationResults));
      
      // Redirect to evaluation page
      router.push('/evaluate');
    } catch (error) {
      console.error("Error evaluating chat:", error);
    } finally {
      setIsEvaluating(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
        <div className="md:col-span-4 flex flex-col space-y-4">
          <WebcamView onAudioRecorded={handleAudioRecorded} />
          <TeachingFlashcard />
          <Button 
            onClick={handleEvaluate} 
            disabled={isEvaluating || !activeTeachingDeck}
            className="mt-2 w-full"
            variant="outline"
          >
            <Award className="mr-2 h-4 w-4" />
            {isEvaluating ? "Evaluating..." : "Evaluate Teaching"}
          </Button>
        </div>
        <div className="md:col-span-8 flex flex-col h-full">
          <TeachingChat ref={teachingChatRef} />
        </div>
      </main>
    </div>
  )
}
