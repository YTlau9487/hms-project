from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from datetime import date

from database import get_session
from models import Booking, BookingStatus, Room, RoomStatus
from schemas import BookingCreate, BookingResponse, BookingUpdate
from routers.auth import get_current_user, get_current_staff

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.get("/my", response_model=List[BookingResponse])
def get_my_bookings(
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current user's bookings"""
    bookings = session.exec(
        select(Booking)
        .where(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
    ).all()
    
    # Load room data for each booking
    result = []
    for booking in bookings:
        room = session.get(Room, booking.room_id)
        booking_dict = booking.dict()
        booking_dict["room"] = room
        result.append(BookingResponse(**booking_dict))
    
    return result


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
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
    
    # Load room data
    booking_dict = booking.dict()
    booking_dict["room"] = room
    
    return BookingResponse(**booking_dict)


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
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
    
    # Load room data
    room = session.get(Room, booking.room_id)
    booking_dict = booking.dict()
    booking_dict["room"] = room
    
    return BookingResponse(**booking_dict)


@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: int,
    booking_data: BookingUpdate,
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
    
    # Load room data
    room = session.get(Room, booking.room_id)
    booking_dict = booking.dict()
    booking_dict["room"] = room
    
    return BookingResponse(**booking_dict)


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
    
    booking.status = BookingStatus.CANCELLED
    session.add(booking)
    session.commit()