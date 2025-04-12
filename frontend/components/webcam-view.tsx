"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, CameraOff } from "lucide-react"

export function WebcamView() {
  const [cameraActive, setCameraActive] = useState(false)

  const toggleCamera = () => {
    setCameraActive(!cameraActive)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Camera</CardTitle>
          <Button variant={cameraActive ? "destructive" : "default"} size="sm" onClick={toggleCamera}>
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
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-muted-foreground">Camera would appear here</div>
            </div>
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
  )
}
