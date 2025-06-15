from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, utils
from .database import engine, get_db
from .routes import admin_routes, teacher_routes, student_routes
from .config import settings
import uvicorn

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MCQ Test Application")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(admin_routes.router)
app.include_router(teacher_routes.router)
app.include_router(student_routes.router)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to MCQ Test Application API"}

# Admin login endpoint
@app.post("/admin/login", response_model=schemas.Token)
async def admin_login(username: str, password: str, db: Session = Depends(get_db)):
    """Login endpoint for admin."""
    admin = db.query(models.Admin).filter(
        models.Admin.username == username
    ).first()
    
    if not admin or not utils.verify_password(password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = utils.create_access_token(
        data={"sub": admin.username, "role": "admin"}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Create initial admin user if not exists
@app.on_event("startup")
async def create_initial_admin():
    db = next(get_db())
    admin = db.query(models.Admin).filter(
        models.Admin.username == settings.ADMIN_USERNAME
    ).first()
    
    if not admin:
        hashed_password = utils.get_password_hash(settings.ADMIN_PASSWORD)
        admin = models.Admin(
            username=settings.ADMIN_USERNAME,
            password_hash=hashed_password
        )
        db.add(admin)
        db.commit()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
