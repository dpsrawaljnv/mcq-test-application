from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, JSON, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

# Association table for Teacher-Class-Subject relationship
teacher_class_subject = Table(
    'teacher_class_subject',
    Base.metadata,
    Column('teacher_id', Integer, ForeignKey('teachers.id')),
    Column('class_id', Integer, ForeignKey('classes.id')),
    Column('subject_id', Integer, ForeignKey('subjects.id')),
)

class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)

class Teacher(Base):
    __tablename__ = "teachers"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    
    # Relationships
    classes = relationship("Class", secondary=teacher_class_subject, back_populates="teachers", overlaps="subjects")
    subjects = relationship("Subject", secondary=teacher_class_subject, overlaps="classes")
    questions = relationship("Question", back_populates="teacher")

class Class(Base):
    __tablename__ = "classes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    
    # Relationships
    teachers = relationship("Teacher", secondary=teacher_class_subject, back_populates="classes", overlaps="subjects")
    tests = relationship("Test", back_populates="class_ref")

class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

class Test(Base):
    __tablename__ = "tests"
    
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    test_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    class_ref = relationship("Class", back_populates="tests")
    questions = relationship("Question", back_populates="test_ref")
    student_attempts = relationship("StudentAttempt", back_populates="test_ref")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"))
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    question_text = Column(String)
    question_type = Column(String)  # text, image, video, or audio
    media_url = Column(String, nullable=True)
    options = Column(JSON)  # Store options as JSON
    correct_option = Column(Integer)
    
    # Relationships
    test_ref = relationship("Test", back_populates="questions")
    teacher = relationship("Teacher", back_populates="questions")

class StudentAttempt(Base):
    __tablename__ = "student_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"))
    roll_no = Column(String)
    student_name = Column(String)
    section = Column(String)
    answers = Column(JSON)  # Store answers as JSON
    score = Column(Integer)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    test_ref = relationship("Test", back_populates="student_attempts")
