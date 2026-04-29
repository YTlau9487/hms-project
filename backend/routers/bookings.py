from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List, Optional
from datetime import date, datetime, timedelta
import math

from database import get_session
from models import Booking, BookingStatus, Room, RoomStatus, NotificationType, User
from schemas import BookingCreate, BookingResponse, BookingUpdate, CheckInOutResponse, UserResponse, PaginatedBookingResponse
from routers.auth import get_current_user, get_current_staff
from routers.rooms import build_localized_room
from routers.notifications import create_notification

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

# Package prices must match frontend BookingModal.tsx package prices
PACKAGE_PRICES = {
    # English
    "Standard Stay": 0,
    "Breakfast Delight": 45,
    "VIP Experience": 120,
    # Traditional Chinese (zh-TW)
    "標準住宿": 0,
    "早餐套餐": 45,
    "VIP體驗": 120,
    # Simplified Chinese (zh-CN)
    "标准住宿": 0,
    "早餐套餐": 45,
    "VIP体验": 120,
}


def build_booking_response(booking: Booking, lang: str, session: Session) -> BookingResponse:
    """Build booking response with room and user data."""
    room = session.get(Room, booking.room_id)
    user = session.get(User, booking.user_id)
    room_data = build_localized_room(room, lang, session) if room else None
    user_data = UserResponse.model_validate(user) if user else None
    
    return BookingResponse(
        id=booking.id,
        user_id=booking.user_id,
        room_id=booking.room_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        status=booking.status,
        total_price=booking.total_price,
        package_name=booking.package_name,
        special_requests=booking.special_requests,
        checked_in_at=booking.checked_in_at,
        checked_out_at=booking.checked_out_at,
        created_at=booking.created_at,
        room=room_data,
        user=user_data,
    )


@router.get("/my", response_model=PaginatedBookingResponse)
def get_my_bookings(
    lang: str = Query("en"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=50, description="Items per page"),
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current user's bookings with pagination"""
    # Get total count
    total = session.exec(
        select(Booking).where(Booking.user_id == current_user.id)
    ).all()
    total_count = len(total)
    pages = math.ceil(total_count / page_size) if total_count > 0 else 1

    # Get paginated bookings
    bookings = session.exec(
        select(Booking)
        .where(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()

    # Batch load rooms and users to avoid N+1
    room_ids = list(set(b.room_id for b in bookings))
    user_ids = list(set(b.user_id for b in bookings))
    
    # Guard against empty IN() clauses which SQLite doesn't support
    if room_ids:
        rooms = {r.id: r for r in session.exec(select(Room).where(Room.id.in_(room_ids))).all()}
    else:
        rooms = {}
    
    if user_ids:
        users = {u.id: u for u in session.exec(select(User).where(User.id.in_(user_ids))).all()}
    else:
        users = {}

    # Build response with batch-loaded data
    result = []
    for booking in bookings:
        room = rooms.get(booking.room_id)
        user = users.get(booking.user_id)
        room_data = build_localized_room(room, lang, session) if room else None
        user_data = UserResponse.model_validate(user) if user else None
        
        result.append(BookingResponse(
            id=booking.id,
            user_id=booking.user_id,
            room_id=booking.room_id,
            check_in=booking.check_in,
            check_out=booking.check_out,
            status=booking.status,
            total_price=booking.total_price,
            package_name=booking.package_name,
            special_requests=booking.special_requests,
            checked_in_at=booking.checked_in_at,
            checked_out_at=booking.checked_out_at,
            created_at=booking.created_at,
            room=room_data,
            user=user_data,
        ))

    return PaginatedBookingResponse(
        items=result,
        total=total_count,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
    lang: str = Query("en"),
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new booking"""
    # Check if room exists and is available
    room = session.get(Room, booking_data.room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    if room.status != RoomStatus.AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room is not available"
        )
    
    # Validate dates
    if booking_data.check_in >= booking_data.check_out:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be after check-in date"
        )
    
    if booking_data.check_in < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in date cannot be in the past"
        )
    
    # Max 1 month stay
    max_stay = booking_data.check_in + timedelta(days=31)
    if booking_data.check_out > max_stay:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum stay duration is 1 month"
        )
    
    # Note: Date-range overlap availability check is bypassed.
    # The availability API endpoint exists as a draft for future implementation.
    # Customers can book any room on any valid date range.
    # Operational room status check (RoomStatus.AVAILABLE) above still applies.
    
    # Calculate total price
    nights = (booking_data.check_out - booking_data.check_in).days
    base_price = room.price * nights
    package_surcharge = PACKAGE_PRICES.get(booking_data.package_name, 0)
    total_price = base_price + package_surcharge

    # Guard against non-finite total_price (overflow protection)
    if not math.isfinite(total_price):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid price calculation. Please contact support."
        )

    # Create booking
    booking = Booking(
        user_id=current_user.id,
        room_id=booking_data.room_id,
        check_in=booking_data.check_in,
        check_out=booking_data.check_out,
        status=BookingStatus.PENDING,
        total_price=total_price,
        package_name=booking_data.package_name,
        special_requests=booking_data.special_requests
    )
    
    session.add(booking)
    session.commit()
    session.refresh(booking)
    
    # Create notification for all staff and admin users
    staff_users = session.exec(select(User).where(User.role.in_(["staff", "admin"]))).all()
    for staff_user in staff_users:
        create_notification(
            session,
            NotificationType.BOOKING_CREATED,
            f"New booking #{booking.id} created by {current_user.name}",
            booking.id,
            staff_user.id,
            message_key="notificationMessages.bookingCreated",
            message_params={"bookingId": booking.id, "userName": current_user.name},
        )
    
    return build_booking_response(booking, lang, session)


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    lang: str = Query("en"),
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get booking by ID"""
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if user owns this booking or is staff
    if booking.user_id != current_user.id and current_user.role != "staff":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return build_booking_response(booking, lang, session)


@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: int,
    booking_data: BookingUpdate,
    lang: str = Query("en"),
    current_user = Depends(get_current_staff),
    session: Session = Depends(get_session)
):
    """Update booking status (staff only)"""
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking_data.status:
        booking.status = booking_data.status
    
    session.add(booking)
    session.commit()
    session.refresh(booking)
    
    # Create notification if booking was confirmed
    if booking_data.status == BookingStatus.CONFIRMED:
        staff_users = session.exec(select(User).where(User.role.in_(["staff", "admin"]))).all()
        for staff_user in staff_users:
            create_notification(
                session,
                NotificationType.BOOKING_CONFIRMED,
                f"Booking #{booking.id} has been confirmed by staff",
                booking.id,
                staff_user.id,
                message_key="notificationMessages.bookingConfirmed",
                message_params={"bookingId": booking.id},
            )
    
    # Create notification if booking was cancelled
    if booking_data.status == BookingStatus.CANCELLED:
        staff_users = session.exec(select(User).where(User.role.in_(["staff", "admin"]))).all()
        for staff_user in staff_users:
            create_notification(
                session,
                NotificationType.BOOKING_CANCELLED,
                f"Booking #{booking.id} has been cancelled by staff",
                booking.id,
                staff_user.id,
                message_key="notificationMessages.bookingCancelledByStaff",
                message_params={"bookingId": booking.id},
            )
    
    return build_booking_response(booking, lang, session)


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(
    booking_id: int,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Cancel a booking"""
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if user owns this booking or is staff
    if booking.user_id != current_user.id and current_user.role != "staff":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if booking.status == BookingStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is already cancelled"
        )
    
    booking.status = BookingStatus.CANCELLED
    session.add(booking)
    session.commit()
    
    # Create notification for all staff and admin users
    staff_users = session.exec(select(User).where(User.role.in_(["staff", "admin"]))).all()
    for staff_user in staff_users:
        create_notification(
            session,
            NotificationType.BOOKING_CANCELLED,
            f"Booking #{booking.id} has been cancelled",
            booking.id,
            staff_user.id,
            message_key="notificationMessages.bookingCancelled",
            message_params={"bookingId": booking.id},
        )


@router.post("/{booking_id}/check-in", response_model=CheckInOutResponse)
def check_in_booking(
    booking_id: int,
    current_user = Depends(get_current_staff),
    session: Session = Depends(get_session)
):
    """Check in a booking (staff only)"""
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.status != BookingStatus.CONFIRMED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking must be confirmed to check in"
        )
    
    if booking.status == BookingStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot check in a cancelled booking"
        )
    
    if booking.checked_in_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking already checked in"
        )
    
    booking.checked_in_at = datetime.utcnow()
    session.add(booking)
    session.commit()
    session.refresh(booking)
    
    # Create notification for all staff and admin users
    staff_users = session.exec(select(User).where(User.role.in_(["staff", "admin"]))).all()
    for staff_user in staff_users:
        create_notification(
            session,
            NotificationType.CHECKED_IN,
            f"Booking #{booking.id} has been checked in",
            booking.id,
            staff_user.id,
            message_key="notificationMessages.checkedIn",
            message_params={"bookingId": booking.id},
        )
    
    return CheckInOutResponse(
        id=booking.id,
        status=booking.status,
        checked_in_at=booking.checked_in_at,
        checked_out_at=booking.checked_out_at,
        message="Check-in successful"
    )


@router.post("/{booking_id}/check-out", response_model=CheckInOutResponse)
def check_out_booking(
    booking_id: int,
    current_user = Depends(get_current_staff),
    session: Session = Depends(get_session)
):
    """Check out a booking (staff only)"""
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.checked_in_at is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot check out before check-in"
        )
    
    if booking.checked_out_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking already checked out"
        )
    
    booking.checked_out_at = datetime.utcnow()
    session.add(booking)
    session.commit()
    session.refresh(booking)
    
    # Create notification for all staff and admin users
    staff_users = session.exec(select(User).where(User.role.in_(["staff", "admin"]))).all()
    for staff_user in staff_users:
        create_notification(
            session,
            NotificationType.CHECKED_OUT,
            f"Booking #{booking.id} has been checked out",
            booking.id,
            staff_user.id,
            message_key="notificationMessages.checkedOut",
            message_params={"bookingId": booking.id},
        )
    
    return CheckInOutResponse(
        id=booking.id,
        status=booking.status,
        checked_in_at=booking.checked_in_at,
        checked_out_at=booking.checked_out_at,
        message="Check-out successful"
    )
