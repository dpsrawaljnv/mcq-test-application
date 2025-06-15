"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface Teacher {
  id: number
  username: string
  classes: Array<{ id: number; name: string }>
  subjects: Array<{ id: number; name: string }>
}

interface Class {
  id: number
  name: string
}

interface Subject {
  id: number
  name: string
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // New teacher form state
  const [newTeacher, setNewTeacher] = useState({
    username: "",
    password: "",
    class_ids: [] as number[],
    subject_ids: [] as number[],
  })

  useEffect(() => {
    fetchTeachers()
    fetchClassesAndSubjects()
  }, [])

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8000/admin/teachers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch teachers")
      }

      const data = await response.json()
      setTeachers(data)
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

  const handleCreateTeacher = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8000/admin/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTeacher),
      })

      if (!response.ok) {
        throw new Error("Failed to create teacher")
      }

      // Reset form and refresh teachers list
      setNewTeacher({
        username: "",
        password: "",
        class_ids: [],
        subject_ids: [],
      })
      setIsDialogOpen(false)
      fetchTeachers()
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
        <h1 className="text-3xl font-bold">Teachers Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Teacher</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Username"
                value={newTeacher.username}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, username: e.target.value })
                }
              />
              <Input
                type="password"
                placeholder="Password"
                value={newTeacher.password}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, password: e.target.value })
                }
              />
              <Select
                onValueChange={(value) =>
                  setNewTeacher({
                    ...newTeacher,
                    class_ids: [...newTeacher.class_ids, parseInt(value)],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Classes" />
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
                  setNewTeacher({
                    ...newTeacher,
                    subject_ids: [...newTeacher.subject_ids, parseInt(value)],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subjects" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleCreateTeacher} className="w-full">
                Create Teacher
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
          <CardTitle>Teachers List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">
                    {teacher.username}
                  </TableCell>
                  <TableCell>
                    {teacher.classes.map((c) => c.name).join(", ")}
                  </TableCell>
                  <TableCell>
                    {teacher.subjects.map((s) => s.name).join(", ")}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Edit
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
