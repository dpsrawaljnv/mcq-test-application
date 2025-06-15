from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from .config import settings
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate password hash."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

async def get_current_user(token: str):
    """Decode JWT token and return current user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        
        if username is None:
            raise credentials_exception
            
        token_data = {"username": username, "role": role}
        
    except JWTError:
        raise credentials_exception
        
    return token_data

def calculate_score(student_answers: dict, correct_answers: dict) -> int:
    """Calculate student's score based on their answers."""
    score = 0
    for question_id, answer in student_answers.items():
        if str(question_id) in correct_answers and answer == correct_answers[str(question_id)]:
            score += 1
    return score

def validate_media_url(url: str, media_type: str) -> bool:
    """Validate media URL based on type."""
    allowed_image_extensions = ['.jpg', '.jpeg', '.png', '.gif']
    allowed_video_extensions = ['.mp4', '.webm']
    allowed_audio_extensions = ['.mp3', '.wav']
    
    url_lower = url.lower()
    
    if media_type == 'image':
        return any(url_lower.endswith(ext) for ext in allowed_image_extensions)
    elif media_type == 'video':
        return any(url_lower.endswith(ext) for ext in allowed_video_extensions)
    elif media_type == 'audio':
        return any(url_lower.endswith(ext) for ext in allowed_audio_extensions)
    
    return False

def generate_class_performance_stats(attempts: list) -> dict:
    """Generate performance statistics for a class."""
    if not attempts:
        return {
            "average_score": 0,
            "total_students": 0,
            "top_performers": []
        }
    
    # Calculate average score
    total_score = sum(attempt.score for attempt in attempts)
    average_score = total_score / len(attempts)
    
    # Get top performers
    sorted_attempts = sorted(attempts, key=lambda x: x.score, reverse=True)
    top_performers = [
        {
            "student_name": attempt.student_name,
            "roll_no": attempt.roll_no,
            "score": attempt.score
        }
        for attempt in sorted_attempts[:3]
    ]
    
    return {
        "average_score": round(average_score, 2),
        "total_students": len(attempts),
        "top_performers": top_performers
    }
