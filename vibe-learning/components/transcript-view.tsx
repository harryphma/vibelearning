"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TranscriptSegment = {
  id: string
  text: string
  timestamp: string
}

export function TranscriptView() {
  const transcriptSegments: TranscriptSegment[] = [
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
  ]

  return (
    <Card className="h-auto min-h-[calc(50vh-6rem)] flex flex-col">
      <CardHeader className="p-4">
        <CardTitle className="text-lg">Transcript</CardTitle>
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
