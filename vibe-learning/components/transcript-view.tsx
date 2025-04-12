"use client"

import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"

type TranscriptSegment = {
  id: string
  text: string
  timestamp: string
}

// Add a new type for transcription responses from the backend
type TranscriptionResponse = {
  transcript: string
  confidence: number
  channel_tag: number
}

export function TranscriptView() {
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([
    {
      id: "1",
      text: "Photosynthesis is the process by which plants convert light energy into chemical energy.",
      timestamp: "00:05",
    },
    {
      id: "2",
      text: "This process takes place in the chloroplasts, specifically using the green pigment chlorophyll.",
      timestamp: "00:12",
    },
    {
      id: "3",
      text: "The basic equation for photosynthesis is: carbon dioxide plus water, yielding glucose and oxygen.",
      timestamp: "00:20",
    },
    {
      id: "4",
      text: "Sunlight is captured by chlorophyll in the chloroplasts.",
      timestamp: "00:28",
    },
    {
      id: "5",
      text: "This energy is used to split water molecules, releasing oxygen as a byproduct.",
      timestamp: "00:35",
    },
  ])
  
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1, // Explicitly request mono audio
          sampleRate: 16000, // Match the sample rate expected by Google Speech-to-Text
          echoCancellation: true,
          noiseSuppression: true
        } 
      })
      
      console.log("Audio stream constraints:", stream.getAudioTracks()[0].getSettings());
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus', // Use widely supported format
      });
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await sendAudioToServer(audioBlob)
        setRecordingTime(0)
      }

      mediaRecorder.start()
      setIsRecording(true)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      
      setIsRecording(false)
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const sendAudioToServer = async (audioBlob: Blob) => {
    try {
      console.log("Preparing to send audio to server, blob size:", audioBlob.size);
      console.log("Audio blob type:", audioBlob.type);
      
      const formData = new FormData()
      formData.append('audio_file', audioBlob, 'recording.wav')
      
      console.log("Sending request to:", `${process.env.NEXT_PUBLIC_API_URL}/tts/transcribe`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tts/transcribe`, {
        method: 'POST',
        body: formData,
      })
      
      console.log("Server response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        throw new Error(`Server responded with status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json()
      console.log("Received transcription data:", data);
      
      // Process the transcriptions
      if (data.transcriptions && data.transcriptions.length > 0) {
        const newSegments = data.transcriptions.map((item: TranscriptionResponse, index: number) => ({
          id: `recording-${Date.now()}-${index}`,
          text: item.transcript,
          timestamp: formatTime(recordingTime)
        }))
        
        setTranscriptSegments(prev => [...newSegments, ...prev])
      } else {
        console.log("No transcriptions returned in the response");
      }
    } catch (error) {
      console.error("Error sending audio to server:", error)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isRecording])

  return (
    <Card className="h-auto min-h-[calc(50vh-6rem)] flex flex-col">
      <CardHeader className="p-4">
        <CardTitle className="text-lg">Transcript</CardTitle>
        <div className="flex items-center gap-2">
          {isRecording && (
            <span className="text-sm text-red-500 mr-2">
              Recording: {formatTime(recordingTime)}
            </span>
          )}
          <Button 
            variant={isRecording ? "destructive" : "default"}
            size="sm"
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <Square className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
            {isRecording ? "Stop" : "Record"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ScrollArea className="h-[calc(50vh-10rem)]">
          <div className="p-4 space-y-4">
            {transcriptSegments.map((segment) => (
              <div key={segment.id} className="space-y-1">
                <div className="text-sm">{segment.text}</div>
                <div className="text-xs text-muted-foreground">{segment.timestamp}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
