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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PerformanceStats {
  class_id: number
  class_name: string
  average_score: number
  total_students: number
  top_performers: Array<{
    student_name: string
    roll_no: string
    score: number
  }>
}

interface TopperDetails {
  student_name: string
  roll_no: string
  score: number
  class_name: string
}

export default function PerformancePage() {
  const [stats, setStats] = useState<PerformanceStats[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [toppers, setToppers] = useState<TopperDetails[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPerformanceStats()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchClassToppers(selectedClass)
    }
  }, [selectedClass])

  const fetchPerformanceStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8000/admin/performance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch performance statistics")
      }

      const data = await response.json()
      setStats(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchClassToppers = async (className: string) => {
    try {
      const token = localStorage.getItem("token")
      const classId = stats.find((s) => s.class_name === className)?.class_id
      
      if (!classId) return

      const response = await fetch(
        `http://localhost:8000/admin/toppers/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch class toppers")
      }

      const data = await response.json()
      setToppers(data.toppers)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Performance Analysis</h1>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overall Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Overall Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.length > 0
                ? (
                    stats.reduce((acc, curr) => acc + curr.average_score, 0) /
                    stats.length
                  ).toFixed(2)
                : "0"}
              %
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.reduce((acc, curr) => acc + curr.total_students, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Number of Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Class-wise Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Class-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Total Students</TableHead>
                <TableHead>Average Score</TableHead>
                <TableHead>Pass Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => (
                <TableRow key={stat.class_name}>
                  <TableCell className="font-medium">
                    {stat.class_name}
                  </TableCell>
                  <TableCell>{stat.total_students}</TableCell>
                  <TableCell>{stat.average_score.toFixed(2)}%</TableCell>
                  <TableCell>
                    {((stat.average_score / 100) * 100).toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Class Toppers */}
      <Card>
        <CardHeader>
          <CardTitle>Class Toppers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select
              onValueChange={(value) => setSelectedClass(value)}
              value={selectedClass}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {stats.map((stat) => (
                  <SelectItem key={stat.class_name} value={stat.class_name}>
                    {stat.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClass && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {toppers.map((topper, index) => (
                  <TableRow key={topper.roll_no}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {topper.student_name}
                    </TableCell>
                    <TableCell>{topper.roll_no}</TableCell>
                    <TableCell>{topper.score}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
