"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Plus, Search } from "lucide-react"

type Deck = {
  id: string
  title: string
  cardCount: number
  createdAt: string
}

export function FlashcardDeckList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>("deck1")

  const decks: Deck[] = [
    {
      id: "deck1",
      title: "Biology: Photosynthesis",
      cardCount: 12,
      createdAt: "2023-04-10",
    },
    {
      id: "deck2",
      title: "Spanish Verbs",
      cardCount: 24,
      createdAt: "2023-04-08",
    },
    {
      id: "deck3",
      title: "JavaScript Fundamentals",
      cardCount: 18,
      createdAt: "2023-04-05",
    },
    {
      id: "deck4",
      title: "World History",
      cardCount: 30,
      createdAt: "2023-04-01",
    },
    {
      id: "deck5",
      title: "Chemistry: Periodic Table",
      cardCount: 15,
      createdAt: "2023-03-28",
    },
  ]

  const filteredDecks = decks.filter((deck) => deck.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Button className="w-full mb-4" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create New Deck
        </Button>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search decks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredDecks.length > 0 ? (
            filteredDecks.map((deck) => (
              <button
                key={deck.id}
                className={cn(
                  "w-full text-left p-3 rounded-md mb-1 transition-colors",
                  selectedDeckId === deck.id ? "bg-primary/10 text-primary" : "hover:bg-muted",
                )}
                onClick={() => setSelectedDeckId(deck.id)}
              >
                <div className="font-medium truncate">{deck.title}</div>
                <div className="text-xs text-muted-foreground flex justify-between mt-1">
                  <span>{deck.cardCount} cards</span>
                  <span>{formatDate(deck.createdAt)}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">No decks found</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)
}
