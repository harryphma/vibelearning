"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Edit2, Send } from "lucide-react"

type Message = {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export function FlashcardChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Welcome to the flashcard editor! How can I help you improve this deck?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: "I've updated the flashcard based on your feedback. Is there anything else you'd like to modify?",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Flashcard Editor</h2>
        <p className="text-sm text-muted-foreground">Chat with AI to edit and improve your flashcards</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-card",
                )}
              >
                <p className="text-sm">{message.content}</p>
                <div className="mt-1 text-xs opacity-70">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="mb-2 flex justify-between">
          <Button variant="outline" size="sm">
            <Edit2 className="h-3 w-3 mr-1" />
            Edit Current Card
          </Button>
        </div>
        <form onSubmit={handleSendMessage} className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[80px] resize-none pr-12"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e)
              }
            }}
          />
          <Button type="submit" size="icon" className="absolute bottom-2 right-2 rounded-full" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
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
