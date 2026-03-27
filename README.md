# HMS Project (Hotel Management System)

A full-stack hotel management system built with React, Vite, Tailwind CSS (frontend) and FastAPI, SQLite (backend).

## 🚀 Quick Start

### Using Docker (Recommended)

The Docker setup provides a complete development environment with both frontend and backend services.

#### Prerequisites
- Docker Desktop installed and running on your system
- Ensure Docker is set to use Linux containers (Windows users)

#### Quick Start

**Windows Users:**
1. Double-click `start-dev.bat` to start the development environment
2. Or run in command prompt: `docker-compose up --build`

**Linux/macOS Users:**
1. Make the script executable: `chmod +x start-dev.sh`
2. Run the script: `./start-dev.sh`
3. Or run directly: `docker-compose up --build`

#### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

#### Test Credentials
The system automatically seeds test accounts on startup:
- **Customer**: `customer@test.com` / `password123`
- **Staff**: `staff@test.com` / `password123`

#### Docker Commands
```bash
# Start all services
docker-compose up

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs -f

# Start only backend
docker-compose up backend

# Start only frontend (dev mode)
docker-compose up dev
```

## 📁 Project Structure

```
├── backend/                    # FastAPI backend
│   ├── routers/               # API route handlers
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── rooms.py          # Room management
│   │   ├── bookings.py       # Booking management
│   │   └── admin.py          # Admin endpoints
│   ├── models.py             # Database models
│   ├── schemas.py            # Pydantic schemas
│   ├── database.py           # Database configuration
│   ├── seed.py               # Database seeding script
│   └── main.py               # FastAPI application
├── src/                        # React frontend
│   ├── app/
│   │   ├── components/       # React components
│   │   ├── context/          # React context (AuthContext)
│   │   ├── layouts/          # Layout components
│   │   ├── pages/            # Page components
│   │   └── services/         # API service layer
│   ├── locales/              # i18n translations
│   └── main.tsx              # Entry point
├── docker-compose.yml          # Docker orchestration
├── Dockerfile                  # Production frontend build
├── Dockerfile.dev              # Development frontend build
└── backend/Dockerfile          # Backend Docker build
```

## 🔐 Authentication & Authorization

### User Roles
- **Customer**: Can view rooms, make bookings, view their bookings
- **Staff**: Can manage rooms, view all bookings, access admin dashboard

### Protected Routes
- `/account/*` - Requires customer role
- `/admin/*` - Requires staff role

### API Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info
- `GET /api/rooms/` - List all rooms
- `GET /api/rooms/{id}` - Get room details
- `POST /api/bookings/` - Create booking
- `GET /api/bookings/my` - Get user's bookings
- `GET /api/admin/stats` - Get dashboard statistics (staff only)
- `GET /api/admin/bookings` - Get all bookings (staff only)

## 🛠️ Development

### Frontend Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Backend Development
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database seed
python seed.py

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### API Documentation
The backend provides automatic API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🐳 Docker Configuration

### Services
- **backend**: FastAPI server on port 8000
- **dev**: Vite development server on port 3000

### Volumes
- `backend-data`: SQLite database persistence
- `pnpm-store`: pnpm package cache

### Environment Variables
- `DOCKER_ENV=true`: Enables Docker-specific configuration
- `VITE_API_URL`: Backend API URL for frontend proxy

## 📚 Documentation

For detailed information about the Docker setup, troubleshooting, and advanced usage, see [DOCKER.md](DOCKER.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit with a descriptive message
5. Push and create a pull request

## 📄 License

This project is licensed under the MIT License.
