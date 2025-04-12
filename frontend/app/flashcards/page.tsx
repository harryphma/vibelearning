import { Navigation } from "@/components/navigation"
import { FlashcardDeckList } from "@/components/flashcard-deck-list"
import { FlashcardViewer } from "@/components/flashcard-viewer"
import { FlashcardChat } from "@/components/flashcard-chat"

export default function FlashcardsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-10 divide-x">
        <div className="md:col-span-2 border-r">
          <FlashcardDeckList />
        </div>
        <div className="md:col-span-5 flex items-center justify-center p-4">
          <FlashcardViewer />
        </div>
        <div className="md:col-span-3 border-l">
          <FlashcardChat />
        </div>
      </main>
    </div>
  )
}
