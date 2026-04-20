from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List
from argon2 import PasswordHasher

from database import get_session
from models import User, Booking, BookingStatus, Room, UserRole
from schemas import BookingResponse, BookingUpdate, UserResponse, StaffCreate, StaffResponse
from routers.auth import get_current_staff, get_current_admin
from routers.rooms import build_localized_room

ph = PasswordHasher()


def build_booking_response(booking: Booking, lang: str, session: Session) -> BookingResponse:
    """Build booking response with user and room data."""
    from schemas import BookingResponse
    
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

    result = []
    for booking in bookings:
        result.append(build_booking_response(booking, lang, session))

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
    
    return build_booking_response(booking, lang, session)


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


# Staff management endpoints (admin only)
@router.post("/staff", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
def create_staff_account(
    staff_data: StaffCreate,
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    """Create a new staff account (admin only)"""
    # Check if email already exists
    existing_user = session.exec(select(User).where(User.email == staff_data.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = ph.hash(staff_data.password)
    
    # Create staff user
    staff = User(
        email=staff_data.email,
        hashed_password=hashed_password,
        name=staff_data.name,
        phone=staff_data.phone,
        role=UserRole.STAFF
    )
    
    session.add(staff)
    session.commit()
    session.refresh(staff)
    
    return staff


@router.get("/staff", response_model=List[StaffResponse])
def list_staff_accounts(
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    """List all staff accounts (admin only)"""
    staff = session.exec(
        select(User).where(User.role == UserRole.STAFF)
    ).all()
    return staff


@router.delete("/staff/{staff_id}")
def delete_staff_account(
    staff_id: int,
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    """Delete a staff account (admin only)"""
    staff = session.get(User, staff_id)
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff account not found"
        )
    
    if staff.role != UserRole.STAFF:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only delete staff accounts"
        )
    
    session.delete(staff)
    session.commit()
    
    return {"message": f"Staff account '{staff.name}' deleted successfully"}
