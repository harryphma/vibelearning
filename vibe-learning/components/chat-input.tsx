"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Send, X } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string, file?: File | null) => void;
  isDisabled?: boolean;
  placeholder?: string;
  minHeight?: string;
}

export function ChatInput({ 
  onSendMessage, 
  isDisabled = false, 
  placeholder = "Ask anything or describe what you want to learn...",
  minHeight = "60px"
}: ChatInputProps) {
  const [input, setInput] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((input.trim() || selectedFile) && !isDisabled) {
      onSendMessage(input, selectedFile)
      setInput("")
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf"
      />
      
      {selectedFile && (
        <div className="flex items-center justify-between bg-muted px-3 py-2 rounded-t-md">
          <span className="text-sm truncate max-w-[80%]">
            {selectedFile.name}
          </span>
          <Button 
            type="button" 
            size="sm" 
            variant="ghost" 
            className="h-6 w-6 p-0 rounded-full"
            onClick={handleRemoveFile}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      )}
      
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className={`min-h-[${minHeight}] resize-none pr-20 py-4 ${selectedFile ? "rounded-t-none" : ""}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
        disabled={isDisabled}
      />
      <div className="absolute right-2 bottom-2 flex items-center gap-2">
        <Button 
          type="button" 
          size="icon" 
          variant="ghost" 
          className="rounded-full" 
          aria-label="Attach file"
          onClick={handleOpenFileDialog}
          disabled={isDisabled}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button 
          type="submit" 
          size="icon" 
          className="rounded-full" 
          disabled={(!(input.trim() || selectedFile)) || isDisabled}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  )
}
