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


class RoomType(str, Enum):
    STANDARD = "standard"
    LUXURY = "luxury"
    SUITE = "suite"
    BUSINESS = "business"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    name: str
    phone: Optional[str] = None
    role: UserRole = Field(default=UserRole.CUSTOMER)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    bookings: List["Booking"] = Relationship(back_populates="user")


class RoomAmenity(SQLModel, table=True):
    room_id: int = Field(foreign_key="room.id", primary_key=True)
    amenity_id: int = Field(foreign_key="amenity.id", primary_key=True)


class Room(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    price: float
    image_url: Optional[str] = None
    size: Optional[str] = None
    occupancy: Optional[str] = None
    status: RoomStatus = Field(default=RoomStatus.AVAILABLE)
    featured: bool = Field(default=False)
    room_type: RoomType = Field(default=RoomType.STANDARD)

    bookings: List["Booking"] = Relationship(back_populates="room", cascade_delete=True)
    translations: List["RoomTranslation"] = Relationship(back_populates="room", cascade_delete=True)
    amenities: List["Amenity"] = Relationship(back_populates="rooms", link_model=RoomAmenity)


class RoomTranslation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    room_id: int = Field(foreign_key="room.id", index=True)
    language: str = Field(index=True)  # "en", "zh-TW", "zh-CN"
    name: str
    description: str

    room: Optional[Room] = Relationship(back_populates="translations")


class Amenity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    translations: List["AmenityTranslation"] = Relationship(back_populates="amenity")
    rooms: List[Room] = Relationship(back_populates="amenities", link_model=RoomAmenity)


class AmenityTranslation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    amenity_id: int = Field(foreign_key="amenity.id", index=True)
    language: str = Field(index=True)
    name: str

    amenity: Optional[Amenity] = Relationship(back_populates="translations")


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