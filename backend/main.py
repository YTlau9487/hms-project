import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import init_db
from routers import auth, rooms, bookings, admin, notifications


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    init_db()
    yield


app = FastAPI(
    title="Hotel Management System API",
    description="Backend API for the Hotel Management System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for frontend
# In production, frontend and backend are served from the same origin via Nginx
# so CORS is not needed, but we keep dev origins for local development
default_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]
cors_origins = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(bookings.router)
app.include_router(admin.router)
app.include_router(notifications.router)


@app.get("/")
def root():
    return {"message": "Hotel Management System API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}