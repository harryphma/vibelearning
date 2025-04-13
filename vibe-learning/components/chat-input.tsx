"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Send, X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const [isAnimating, setIsAnimating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea on input change
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((input.trim() || selectedFile) && !isDisabled) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
      
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
        <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 rounded-t-xl border border-indigo-100">
          <div className="flex items-center gap-2 truncate max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <FileText className="h-4 w-4 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-indigo-700 truncate">
              {selectedFile.name}
            </span>
          </div>
          <Button 
            type="button" 
            size="sm" 
            variant="ghost" 
            className="h-7 w-7 p-0 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
            onClick={handleRemoveFile}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      )}
      
      <div className={cn(
        "relative overflow-hidden rounded-xl",
        selectedFile ? "rounded-t-none border-t-0" : "",
        "bg-white border border-indigo-100 focus-within:border-indigo-300 focus-within:ring-1 focus-within:ring-indigo-300 transition-all shadow-sm"
      )}>
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className={cn(
            `min-h-[${minHeight}] resize-none pr-24 py-4 border-none focus-visible:ring-0 placeholder:text-indigo-300`
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          disabled={isDisabled}
        />
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          <Button 
            type="button" 
            size="icon" 
            variant="ghost" 
            className="rounded-full h-9 w-9 border border-indigo-100 hover:bg-indigo-50 hover:text-indigo-700 transition-colors" 
            aria-label="Attach file"
            onClick={handleOpenFileDialog}
            disabled={isDisabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button 
            type="submit" 
            size="icon" 
            className={cn(
              "rounded-full h-9 w-9 transition-all",
              "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700",
              "shadow-sm hover:shadow",
              (!(input.trim() || selectedFile)) || isDisabled ? "opacity-50 cursor-not-allowed" : "",
              isAnimating && "scale-90"
            )}
            disabled={(!(input.trim() || selectedFile)) || isDisabled}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  )
}
