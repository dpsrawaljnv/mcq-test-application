"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Test {
  id: number
  class_id: number
  subject_id: number
  test_date: string
  is_active: boolean
  class_name: string
  subject_name: string
  questions: Question[]
}

interface Question {
  id: number
  question_text: string
  question_type: string
  media_url: string | null
  options: string[]
}

export default function TeacherTests() {
  const [tests, setTests] = useState<Test[]>([])
  const [selectedTest, setSelectedTest] = useState<Test | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  // New question form state
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    question_type: "text",
    media_url: "",
    options: ["", "", "", ""],
    correct_option: 0,
  })

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8000/teacher/tests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch tests")
      }

      const data = await response.json()
      setTests(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async () => {
    try {
      if (!selectedTest) return

      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8000/teacher/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newQuestion,
          test_id: selectedTest.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add question")
      }

      // Reset form and refresh tests
      setNewQuestion({
        question_text: "",
        question_type: "text",
        media_url: "",
        options: ["", "", "", ""],
        correct_option: 0,
      })
      setIsDialogOpen(false)
      fetchTests()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tests Management</h1>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Active Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Active Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests
                .filter((test) => test.is_active)
                .map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">
                      {test.class_name}
                    </TableCell>
                    <TableCell>{test.subject_name}</TableCell>
                    <TableCell>
                      {new Date(test.test_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{test.questions.length}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTest(test)
                          setIsDialogOpen(true)
                        }}
                      >
                        Add Question
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Question Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Select
              value={newQuestion.question_type}
              onValueChange={(value) =>
                setNewQuestion({ ...newQuestion, question_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Question Text"
              value={newQuestion.question_text}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, question_text: e.target.value })
              }
            />

            {newQuestion.question_type !== "text" && (
              <Input
                placeholder="Media URL"
                value={newQuestion.media_url}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, media_url: e.target.value })
                }
              />
            )}

            <div className="space-y-2">
              {newQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...newQuestion.options]
                      newOptions[index] = e.target.value
                      setNewQuestion({ ...newQuestion, options: newOptions })
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNewQuestion({ ...newQuestion, correct_option: index })
                    }
                    className={
                      newQuestion.correct_option === index
                        ? "bg-green-100"
                        : ""
                    }
                  >
                    Correct
                  </Button>
                </div>
              ))}
            </div>

            <Button onClick={handleAddQuestion} className="w-full">
              Add Question
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
