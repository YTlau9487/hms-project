from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


class UserRole(str, Enum):
    CUSTOMER = "customer"
    STAFF = "staff"


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class RoomStatus(str, Enum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    name: str
    phone: Optional[str] = None
    role: UserRole = Field(default=UserRole.CUSTOMER)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    bookings: List["Booking"] = Relationship(back_populates="user")


class Room(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    price: float
    image_url: Optional[str] = None
    size_value: Optional[int] = None
    occupancy_count: Optional[int] = None
    amenities: Optional[str] = None  # JSON string of amenities list
    status: RoomStatus = Field(default=RoomStatus.AVAILABLE)
    featured: bool = Field(default=False)

    bookings: List["Booking"] = Relationship(back_populates="room")


class Booking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    room_id: int = Field(foreign_key="room.id")
    check_in: date
    check_out: date
    status: BookingStatus = Field(default=BookingStatus.PENDING)
    total_price: float
    package_name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional[User] = Relationship(back_populates="bookings")
    room: Optional[Room] = Relationship(back_populates="bookings")