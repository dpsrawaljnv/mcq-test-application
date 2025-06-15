from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, utils
from ..database import get_db
from ..utils import get_current_user
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/teachers", response_model=schemas.TeacherResponse)
async def create_teacher(
    teacher: schemas.TeacherCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new teacher with assigned classes and subjects."""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create teachers"
        )
    
    # Check if teacher already exists
    db_teacher = db.query(models.Teacher).filter(
        models.Teacher.username == teacher.username
    ).first()
    if db_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new teacher
    hashed_password = utils.get_password_hash(teacher.password)
    db_teacher = models.Teacher(
        username=teacher.username,
        password_hash=hashed_password
    )
    
    # Add classes and subjects
    classes = db.query(models.Class).filter(
        models.Class.id.in_(teacher.class_ids)
    ).all()
    subjects = db.query(models.Subject).filter(
        models.Subject.id.in_(teacher.subject_ids)
    ).all()
    
    db_teacher.classes = classes
    db_teacher.subjects = subjects
    
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    
    return db_teacher

@router.get("/classes", response_model=List[schemas.ClassBase])
async def get_classes(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get list of all classes."""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view classes"
        )
    classes = db.query(models.Class).all()
    return [schemas.ClassBase.from_orm(c) for c in classes]

@router.post("/classes", response_model=schemas.ClassBase)
async def create_class(
    class_data: schemas.ClassBase,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new class."""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create classes"
        )
    db_class = models.Class(name=class_data.name)
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

 @router.get("/subjects", response_model=List[schemas.SubjectBase])
 async def get_subjects(
     db: Session = Depends(get_db),
     current_user: dict = Depends(get_current_user)
 ):
     """Get list of all subjects."""
     if current_user["role"] != "admin":
         raise HTTPException(
             status_code=status.HTTP_403_FORBIDDEN,
             detail="Only admins can view subjects"
         )
     subjects = db.query(models.Subject).all()
     return [schemas.SubjectBase.from_orm(s) for s in subjects]

+@router.post("/subjects", response_model=schemas.SubjectBase)
+async def create_subject(
+    subject_data: schemas.SubjectBase,
+    db: Session = Depends(get_db),
+    current_user: dict = Depends(get_current_user)
+):
+    """Create a new subject."""
+    if current_user["role"] != "admin":
+        raise HTTPException(
+            status_code=status.HTTP_403_FORBIDDEN,
+            detail="Only admins can create subjects"
+        )
+    db_subject = models.Subject(name=subject_data.name)
+    db.add(db_subject)
+    db.commit()
+    db.refresh(db_subject)
+    return db_subject

@router.get("/teachers", response_model=List[schemas.TeacherResponse])
async def get_teachers(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get list of all teachers."""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view teachers"
        )
    teachers = db.query(models.Teacher).all()
    return [schemas.TeacherResponse.from_orm(t) for t in teachers]

@router.post("/tests", response_model=schemas.TestResponse)
async def create_test(
    test: schemas.TestCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new test for a specific class."""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create tests"
        )
    
    # Verify class and subject exist
    class_ = db.query(models.Class).filter(models.Class.id == test.class_id).first()
    subject = db.query(models.Subject).filter(models.Subject.id == test.subject_id).first()
    
    if not class_ or not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class or subject not found"
        )
    
    # Create test
    db_test = models.Test(
        class_id=test.class_id,
        subject_id=test.subject_id,
        test_date=test.test_date,
        is_active=True
    )
    
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    
    return db_test

@router.patch("/tests/{test_id}")
async def update_test_status(
    test_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update test status (active/inactive)."""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update test status"
        )
    
    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    test.is_active = is_active
    db.commit()
    
    return {"message": "Test status updated successfully"}

@router.get("/performance", response_model=List[schemas.PerformanceResponse])
async def get_class_performance(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get performance statistics for all classes."""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view performance statistics"
        )
    
    classes = db.query(models.Class).all()
    performance_stats = []
    
    for class_ in classes:
        # Get all attempts for tests in this class
        attempts = db.query(models.StudentAttempt).join(
            models.Test
        ).filter(
            models.Test.class_id == class_.id
        ).all()
        
        stats = utils.generate_class_performance_stats(attempts)
        performance_stats.append({
            "class_name": class_.name,
            **stats
        })
    
    return performance_stats

@router.get("/toppers/{class_id}")
async def get_class_toppers(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get top three performers for a specific class."""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view toppers list"
        )
    
    class_ = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not class_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Get all attempts for this class
    attempts = db.query(models.StudentAttempt).join(
        models.Test
    ).filter(
        models.Test.class_id == class_id
    ).all()
    
    stats = utils.generate_class_performance_stats(attempts)
    
    return {
        "class_name": class_.name,
        "toppers": stats["top_performers"]
    }
