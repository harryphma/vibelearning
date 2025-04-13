"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Brain, Lightbulb, Award } from "lucide-react"
import { motion } from "framer-motion"

interface EvaluationScore {
  knowledge_accuracy: number
  explanation_quality: number
  intuitiveness: number
  overall_score: number
}

export default function EvaluatePage() {
  const [scores, setScores] = useState<EvaluationScore | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulating API fetch - replace with actual API call
    setTimeout(() => {
      setScores({
        knowledge_accuracy: 10,
        explanation_quality: 9,
        intuitiveness: 9,
        overall_score: 9
      })
      setLoading(false)
    }, 1000)
  }, [])

  const scoreCategories = [
    { 
      name: "Knowledge Accuracy", 
      value: scores?.knowledge_accuracy || 0, 
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
      description: "How accurately you recalled and presented the information"
    },
    { 
      name: "Explanation Quality", 
      value: scores?.explanation_quality || 0, 
      icon: <Brain className="h-5 w-5 text-purple-500" />,
      description: "How clear and comprehensive your explanations were"
    },
    { 
      name: "Intuitiveness", 
      value: scores?.intuitiveness || 0, 
      icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
      description: "How well you connected concepts to intuitive understanding"
    }
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1 flex flex-col">
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">Your Learning Evaluation</h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Overall Score Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Award className="h-16 w-16 text-primary" />
                      <CardTitle className="text-2xl">Overall Score</CardTitle>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="flex items-center justify-center bg-primary text-primary-foreground rounded-full h-32 w-32"
                      >
                        <span className="text-5xl font-bold">{scores?.overall_score}/10</span>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Individual Score Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scoreCategories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                    className="h-full"
                  >
                    <Card className="h-full flex flex-col">
                      <CardHeader className="flex-shrink-0">
                        <div className="flex items-center gap-2">
                          {category.icon}
                          <CardTitle>{category.name}</CardTitle>
                        </div>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col justify-end">
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Score</span>
                            <span className="font-medium">{category.value}/10</span>
                          </div>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.5 + (0.1 * index), duration: 0.8, ease: "easeOut" }}
                          >
                            <Progress value={category.value * 10} className="h-3" />
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
