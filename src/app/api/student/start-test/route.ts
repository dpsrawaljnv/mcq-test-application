import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const classId = searchParams.get("class_id")
  
  if (!classId) {
    return NextResponse.json(
      { error: "Class ID is required" },
      { status: 400 }
    )
  }

  try {
    const body = await req.json()
    const response = await fetch(
      `http://localhost:8000/student/start-test?class_id=${classId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      throw new Error("Failed to start test")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start test" },
      { status: 500 }
    )
  }
}
