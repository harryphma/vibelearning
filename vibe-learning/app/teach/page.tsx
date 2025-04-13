'use client';

import { useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useEvaluationStore } from '@/store/evaluation-store';
import { useFlashcardStore } from '@/store/flashcard-store';
import { Award } from 'lucide-react';

import { Navigation } from '@/components/navigation';
import { TeachingChat, TeachingChatHandle } from '@/components/teaching-chat';
import { TeachingFlashcard } from '@/components/teaching-flashcard';
import { Button } from '@/components/ui/button';
import { WebcamView } from '@/components/webcam-view';

import { evaluateChat } from '@/lib/api/flashcards';

export default function TeachPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const activeTeachingDeck = useFlashcardStore(state => state.activeTeachingDeck);
  const setEvaluationResults = useEvaluationStore(state => state.setEvaluationResults);
  const setLoading = useEvaluationStore(state => state.setLoading);
  const router = useRouter();

  // Create a proper ref for the TeachingChat component
  const teachingChatRef = useRef<TeachingChatHandle>(null);

  // Handle audio recording from WebcamView
  const handleAudioRecorded = async (audioBlob: Blob, chatHistory: string[]) => {
    if (!activeTeachingDeck) return;

    setIsProcessing(true);
    try {
      // Call the handleAudioRecorded method on the TeachingChat component
      if (teachingChatRef.current) {
        await teachingChatRef.current.handleAudioRecorded(audioBlob, chatHistory);
      }
    } catch (error) {
      console.error('Error processing audio recording:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle evaluation button click
  const handleEvaluate = async () => {
    if (!teachingChatRef.current || !activeTeachingDeck) return;

    setIsEvaluating(true);
    setLoading(true); // Set loading state in the store

    try {
      // Get chat history from component
      const messages = teachingChatRef.current.getMessages();

      // Format messages for API
      const chatHistory = messages.map((msg: { sender: string; content: string }) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      // Call API to evaluate chat
      const evaluationResults = await evaluateChat(chatHistory);

      // Store results in the evaluation store
      setEvaluationResults(evaluationResults);

      // Redirect to evaluation page
      router.push('/evaluate');
    } catch (error) {
      console.error('Error evaluating chat:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="grid h-[calc(100vh-64px)] flex-1 grid-cols-1 gap-4 p-4 pb-6 md:grid-cols-12">
        <div className="flex h-full max-h-[calc(100vh-100px)] flex-col space-y-4 md:col-span-4">
          <WebcamView onAudioRecorded={handleAudioRecorded} className="flex-1" />
          <TeachingFlashcard className="flex-1" />
        </div>
        <div className="flex h-full max-h-[calc(100vh-100px)] flex-col md:col-span-8">
          <TeachingChat ref={teachingChatRef} className="flex-1" />
          <Button
            onClick={handleEvaluate}
            disabled={isEvaluating || !activeTeachingDeck}
            className="mt-2 w-full"
            variant="outline"
          >
            <Award className="mr-2 h-4 w-4" />
            {isEvaluating ? 'Evaluating...' : 'Evaluate Teaching'}
          </Button>
        </div>
      </main>
    </div>
  );
}
