"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function StudentEntry() {
  const [formData, setFormData] = useState({
    roll_no: "",
    student_name: "",
    section: "",
    class_id: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([
    { id: "1", name: "Class 1" },
    { id: "2", name: "Class 2" },
    { id: "3", name: "Class 3" },
    // Add more classes as needed
  ])
  const router = useRouter()

  const handleStartTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`/api/student/start-test?class_id=${formData.class_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        const errorMessage = data.error || data.detail || "Failed to start test"
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Store student info in localStorage for test submission
      localStorage.setItem("student_info", JSON.stringify({
        roll_no: formData.roll_no,
        student_name: formData.student_name,
        section: formData.section,
        class_id: formData.class_id,
      }))

      // Navigate to test page with test ID
      router.push(`/student/test/${data.test_id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Start Test</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleStartTest} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Roll Number"
                value={formData.roll_no}
                onChange={(e) =>
                  setFormData({ ...formData, roll_no: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Full Name"
                value={formData.student_name}
                onChange={(e) =>
                  setFormData({ ...formData, student_name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Section"
                value={formData.section}
                onChange={(e) =>
                  setFormData({ ...formData, section: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Select
                value={formData.class_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, class_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((class_) => (
                    <SelectItem key={class_.id} value={class_.id}>
                      {class_.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Loading..." : "Start Test"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => router.push("/")}
              className="text-sm text-gray-600"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
