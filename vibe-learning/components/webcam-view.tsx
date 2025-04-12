"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CameraOff } from "lucide-react";

export function WebcamView() {
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  useEffect(() => {
    if (cameraActive) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
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
          console.error("Error accessing webcam:", err);
          setCameraActive(false);
        });
    } else {
      // If camera is not active, stop all tracks
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
  }, [cameraActive]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Camera</CardTitle>
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
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
