interface StudentInfo {
  class_id?: string
  roll_no: string
  student_name: string
  section: string
}

export function getValidatedStudentInfo(requireClassId = false): StudentInfo {
  const studentInfoStr = localStorage.getItem("student_info")
  if (!studentInfoStr) {
    throw new Error("Student information not found. Please log in again.")
  }

  let studentInfo: StudentInfo
  try {
    studentInfo = JSON.parse(studentInfoStr)
  } catch (err) {
    throw new Error("Invalid student information. Please log in again.")
  }

  const { roll_no, student_name, section, class_id } = studentInfo
  if (!roll_no || !student_name || !section || (requireClassId && !class_id)) {
    throw new Error("Incomplete student information. Please log in again.")
  }

  return studentInfo
}
