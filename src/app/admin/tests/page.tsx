"use client"

import { useState, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"

interface Test {
  id: number
  class_id: number
  subject_id: number
  test_date: string
  is_active: boolean
  class_name?: string
  subject_name?: string
}

interface Class {
  id: number
  name: string
}

interface Subject {
  id: number
  name: string
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()

  // New test form state
  const [newTest, setNewTest] = useState({
    class_id: 0,
    subject_id: 0,
    test_date: "",
  })

  useEffect(() => {
    fetchTests()
    fetchClassesAndSubjects()
  }, [])

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8000/admin/tests", {
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

  const fetchClassesAndSubjects = async () => {
    try {
      const token = localStorage.getItem("token")
      const [classesRes, subjectsRes] = await Promise.all([
        fetch("http://localhost:8000/admin/classes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:8000/admin/subjects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ])

      if (!classesRes.ok || !subjectsRes.ok) {
        throw new Error("Failed to fetch classes or subjects")
      }

      const classesData = await classesRes.json()
      const subjectsData = await subjectsRes.json()

      setClasses(classesData)
      setSubjects(subjectsData)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCreateTest = async () => {
    try {
      if (!selectedDate) {
        throw new Error("Please select a test date")
      }

      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8000/admin/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newTest,
          test_date: selectedDate.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create test")
      }

      // Reset form and refresh tests list
      setNewTest({
        class_id: 0,
        subject_id: 0,
        test_date: "",
      })
      setSelectedDate(undefined)
      setIsDialogOpen(false)
      fetchTests()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleToggleTestStatus = async (testId: number, isActive: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8000/admin/tests/${testId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update test status")
      }

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tests Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Test</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Test</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Select
                onValueChange={(value) =>
                  setNewTest({ ...newTest, class_id: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((class_) => (
                    <SelectItem key={class_.id} value={class_.id.toString()}>
                      {class_.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(value) =>
                  setNewTest({ ...newTest, subject_id: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="border rounded-md p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </div>
              <Button onClick={handleCreateTest} className="w-full">
                Create Test
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tests List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>{test.class_name}</TableCell>
                  <TableCell>{test.subject_name}</TableCell>
                  <TableCell>
                    {new Date(test.test_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={test.is_active}
                      onCheckedChange={(checked) =>
                        handleToggleTestStatus(test.id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to test details/questions
                      }}
                    >
                      View Questions
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
