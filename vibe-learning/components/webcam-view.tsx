"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Camera, CameraOff, Mic, MicOff, Send, Download } from "lucide-react";
import { Mic, MicOff, Send, Download } from "lucide-react";
import { useFlashcardStore } from "@/store/flashcard-store";
import { FlashcardData } from "@/data/mock-flashcards";

interface WebcamViewProps {
  onAudioRecorded?: (audioBlob: Blob, chatHistory: string[]) => Promise<void>;
}

export function WebcamView({ onAudioRecorded }: WebcamViewProps) {
  // const [cameraActive, setCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingReady, setRecordingReady] = useState(false);
  const [isSending, setIsSending] = useState(false);
  // const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const activeTeachingDeck = useFlashcardStore((state) => state.activeTeachingDeck);

  /*
  const toggleCamera = () => {
    setCameraActive((prev) => {
      // If turning off, explicitly stop tracks here as well
      if (prev && streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => {
          console.log(`Stopping track: ${track.kind} with ID: ${track.id}`);
          track.stop();
        });
        streamRef.current = null;
      }
      return !prev;
    });
  };
  */

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    // if (!streamRef.current) return;
    
    // Reset recording state
    setRecordingReady(false);
    audioBlobRef.current = null;
    audioChunksRef.current = [];
    
    try {
      // Get audio only stream instead of using existing stream
      navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      }).then(stream => {
        streamRef.current = stream;
        
        // Check if we have an audio track
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) {
          console.error("No audio tracks found in the stream");
          return;
        }
        
        console.log(`Audio tracks available: ${audioTracks.length}`, 
          audioTracks.map(t => `${t.label} (${t.enabled ? 'enabled' : 'disabled'})`));
        
        // Use formats known to work well with most browsers
        let options = {};
        const supportedTypes = [
          'audio/webm',        // Most widely supported in modern browsers
          'audio/webm;codecs=opus',
          'audio/mp4',
          'audio/wav',         // Try WAV format
          'audio/x-wav',
          'audio/wave',
          ''                   // Empty string = browser default
        ];
        
        // Find the first supported MIME type
        for (const type of supportedTypes) {
          if (!type || MediaRecorder.isTypeSupported(type)) {
            if (type) {
              options = { mimeType: type };
              console.log(`Using MIME type: ${type}`);
            } else {
              console.log('Using browser default MIME type');
            }
            break;
          }
        }
        
        // Create a new media recorder instance
        try {
          const mediaRecorder = new MediaRecorder(stream, options);
          mediaRecorderRef.current = mediaRecorder;
          
          mediaRecorder.ondataavailable = (event) => {
            console.log(`Data available event: size=${event.data.size} type=${event.data.type}`);
            if (event.data && event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };
          
          mediaRecorder.onerror = (event) => {
            console.error('MediaRecorder error:', event);
            setIsRecording(false);
          };
          
          mediaRecorder.onstop = async () => {
            console.log(`Recording stopped. Chunks: ${audioChunksRef.current.length}`);
            
            if (audioChunksRef.current.length === 0) {
              console.error("No audio data was captured during recording");
              return;
            }
            
            // Use the format that was actually recorded for better playback compatibility
            const recordedType = audioChunksRef.current[0].type || 'audio/webm';
            const audioBlob = new Blob(audioChunksRef.current, { type: recordedType });
            
            console.log(`Audio blob created: size=${audioBlob.size} type=${audioBlob.type}`);
            audioBlobRef.current = audioBlob;
            setRecordingReady(true);
          };
          
          // Start with a 1000ms (1s) timeslice - more reliable across browsers
          try {
            console.log("MediaRecorder state before start:", mediaRecorder.state);
            mediaRecorder.start(1000);
            console.log("MediaRecorder started successfully:", mediaRecorder.state);
            setIsRecording(true);
          } catch (startError) {
            console.error("Error starting MediaRecorder:", startError);
            // Try without timeslice as fallback
            try {
              mediaRecorder.start();
              console.log("MediaRecorder started without timeslice", mediaRecorder.state);
              setIsRecording(true);
            } catch (fallbackError) {
              console.error("Fatal error starting MediaRecorder:", fallbackError);
              setIsRecording(false);
            }
          }
        } catch (initError) {
          console.error("Error initializing MediaRecorder:", initError);
          throw initError;
        }
    }).catch(err => {
      console.error("Error accessing microphone:", err);
      setIsRecording(false);
    });
  } catch (err) {
    console.error("Error starting recording:", err);
    setIsRecording(false);
  }
};
  
const stopRecording = () => {
  if (mediaRecorderRef.current && isRecording) {
    // Ensure we request one last chunk before stopping
    if (mediaRecorderRef.current.state === "recording") {
      console.log("Requesting final data chunk before stopping");
      mediaRecorderRef.current.requestData();
      
      // Small delay to ensure data is processed before stopping
      setTimeout(() => {
        mediaRecorderRef.current?.stop();
        console.log("MediaRecorder stopped");
        setIsRecording(false);
        
        // Stop all tracks in the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      }, 100);
    } else {
      console.log(`Cannot stop recording: MediaRecorder state is ${mediaRecorderRef.current.state}`);
      setIsRecording(false);
    }
  }
};

const sendRecording = async () => {
  if (!audioBlobRef.current || !activeTeachingDeck || !onAudioRecorded) return;
  
  setIsSending(true);
  try {
    // Use the audio blob in whatever format it was recorded
    const audioToSend = audioBlobRef.current;
    console.log(`Sending audio recording: size=${audioToSend.size} type=${audioToSend.type}`);
    
    // Convert flashcards to chat history format
    console.log(`Active teaching deck: ${activeTeachingDeck.flashcards}`);
    const chatHistory = activeTeachingDeck.flashcards.map((card: FlashcardData) => 
      JSON.stringify({
        role: "system",
        content: `Question: ${card.question}\nAnswer: ${card.answer}`
      })
    );
    
    await onAudioRecorded(audioToSend, chatHistory);
    
    // Reset recording state after successful sending
    setRecordingReady(false);
    audioBlobRef.current = null;
  } catch (err) {
    console.error("Error sending recording:", err);
  } finally {
    setIsSending(false);
  }
};

const cancelRecording = () => {
  setRecordingReady(false);
  audioBlobRef.current = null;
  
  // Also stop any active stream tracks
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }
};

// Function to download the audio recording for debugging
const downloadRecording = () => {
  if (!audioBlobRef.current) return;
  
  if (audioBlobRef.current.size === 0) {
    console.error("Cannot download: audio blob is empty");
    return;
  }
  
  // Make sure we're using a playable format - browser's default might be more compatible
  // than forcing audio/wav which might not be properly encoded
  const actualType = audioBlobRef.current.type || 'audio/webm';
  console.log(`Downloading audio: size=${audioBlobRef.current.size} type=${actualType}`);
  
  // Determine appropriate file extension based on MIME type
  let extension = 'webm'; // Default extension
  if (actualType.includes('wav')) {
    extension = 'wav';
  } else if (actualType.includes('mp4') || actualType.includes('mp4a')) {
    extension = 'mp4';
  } else if (actualType.includes('ogg')) {
    extension = 'ogg';
  }
  
  // Create a URL for the blob
  const url = URL.createObjectURL(audioBlobRef.current);
  
  // Create a link element
  const a = document.createElement('a');
  a.href = url;
  a.download = `recording-${Date.now()}.${extension}`;
  
  // Append to the body, click and remove
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

useEffect(() => {
  // Cleanup function to ensure audio tracks are stopped when the component unmounts
  return () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      console.log("Component cleanup: stopping media recorder");
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
        console.log(`Component cleanup: Stopping track: ${track.kind} with ID: ${track.id}`);
        track.stop();
      });
      streamRef.current = null;
    }
  };
}, []); // Empty dependency array means this only runs on unmount

return (
  <Card className="overflow-hidden">
    <CardHeader className="p-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">Audio Recorder</CardTitle>
        <div className="flex gap-2">
          {!recordingReady && (
            <Button
              variant={isRecording ? "destructive" : "secondary"}
              size="sm"
              onClick={toggleRecording}
              disabled={!activeTeachingDeck || isSending}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Record
                </>
              )}
            </Button>
          )}
          
          {recordingReady && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={cancelRecording}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={sendRecording}
                disabled={isSending}
              >
                {isSending ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadRecording}
                disabled={isSending}
                title="Download recording for debugging"
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-4">
      <div className="bg-muted rounded-md p-6 flex items-center justify-center">
        {isRecording ? (
          <div className="flex flex-col items-center">
            <Mic className="h-12 w-12 text-red-500 animate-pulse" />
            <div className="mt-2 text-sm">Recording audio...</div>
          </div>
        ) : recordingReady ? (
          <div className="flex flex-col items-center">
            <div className="bg-green-100 text-green-800 px-3 py-2 rounded-md">
              Recording ready to send
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Mic className="h-12 w-12 text-muted-foreground opacity-20" />
            <div className="mt-2 text-sm text-muted-foreground">
              {!activeTeachingDeck ? "Select a teaching deck to enable recording" : "Click Record to start"}
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);
}
