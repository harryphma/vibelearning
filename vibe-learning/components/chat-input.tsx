"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Send } from "lucide-react"

export function ChatInput() {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      console.log("Submitted:", input)
      setInput("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask anything or describe what you want to learn..."
        className="min-h-[60px] resize-none pr-20 py-4"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
      />
      <div className="absolute right-2 bottom-2 flex items-center gap-2">
        <Button type="button" size="icon" variant="ghost" className="rounded-full" aria-label="Attach file">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button type="submit" size="icon" className="rounded-full" disabled={!input.trim()} aria-label="Send message">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  )
}
