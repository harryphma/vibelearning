"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";
import { useFlashcardStore } from "@/store/flashcard-store";

interface WebcamViewProps {
  onAudioRecorded?: (audioBlob: Blob, chatHistory: string[]) => Promise<void>;
}

export function WebcamView({ onAudioRecorded }: WebcamViewProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeTeachingDeck = useFlashcardStore((state) => state.activeTeachingDeck);

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

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        if (onAudioRecorded && activeTeachingDeck) {
          // Convert flashcards to chat history format
          const chatHistory = activeTeachingDeck.flashcards.map(card => 
            JSON.stringify({
              role: "system",
              content: `Question: ${card.question}\nAnswer: ${card.answer}`
            })
          );
          console.log("Chat history:", chatHistory);
          
          await onAudioRecorded(audioBlob, chatHistory);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (cameraActive) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          // Store the stream reference
          streamRef.current = stream;
          
          // Only set srcObject if videoRef is still valid
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          } else {
            // If videoRef is not valid, stop the tracks
            stream.getTracks().forEach(track => track.stop());
          }
        })
        .catch((err) => {
          console.error("Error accessing webcam or microphone:", err);
          setCameraActive(false);
        });
    } else {
      // If camera is not active, stop all tracks and recording
      if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => {
          console.log(`Stopping track: ${track.kind} with ID: ${track.id}`);
          track.stop();
        });
        streamRef.current = null;
      }
      
      // Clear the video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    // Cleanup function to ensure the camera is turned off when the component unmounts
    return () => {
      if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => {
          console.log(`Cleanup: Stopping track: ${track.kind} with ID: ${track.id}`);
          track.stop();
        });
        streamRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [cameraActive, isRecording]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Camera</CardTitle>
          <div className="flex gap-2">
            {cameraActive && (
              <Button
                variant={isRecording ? "destructive" : "secondary"}
                size="sm"
                onClick={toggleRecording}
                disabled={!activeTeachingDeck}
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
            
            <Button
              variant={cameraActive ? "destructive" : "default"}
              size="sm"
              onClick={toggleCamera}
            >
              {cameraActive ? (
                <>
                  <CameraOff className="h-4 w-4 mr-2" />
                  Turn Off
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Turn On
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="aspect-video bg-muted relative">
          {cameraActive ? (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="h-12 w-12 text-muted-foreground opacity-20" />
            </div>
          )}
          {cameraActive && (
            <div className="absolute top-2 right-2">
              <div className={`h-3 w-3 ${isRecording ? "bg-red-500" : "bg-green-500"} rounded-full animate-pulse`} />
            </div>
          )}
          {cameraActive && isRecording && (
            <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs flex items-center">
              <Mic className="h-3 w-3 mr-1" />
              Recording...
            </div>
          )}
          {cameraActive && !activeTeachingDeck && !isRecording && (
            <div className="absolute bottom-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded-md text-xs">
              Select a teaching deck to enable recording
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
