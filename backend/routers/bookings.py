from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List
from datetime import date, datetime

from database import get_session
from models import Booking, BookingStatus, Room, RoomStatus, NotificationType, User
from schemas import BookingCreate, BookingResponse, BookingUpdate, CheckInOutResponse
from routers.auth import get_current_user, get_current_staff
from routers.rooms import build_localized_room
from routers.notifications import create_notification

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


def build_booking_response(booking: Booking, lang: str, session: Session) -> BookingResponse:
    """Build booking response with room and user data."""
    room = session.get(Room, booking.room_id)
    user = session.get(User, booking.user_id)
    room_data = build_localized_room(room, lang, session) if room else None
    user_data = user.model_dump() if user else None
    
    return BookingResponse(
        id=booking.id,
        user_id=booking.user_id,
        room_id=booking.room_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        status=booking.status,
        total_price=booking.total_price,
        package_name=booking.package_name,
        checked_in_at=booking.checked_in_at,
        checked_out_at=booking.checked_out_at,
        created_at=booking.created_at,
        room=room_data,
        user=user_data,
    )


@router.get("/my", response_model=List[BookingResponse])
def get_my_bookings(
    lang: str = Query("en"),
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current user's bookings"""
    bookings = session.exec(
        select(Booking)
        .where(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
    ).all()

    # Load room and user data for each booking
    return [build_booking_response(booking, lang, session) for booking in bookings]


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
    
    # Calculate total price
    nights = (booking_data.check_out - booking_data.check_in).days
    total_price = room.price * nights
    
    # Create booking
    booking = Booking(
        user_id=current_user.id,
        room_id=booking_data.room_id,
        check_in=booking_data.check_in,
        check_out=booking_data.check_out,
        status=BookingStatus.PENDING,
        total_price=total_price,
        package_name=booking_data.package_name
    )
    
    session.add(booking)
    session.commit()
    session.refresh(booking)
    
    # Create notification for all staff users
    staff_users = session.exec(select(User).where(User.role == "staff")).all()
    for staff_user in staff_users:
        create_notification(
            session,
            NotificationType.BOOKING_CREATED,
            f"New booking #{booking.id} created by {current_user.name}",
            booking.id,
            staff_user.id,
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
    
    # Create notification for all staff users
    staff_users = session.exec(select(User).where(User.role == "staff")).all()
    for staff_user in staff_users:
        create_notification(
            session,
            NotificationType.BOOKING_CANCELLED,
            f"Booking #{booking.id} has been cancelled",
            booking.id,
            staff_user.id,
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
    
    # Create notification for all staff users
    staff_users = session.exec(select(User).where(User.role == "staff")).all()
    for staff_user in staff_users:
        create_notification(
            session,
            NotificationType.CHECKED_IN,
            f"Booking #{booking.id} has been checked in",
            booking.id,
            staff_user.id,
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
    
    # Create notification for all staff users
    staff_users = session.exec(select(User).where(User.role == "staff")).all()
    for staff_user in staff_users:
        create_notification(
            session,
            NotificationType.CHECKED_OUT,
            f"Booking #{booking.id} has been checked out",
            booking.id,
            staff_user.id,
        )
    
    return CheckInOutResponse(
        id=booking.id,
        status=booking.status,
        checked_in_at=booking.checked_in_at,
        checked_out_at=booking.checked_out_at,
        message="Check-out successful"
    )
