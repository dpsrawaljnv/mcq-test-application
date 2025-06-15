from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# Base Schemas
class TeacherBase(BaseModel):
    username: str

class AdminBase(BaseModel):
    username: str

class ClassBase(BaseModel):
    name: str

class SubjectBase(BaseModel):
    name: str

# Create/Update Schemas
class TeacherCreate(TeacherBase):
    password: str
    class_ids: List[int]
    subject_ids: List[int]

class AdminCreate(AdminBase):
    password: str

class TestCreate(BaseModel):
    class_id: int
    subject_id: int
    test_date: datetime

class QuestionCreate(BaseModel):
    test_id: int
    question_text: str
    question_type: str  # text, image, video, or audio
    media_url: Optional[str] = None
    options: List[str]
    correct_option: int

class StudentTestStart(BaseModel):
    roll_no: str
    student_name: str
    section: str

class StudentTestSubmit(BaseModel):
    test_id: int
    roll_no: str
    student_name: str
    section: str
    answers: Dict[str, int]  # question_id: selected_option

# Response Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: str

class TeacherResponse(TeacherBase):
    id: int
    classes: List[ClassBase]
    subjects: List[SubjectBase]

    class Config:
        orm_mode = True

class TestResponse(BaseModel):
    id: int
    class_id: int
    subject_id: int
    test_date: datetime
    is_active: bool
    questions: List[Any] = []

    class Config:
        orm_mode = True

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    question_type: str
    media_url: Optional[str]
    options: List[str]

    class Config:
        orm_mode = True

class StudentTestResponse(BaseModel):
    test_id: int
    questions: List[QuestionResponse]
    duration_minutes: int = 60

    class Config:
        orm_mode = True

class PerformanceResponse(BaseModel):
    class_name: str
    average_score: float
    total_students: int
    top_performers: List[Dict[str, Any]]

    class Config:
        orm_mode = True
