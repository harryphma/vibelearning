"use client"

import { useState, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { WebcamView } from "@/components/webcam-view"
import { TeachingFlashcard } from "@/components/teaching-flashcard"
import { TeachingChat, TeachingChatHandle } from "@/components/teaching-chat"
import { useFlashcardStore } from "@/store/flashcard-store"

export default function TeachPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const activeTeachingDeck = useFlashcardStore((state) => state.activeTeachingDeck)
  
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
        <div className="md:col-span-4 flex flex-col space-y-4">
          <WebcamView onAudioRecorded={handleAudioRecorded} />
          <TeachingFlashcard />
        </div>
        <div className="md:col-span-8 flex flex-col h-full">
          <TeachingChat ref={teachingChatRef} />
        </div>
      </main>
    </div>
  )
}
