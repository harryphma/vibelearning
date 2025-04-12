import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

export function AIFeedback() {
  const coveragePercentage = 75

  const feedbackPoints = [
    {
      type: "success",
      text: "Correctly explained the basic definition of photosynthesis",
    },
    {
      type: "success",
      text: "Mentioned chlorophyll as the key pigment",
    },
    {
      type: "warning",
      text: "Did not fully explain the light-dependent reactions",
    },
    {
      type: "warning",
      text: "Missing details about the Calvin cycle",
    },
  ]

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">AI Feedback</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <div className="text-sm font-medium">Content Coverage</div>
              <div className="text-sm font-medium">{coveragePercentage}%</div>
            </div>
            <Progress value={coveragePercentage} className="h-2" />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Feedback Points:</h3>
            <ul className="space-y-2">
              {feedbackPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  {point.type === "success" ? (
                    <CheckCircle className="h-4 w-4 text-mint mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow mt-0.5 flex-shrink-0" />
                  )}
                  <span>{point.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 flex gap-3">
            <Button className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" className="flex-1">
              Next Card
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
