"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { TestResult } from "@/components/test/test-result"
import { getValidatedStudentInfo } from "@/lib/student-auth"

interface Question {
  id: number
  question_text: string
  question_type: string
  media_url?: string
  options: string[]
  correct_option: number
}

interface TestResultData {
  student_name: string
  roll_no: string
  section: string
  score: number
  total_questions: number
  percentage: number
  completed_at: string
  questions: Question[]
  user_answers: Record<number, number>
}

export default function TestResultPage({ params }: { params: { testId: string } }) {
  const [result, setResult] = useState<TestResultData | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchTestResult()
  }, [])

  const fetchTestResult = async () => {
    try {
      const { roll_no, section } = getValidatedStudentInfo()

      const response = await fetch(`/api/student/test-result/${params.testId}?roll_no=${roll_no}&section=${section}`)

      if (!response.ok) {
        throw new Error("Failed to fetch test result")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load test result"
      setError(message)
      if (message.includes("Please log in again")) {
        router.push("/student")
        return
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto">Loading...</div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Result not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Student Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Student Name</p>
                <p className="font-medium">{result.student_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Roll Number</p>
                <p className="font-medium">{result.roll_no}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Section</p>
                <p className="font-medium">{result.section}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed At</p>
                <p className="font-medium">
                  {new Date(result.completed_at).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Result Component */}
        <TestResult
          score={result.score}
          totalQuestions={result.total_questions}
          questions={result.questions}
          userAnswers={result.user_answers}
        />

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={() => router.push("/student")}>
            Take Another Test
          </Button>
          <Button onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
