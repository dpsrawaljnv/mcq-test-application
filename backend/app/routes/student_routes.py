from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, utils
from ..database import get_db
from datetime import datetime

router = APIRouter(prefix="/student", tags=["student"])

@router.post("/start-test", response_model=schemas.StudentTestResponse)
async def start_test(
    student_info: schemas.StudentTestStart,
    class_id: int,
    db: Session = Depends(get_db)
):
    """Start a test for a student."""
    # Get active test for the class
    test = db.query(models.Test).filter(
        models.Test.class_id == class_id,
        models.Test.is_active == True
    ).first()
    
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active test found for this class"
        )
    
    # Check if student has already attempted this test
    existing_attempt = db.query(models.StudentAttempt).filter(
        models.StudentAttempt.test_id == test.id,
        models.StudentAttempt.roll_no == student_info.roll_no,
        models.StudentAttempt.section == student_info.section
    ).first()
    
    if existing_attempt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already attempted this test"
        )
    
    # Get questions for the test
    questions = db.query(models.Question).filter(
        models.Question.test_id == test.id
    ).all()
    
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No questions found for this test"
        )
    
    # Remove correct_option from questions
    for question in questions:
        question.correct_option = None
    
    return {
        "test_id": test.id,
        "questions": questions,
        "duration_minutes": 60  # Can be made configurable
    }

@router.post("/submit-test")
async def submit_test(
    submission: schemas.StudentTestSubmit,
    db: Session = Depends(get_db)
):
    """Submit a test with answers."""
    # Verify test exists and is active
    test = db.query(models.Test).filter(
        models.Test.id == submission.test_id,
        models.Test.is_active == True
    ).first()
    
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found or inactive"
        )
    
    # Check if student has already submitted
    existing_submission = db.query(models.StudentAttempt).filter(
        models.StudentAttempt.test_id == submission.test_id,
        models.StudentAttempt.roll_no == submission.roll_no,
        models.StudentAttempt.section == submission.section
    ).first()
    
    if existing_submission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted this test"
        )
    
    # Get correct answers
    questions = db.query(models.Question).filter(
        models.Question.test_id == submission.test_id
    ).all()
    
    correct_answers = {
        str(q.id): q.correct_option for q in questions
    }
    
    # Calculate score
    score = utils.calculate_score(submission.answers, correct_answers)
    
    # Create student attempt record
    student_attempt = models.StudentAttempt(
        test_id=submission.test_id,
        roll_no=submission.roll_no,
        student_name=submission.student_name,
        section=submission.section,
        answers=submission.answers,
        score=score,
        completed_at=datetime.utcnow()
    )
    
    db.add(student_attempt)
    db.commit()
    
    return {
        "message": "Test submitted successfully",
        "score": score,
        "total_questions": len(questions)
    }

@router.get("/test-result/{test_id}")
async def get_test_result(
    test_id: int,
    roll_no: str,
    section: str,
    db: Session = Depends(get_db)
):
    """Get test result for a student."""
    attempt = db.query(models.StudentAttempt).filter(
        models.StudentAttempt.test_id == test_id,
        models.StudentAttempt.roll_no == roll_no,
        models.StudentAttempt.section == section
    ).first()
    
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No test submission found"
        )
    
    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    total_questions = db.query(models.Question).filter(
        models.Question.test_id == test_id
    ).count()
    
    return {
        "student_name": attempt.student_name,
        "roll_no": attempt.roll_no,
        "section": attempt.section,
        "score": attempt.score,
        "total_questions": total_questions,
        "percentage": (attempt.score / total_questions) * 100 if total_questions > 0 else 0,
        "completed_at": attempt.completed_at
    }
