import { Navigation } from "@/components/navigation"
import { WebcamView } from "@/components/webcam-view"
import { TeachingFlashcard } from "@/components/teaching-flashcard"
import { TeachingChat } from "@/components/teaching-chat"

export default function TeachPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
        <div className="md:col-span-4 flex flex-col space-y-4">
          <WebcamView />
          <TeachingFlashcard />
        </div>
        <div className="md:col-span-8 flex flex-col h-full">
          <TeachingChat />
        </div>
      </main>
    </div>
  )
}
