from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from models import UserRole, BookingStatus, RoomStatus, RoomType, NotificationType


# Auth schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str


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
    first_name: Optional[str]
    last_name: Optional[str]
    phone: Optional[str]
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None


# Room schemas - Public (localized)
class RoomLocalizedResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    image_url: Optional[str]
    size_sqm: Optional[int]
    adults: int
    children: int
    amenities: List[str]
    status: RoomStatus
    featured: bool
    room_type: RoomType

    class Config:
        from_attributes = True


# Room schemas - Legacy (kept for backward compat in booking response)
class RoomResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    image_url: Optional[str]
    size_sqm: Optional[int]
    adults: int
    children: int
    amenities: Optional[str]
    status: RoomStatus
    featured: bool

    class Config:
        from_attributes = True


# Translation input schemas for admin create/update
class TranslationInput(BaseModel):
    language: str
    name: str
    description: str


class AmenityTranslationInput(BaseModel):
    language: str
    name: str


class AmenityInput(BaseModel):
    translations: List[AmenityTranslationInput]


class RoomCreate(BaseModel):
    price: float
    image_url: Optional[str] = None
    size_sqm: Optional[int] = None
    adults: int = 2
    children: int = 0
    status: RoomStatus = RoomStatus.AVAILABLE
    featured: bool = False
    room_type: RoomType = RoomType.STANDARD
    translations: List[TranslationInput]
    amenities: List[AmenityInput] = []


class RoomUpdate(BaseModel):
    price: Optional[float] = None
    image_url: Optional[str] = None
    size_sqm: Optional[int] = None
    adults: Optional[int] = None
    children: Optional[int] = None
    status: Optional[RoomStatus] = None
    featured: Optional[bool] = None
    room_type: Optional[RoomType] = None
    translations: Optional[List[TranslationInput]] = None
    amenities: Optional[List[AmenityInput]] = None


# Admin response schemas (full translation data)
class RoomTranslationAdmin(BaseModel):
    language: str
    name: str
    description: str

    class Config:
        from_attributes = True


class AmenityTranslationAdmin(BaseModel):
    language: str
    name: str

    class Config:
        from_attributes = True


class AmenityAdmin(BaseModel):
    id: int
    translations: List[AmenityTranslationAdmin]

    class Config:
        from_attributes = True


class RoomAdminResponse(BaseModel):
    id: int
    price: float
    image_url: Optional[str]
    size_sqm: Optional[int]
    adults: int
    children: int
    status: RoomStatus
    featured: bool
    room_type: RoomType
    translations: List[RoomTranslationAdmin]
    amenities: List[AmenityAdmin]

    class Config:
        from_attributes = True


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
    checked_in_at: Optional[datetime]
    checked_out_at: Optional[datetime]
    created_at: datetime
    room: Optional[RoomLocalizedResponse] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None


# Stay management schemas
class CheckInOutResponse(BaseModel):
    id: int
    status: BookingStatus
    checked_in_at: Optional[datetime]
    checked_out_at: Optional[datetime]
    message: str

    class Config:
        from_attributes = True


# Notification schemas
class NotificationResponse(BaseModel):
    id: int
    type: NotificationType
    message: str
    booking_id: Optional[int]
    user_id: int
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationReadResponse(BaseModel):
    id: int
    read: bool

    class Config:
        from_attributes = True


# Availability schemas
class AvailabilityRequest(BaseModel):
    check_in: date
    check_out: date


class AvailabilityResponse(BaseModel):
    rooms: List[RoomLocalizedResponse]
    check_in: date
    check_out: date


# Staff management schemas
class StaffCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None


class StaffResponse(BaseModel):
    id: int
    email: str
    name: str
    first_name: Optional[str]
    last_name: Optional[str]
    phone: Optional[str]
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


# Pagination schemas
class PaginatedBookingResponse(BaseModel):
    items: List[BookingResponse]
    total: int
    page: int
    page_size: int
    pages: int

    class Config:
        from_attributes = True
