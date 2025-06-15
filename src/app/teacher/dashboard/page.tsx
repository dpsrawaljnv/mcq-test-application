"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Test {
  id: number
  class_id: number
  subject_id: number
  test_date: string
  is_active: boolean
  class_name: string
  subject_name: string
  total_questions: number
  submissions: number
}

export default function TeacherDashboard() {
  const [tests, setTests] = useState<Test[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  const activeTests = tests.filter((test) => test.is_active)
  const upcomingTests = tests.filter(
    (test) => new Date(test.test_date) > new Date()
  )
  const completedTests = tests.filter(
    (test) => new Date(test.test_date) < new Date() && !test.is_active
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Teacher Dashboard</h1>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Upcoming Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Completed Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTests.length}</div>
          </CardContent>
        </Card>
      </div>

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
                <TableHead>Submissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">
                    {test.class_name}
                  </TableCell>
                  <TableCell>{test.subject_name}</TableCell>
                  <TableCell>
                    {new Date(test.test_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{test.total_questions}</TableCell>
                  <TableCell>{test.submissions}</TableCell>
                </TableRow>
              ))}
              {activeTests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No active tests
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upcoming Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Questions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">
                    {test.class_name}
                  </TableCell>
                  <TableCell>{test.subject_name}</TableCell>
                  <TableCell>
                    {new Date(test.test_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{test.total_questions}</TableCell>
                </TableRow>
              ))}
              {upcomingTests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No upcoming tests
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedTests.slice(0, 5).map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">
                    {test.class_name}
                  </TableCell>
                  <TableCell>{test.subject_name}</TableCell>
                  <TableCell>
                    {new Date(test.test_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className="text-green-600">Completed</span>
                  </TableCell>
                </TableRow>
              ))}
              {completedTests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No recent activity
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
