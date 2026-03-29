from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List

from database import get_session
from models import User, Booking, BookingStatus, Room
from schemas import BookingResponse, BookingUpdate, UserResponse
from routers.auth import get_current_staff
from routers.rooms import build_localized_room

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/bookings", response_model=List[BookingResponse])
def list_all_bookings(
    lang: str = Query("en"),
    current_user = Depends(get_current_staff),
    session: Session = Depends(get_session)
):
    """List all bookings (staff only)"""
    bookings = session.exec(
        select(Booking).order_by(Booking.created_at.desc())
    ).all()

    # Load room data for each booking with localization
    result = []
    for booking in bookings:
        room = session.get(Room, booking.room_id)
        booking_dict = booking.dict()
        booking_dict["room"] = build_localized_room(room, lang, session) if room else None
        result.append(BookingResponse(**booking_dict))

    return result


@router.put("/bookings/{booking_id}", response_model=BookingResponse)
def update_booking_status(
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
    
    # Load room data with localization
    room = session.get(Room, booking.room_id)
    booking_dict = booking.dict()
    booking_dict["room"] = build_localized_room(room, lang, session) if room else None

    return BookingResponse(**booking_dict)


@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    current_user = Depends(get_current_staff),
    session: Session = Depends(get_session)
):
    """List all users (staff only)"""
    users = session.exec(select(User)).all()
    return users


@router.get("/stats")
def get_dashboard_stats(
    current_user = Depends(get_current_staff),
    session: Session = Depends(get_session)
):
    """Get dashboard statistics (staff only)"""
    # Count total bookings
    total_bookings = len(session.exec(select(Booking)).all())
    
    # Count active bookings (confirmed)
    active_bookings = len(
        session.exec(
            select(Booking).where(Booking.status == BookingStatus.CONFIRMED)
        ).all()
    )
    
    # Count pending bookings
    pending_bookings = len(
        session.exec(
            select(Booking).where(Booking.status == BookingStatus.PENDING)
        ).all()
    )
    
    # Count total users
    total_users = len(session.exec(select(User)).all())
    
    # Count total rooms
    total_rooms = len(session.exec(select(Room)).all())
    
    # Calculate total revenue from confirmed bookings
    confirmed_bookings = session.exec(
        select(Booking).where(Booking.status == BookingStatus.CONFIRMED)
    ).all()
    total_revenue = sum(booking.total_price for booking in confirmed_bookings)
    
    return {
        "total_bookings": total_bookings,
        "active_bookings": active_bookings,
        "pending_bookings": pending_bookings,
        "total_users": total_users,
        "total_rooms": total_rooms,
        "total_revenue": total_revenue
    }