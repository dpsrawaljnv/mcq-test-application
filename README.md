# MCQ Test Application

A modern web application for managing and taking MCQ tests, built with Next.js, FastAPI, and SQLAlchemy.

## Features

### Admin Panel
- Create and manage teachers with assigned classes and subjects
- Create tests for different classes
- View class-wise performance statistics
- Generate toppers list

### Teacher Panel
- Add MCQ questions to tests (supports text, image, video, and audio)
- View assigned tests and classes
- Monitor student performance

### Student Interface
- Take tests using roll number and class details
- Support for multimedia questions
- Real-time test progress and timer
- Immediate results after submission

## Tech Stack

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- Radix UI Components
- ShadcnUI

### Backend
- FastAPI
- SQLAlchemy
- SQLite Database (can be configured for PostgreSQL)
- JWT Authentication

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at http://localhost:8000

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:8000

## Default Credentials

### Admin
- Username: admin
- Password: admin123

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── admin_routes.py
│   │   │   ├── teacher_routes.py
│   │   │   └── student_routes.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   └── main.py
│   └── requirements.txt
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── teacher/
│   │   ├── student/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   └── lib/
└── package.json
```

## API Documentation

Once the backend server is running, visit http://localhost:8000/docs for the complete API documentation.

## Development

### Adding New Features

1. Backend:
   - Add new models in `backend/app/models.py`
   - Create schemas in `backend/app/schemas.py`
   - Add routes in the appropriate route file

2. Frontend:
   - Add new pages in the appropriate directory under `src/app`
   - Create new components in `src/components` if needed
   - Update the navigation in layout files if required

### Database Migrations

The application uses SQLAlchemy with SQLite by default. To switch to PostgreSQL:

1. Update the `DATABASE_URL` in `backend/app/config.py`
2. Install PostgreSQL dependencies:
```bash
pip install psycopg2-binary
```

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- API routes are protected with appropriate middleware
- Input validation is performed on both frontend and backend

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
