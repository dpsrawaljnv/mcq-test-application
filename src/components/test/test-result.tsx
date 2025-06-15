"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuestionCard } from "./question-card"

interface TestResultProps {
  score: number
  totalQuestions: number
  questions: Array<{
    id: number
    question_text: string
    question_type: string
    media_url?: string
    options: string[]
    correct_option: number
  }>
  userAnswers: Record<number, number>
}

export function TestResult({ score, totalQuestions, questions, userAnswers }: TestResultProps) {
  const percentage = (score / totalQuestions) * 100
  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400"
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-2">
            <div className={`text-4xl font-bold ${getScoreColor()}`}>
              {score}/{totalQuestions}
            </div>
            <div className="text-lg text-muted-foreground">
              {percentage.toFixed(1)}% Score
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Answer Review</h3>
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onAnswer={() => {}}
            showCorrect={true}
            userAnswer={userAnswers[question.id]}
          />
        ))}
      </div>
    </div>
  )
}
