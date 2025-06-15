"use client"

import { useEffect, useState } from "react"
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

interface PerformanceStats {
  class_name: string
  average_score: number
  total_students: number
  top_performers: Array<{
    student_name: string
    roll_no: string
    score: number
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PerformanceStats[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:8000/admin/performance", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch statistics")
        }

        const data = await response.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.reduce((acc, curr) => acc + curr.total_students, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.reduce(
                (acc, curr) => acc + curr.top_performers.length,
                0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class-wise Performance Table */}
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
                <TableHead>Top Performer</TableHead>
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
                    {stat.top_performers[0]?.student_name || "N/A"} (
                    {stat.top_performers[0]?.score || "N/A"})
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers Across All Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats
                .flatMap((stat) =>
                  stat.top_performers.map((performer) => ({
                    ...performer,
                    class_name: stat.class_name,
                  }))
                )
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((performer, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {performer.student_name}
                    </TableCell>
                    <TableCell>{performer.roll_no}</TableCell>
                    <TableCell>{performer.class_name}</TableCell>
                    <TableCell>{performer.score}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
