"use client"

import { Navigation } from "@/components/navigation"
import { ChatInput } from "@/components/chat-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Brain, Lightbulb } from "lucide-react"

export default function HomePage() {
  const examplePrompts = [
    {
      title: "Create flashcards about photosynthesis",
      icon: <Lightbulb className="h-5 w-5 text-primary" />,
    },
    {
      title: "Generate a deck on Spanish verb conjugations",
      icon: <Lightbulb className="h-5 w-5 text-primary" />,
    },
    {
      title: "Make flashcards for JavaScript fundamentals",
      icon: <Lightbulb className="h-5 w-5 text-primary" />,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <div className="max-w-3xl w-full text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Welcome to Vibe Learning</h1>
            <p className="text-xl text-muted-foreground">
              Create flashcards, study, and teach concepts back to improve your learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 w-full max-w-3xl">
            {examplePrompts.map((prompt, index) => (
              <Card key={index} className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                  {prompt.icon}
                  <p className="text-sm">{prompt.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            <Button size="lg" className="h-24 text-lg" onClick={() => (window.location.href = "/flashcards")}>
              <BookOpen className="mr-2 h-5 w-5" />
              Create Flashcards
            </Button>
            <Button
              size="lg"
              className="h-24 text-lg"
              variant="outline"
              onClick={() => (window.location.href = "/teach")}
            >
              <Brain className="mr-2 h-5 w-5" />
              Teach Back
            </Button>
          </div>
        </div>

        <div className="sticky bottom-0 w-full border-t bg-background/80 backdrop-blur-sm">
          <div className="container max-w-3xl py-4">
            <ChatInput />
          </div>
        </div>
      </main>
    </div>
  )
}
