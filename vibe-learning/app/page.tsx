'use client';

import { useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useFlashcardStore } from '@/store/flashcard-store';
import { BookOpen, Brain, Lightbulb } from 'lucide-react';

import { ChatInput } from '@/components/chat-input';
import { Navigation } from '@/components/navigation';
import { TTSTest } from '@/components/tts-test';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const router = useRouter();
  const { generateFlashcardDeck, generateFlashcardsFromPDF } = useFlashcardStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const examplePrompts = [
    {
      title: 'Create flashcards about photosynthesis',
      prompt: 'photosynthesis',
      icon: <Lightbulb className="text-primary h-5 w-5" />,
    },
    {
      title: 'Generate a deck on Spanish verb conjugations',
      prompt: 'Spanish verb conjugations',
      icon: <Lightbulb className="text-primary h-5 w-5" />,
    },
    {
      title: 'Make flashcards for JavaScript fundamentals',
      prompt: 'JavaScript fundamentals',
      icon: <Lightbulb className="text-primary h-5 w-5" />,
    },
  ];

  const handlePromptClick = async (prompt: string) => {
    await handleChatInput(prompt);
  };

  const handleChatInput = async (message: string, file: File | null = null) => {
    setIsProcessing(true);

    try {
      let deckId: string | null = null;

      if (file) {
        // Handle PDF file upload
        deckId = await generateFlashcardsFromPDF(file);
      } else if (message.trim()) {
        // Handle text-based flashcard generation
        deckId = await generateFlashcardDeck(message);
      }

      if (deckId) {
        // Navigate to flashcards page after creation
        router.push('/flashcards');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-3xl space-y-4 text-center">
            {/* Added CogniFlow logo */}
            <div className="mb-6 flex justify-center">
              <div className="relative h-40 w-40">
                <Image
                  src="/logo.png"
                  alt="CogniFlow Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Welcome to CogniFlow</h1>
            <p className="text-muted-foreground text-xl">
              Create flashcards, study, and teach concepts back to improve your learning.
            </p>
          </div>

          <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
            {examplePrompts.map((prompt, index) => (
              <Card
                key={index}
                className="hover:border-primary cursor-pointer transition-colors"
                onClick={() => handlePromptClick(prompt.prompt)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  {prompt.icon}
                  <p className="text-sm">{prompt.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            <Button size="lg" className="h-24 text-lg" onClick={() => router.push('/flashcards')}>
              <BookOpen className="mr-2 h-5 w-5" />
              Create Flashcards
            </Button>
            <Button
              size="lg"
              className="h-24 text-lg"
              variant="outline"
              onClick={() => router.push('/teach')}
            >
              <Brain className="mr-2 h-5 w-5" />
              Teach Back
            </Button>
          </div>
        </div>

        <div className="bg-background/80 sticky bottom-0 w-full border-t backdrop-blur-sm">
          <div className="container max-w-3xl py-4">
            <ChatInput
              onSendMessage={handleChatInput}
              isDisabled={isProcessing}
              placeholder="Enter a subject to generate flashcards..."
              minHeight="80px"
            />
            {isProcessing && (
              <div className="text-muted-foreground mt-2 text-center text-sm">
                Creating flashcards... You will be redirected when they are ready.
              </div>
            )}
          </div>
        </div>

        {/* <TTSTest /> */}
      </main>
    </div>
  );
}
