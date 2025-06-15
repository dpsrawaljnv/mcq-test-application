"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { QuestionCard } from "@/components/test/question-card"
import { TestProgress } from "@/components/test/test-progress"
import { getValidatedStudentInfo } from "@/lib/student-auth"

interface Question {
  id: number
  question_text: string
  question_type: string
  media_url?: string
  options: string[]
}

interface TestData {
  test_id: number
  questions: Question[]
  duration_minutes: number
}

export default function TestPage({ params }: { params: { testId: string } }) {
  const [testData, setTestData] = useState<TestData | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchTestData()
  }, [])

  useEffect(() => {
    if (testData) {
      setTimeLeft(testData.duration_minutes * 60)
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [testData])

  const fetchTestData = async () => {
    try {
      const { class_id, roll_no, student_name, section } = getValidatedStudentInfo(true)

      const response = await fetch(
        `/api/student/start-test?class_id=${class_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roll_no,
            student_name,
            section,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch test")
      }

      const data = await response.json()
      setTestData(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load test"
      setError(message)
      if (message.includes("Please log in again")) {
        router.push("/student")
        return
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: number, answer: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const { roll_no, student_name, section } = getValidatedStudentInfo()

      const response = await fetch("/api/student/submit-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test_id: testData?.test_id,
          roll_no,
          student_name,
          section,
          answers,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit test")
      }

      const result = await response.json()
      localStorage.removeItem("student_info")
      router.push(`/student/result/${testData?.test_id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit test"
      setError(message)
      if (message.includes("Please log in again")) {
        router.push("/student")
        return
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!testData) {
    return (
      <div className="container mx-auto py-6">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    )
  }

  const answeredCount = Object.keys(answers).length

  return (
    <div className="container mx-auto py-6 space-y-6">
      <TestProgress
        totalQuestions={testData.questions.length}
        answeredQuestions={answeredCount}
        timeLeft={timeLeft}
      />

      <div className="space-y-6">
        {testData.questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onAnswer={handleAnswer}
            userAnswer={answers[question.id]}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={submitting || answeredCount < testData.questions.length}
        >
          {submitting ? "Submitting..." : "Submit Test"}
        </Button>
      </div>
    </div>
  )
}
