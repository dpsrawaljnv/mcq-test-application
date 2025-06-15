from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, utils
from ..database import get_db
from ..utils import get_current_user, verify_password, create_access_token
from datetime import timedelta
from ..config import settings

router = APIRouter(prefix="/teacher", tags=["teacher"])

@router.post("/login", response_model=schemas.Token)
async def teacher_login(
    username: str,
    password: str,
    db: Session = Depends(get_db)
):
    """Authenticate teacher and return JWT token."""
    teacher = db.query(models.Teacher).filter(
        models.Teacher.username == username
    ).first()
    
    if not teacher or not verify_password(password, teacher.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": teacher.username, "role": "teacher", "id": teacher.id},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/tests", response_model=List[schemas.TestResponse])
async def get_teacher_tests(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all active tests for teacher's classes and subjects."""
    if current_user["role"] != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view tests"
        )
    
    teacher = db.query(models.Teacher).filter(
        models.Teacher.username == current_user["username"]
    ).first()
    
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )
    
    # Get all active tests for teacher's classes and subjects
    tests = db.query(models.Test).filter(
        models.Test.class_id.in_([c.id for c in teacher.classes]),
        models.Test.subject_id.in_([s.id for s in teacher.subjects]),
        models.Test.is_active == True
    ).all()
    
    return tests

@router.post("/questions", response_model=schemas.QuestionResponse)
async def add_question(
    question: schemas.QuestionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Add a new question to a test."""
    if current_user["role"] != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can add questions"
        )
    
    teacher = db.query(models.Teacher).filter(
        models.Teacher.username == current_user["username"]
    ).first()
    
    # Verify test exists and is active
    test = db.query(models.Test).filter(
        models.Test.id == question.test_id,
        models.Test.is_active == True
    ).first()
    
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found or inactive"
        )
    
    # Verify teacher is assigned to this class and subject
    if test.class_id not in [c.id for c in teacher.classes] or \
       test.subject_id not in [s.id for s in teacher.subjects]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add questions to this test"
        )
    
    # Validate media URL if provided
    if question.media_url:
        if not utils.validate_media_url(question.media_url, question.question_type):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid media URL for type {question.question_type}"
            )
    
    # Create question
    db_question = models.Question(
        test_id=question.test_id,
        teacher_id=teacher.id,
        question_text=question.question_text,
        question_type=question.question_type,
        media_url=question.media_url,
        options=question.options,
        correct_option=question.correct_option
    )
    
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    return db_question

@router.get("/questions/{test_id}", response_model=List[schemas.QuestionResponse])
async def get_test_questions(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all questions for a specific test."""
    if current_user["role"] != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view questions"
        )
    
    teacher = db.query(models.Teacher).filter(
        models.Teacher.username == current_user["username"]
    ).first()
    
    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    # Verify teacher is assigned to this class and subject
    if test.class_id not in [c.id for c in teacher.classes] or \
       test.subject_id not in [s.id for s in teacher.subjects]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view questions for this test"
        )
    
    questions = db.query(models.Question).filter(
        models.Question.test_id == test_id
    ).all()
    
    return questions
