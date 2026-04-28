from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


class UserRole(str, Enum):
    CUSTOMER = "customer"
    STAFF = "staff"
    ADMIN = "admin"


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class NotificationType(str, Enum):
    BOOKING_CREATED = "booking_created"
    BOOKING_CANCELLED = "booking_cancelled"
    CHECKED_IN = "checked_in"
    CHECKED_OUT = "checked_out"
    BROADCAST = "broadcast"


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
    name: str  # Kept for backward compatibility
    first_name: Optional[str] = Field(default=None)
    last_name: Optional[str] = Field(default=None)
    phone: Optional[str] = None
    role: UserRole = Field(default=UserRole.CUSTOMER)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    bookings: List["Booking"] = Relationship(back_populates="user")
    notifications: List["Notification"] = Relationship(back_populates="user")


class RoomAmenity(SQLModel, table=True):
    room_id: int = Field(foreign_key="room.id", primary_key=True)
    amenity_id: int = Field(foreign_key="amenity.id", primary_key=True)


class RoomImage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    room_id: int = Field(foreign_key="room.id", index=True)
    image_url: str
    order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    room: Optional["Room"] = Relationship(back_populates="images")


class Room(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    price: float
    image_url: Optional[str] = None
    size_sqm: Optional[int] = None
    adults: int = Field(default=2)
    children: int = Field(default=0)
    status: RoomStatus = Field(default=RoomStatus.AVAILABLE)
    featured: bool = Field(default=False)
    room_type: RoomType = Field(default=RoomType.STANDARD)

    bookings: List["Booking"] = Relationship(back_populates="room", cascade_delete=True)
    translations: List["RoomTranslation"] = Relationship(back_populates="room", cascade_delete=True)
    amenities: List["Amenity"] = Relationship(back_populates="rooms", link_model=RoomAmenity)
    images: List["RoomImage"] = Relationship(back_populates="room", cascade_delete=True)


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
    special_requests: Optional[str] = Field(default=None, max_length=100)
    checked_in_at: Optional[datetime] = Field(default=None)
    checked_out_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional[User] = Relationship(back_populates="bookings")
    room: Optional[Room] = Relationship(back_populates="bookings")
    notifications: List["Notification"] = Relationship(back_populates="booking")


class Notification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: NotificationType
    message: str
    booking_id: Optional[int] = Field(foreign_key="booking.id", nullable=True)
    user_id: int = Field(foreign_key="user.id")
    read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    booking: Optional[Booking] = Relationship(back_populates="notifications")
    user: Optional[User] = Relationship(back_populates="notifications")
