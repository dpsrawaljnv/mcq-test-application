import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: { testId: string } }
) {
  const searchParams = req.nextUrl.searchParams
  const rollNo = searchParams.get("roll_no")
  const section = searchParams.get("section")

  if (!rollNo || !section) {
    return NextResponse.json(
      { error: "Roll number and section are required" },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(
      `http://localhost:8000/student/test-result/${params.testId}?roll_no=${rollNo}&section=${section}`
    )

    if (!response.ok) {
      throw new Error("Failed to fetch test result")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch test result" },
      { status: 500 }
    )
  }
}
