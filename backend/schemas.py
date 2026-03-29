from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from models import UserRole, BookingStatus, RoomStatus


# Auth schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    phone: Optional[str]
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


# Room schemas
class RoomResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    image_url: Optional[str]
    size_value: Optional[int]
    occupancy_count: Optional[int]
    amenities: Optional[str]
    status: RoomStatus
    featured: bool

    class Config:
        from_attributes = True


class RoomCreate(BaseModel):
    name: str
    description: str
    price: float
    image_url: Optional[str] = None
    size_value: Optional[int] = None
    occupancy_count: Optional[int] = None
    amenities: Optional[str] = None
    status: RoomStatus = RoomStatus.AVAILABLE
    featured: bool = False


class RoomUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    size_value: Optional[int] = None
    occupancy_count: Optional[int] = None
    amenities: Optional[str] = None
    status: Optional[RoomStatus] = None
    featured: Optional[bool] = None


# Booking schemas
class BookingCreate(BaseModel):
    room_id: int
    check_in: date
    check_out: date
    package_name: Optional[str] = None


class BookingResponse(BaseModel):
    id: int
    user_id: int
    room_id: int
    check_in: date
    check_out: date
    status: BookingStatus
    total_price: float
    package_name: Optional[str]
    created_at: datetime
    room: Optional[RoomResponse] = None

    class Config:
        from_attributes = True


class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
