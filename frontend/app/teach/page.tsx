import { Navigation } from "@/components/navigation"
import { WebcamView } from "@/components/webcam-view"
import { TranscriptView } from "@/components/transcript-view"
import { TeachingFlashcard } from "@/components/teaching-flashcard"
import { AIFeedback } from "@/components/ai-feedback"

export default function TeachPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
        <div className="md:col-span-4 space-y-4">
          <WebcamView />
          <TranscriptView />
        </div>
        <div className="md:col-span-8 space-y-4">
          <TeachingFlashcard />
          <AIFeedback />
        </div>
      </main>
    </div>
  )
}
