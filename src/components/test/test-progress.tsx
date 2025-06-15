"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer } from "lucide-react"

interface TestProgressProps {
  totalQuestions: number
  answeredQuestions: number
  timeLeft?: number
}

export function TestProgress({ totalQuestions, answeredQuestions, timeLeft }: TestProgressProps) {
  const progress = (answeredQuestions / totalQuestions) * 100

  const formatTime = (seconds?: number) => {
    if (!seconds) return "--:--"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span>Test Progress</span>
          {timeLeft !== undefined && (
            <div className="flex items-center gap-2 text-base">
              <Timer className="h-4 w-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={progress} />
          <div className="text-sm text-muted-foreground">
            {answeredQuestions} of {totalQuestions} questions answered
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
