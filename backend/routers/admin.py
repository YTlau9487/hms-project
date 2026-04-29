from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func
from typing import List, Optional
from argon2 import PasswordHasher
import math
import time

from database import get_session
from models import User, Booking, BookingStatus, Room, UserRole, NotificationType
from schemas import BookingResponse, BookingUpdate, UserResponse, StaffCreate, StaffResponse, PaginatedBookingResponse
from routers.auth import get_current_staff, get_current_admin, validate_password
from routers.rooms import build_localized_room
from routers.notifications import create_notification

ph = PasswordHasher()


def build_booking_response(booking: Booking, lang: str, session: Session) -> BookingResponse:
    """Build booking response with user and room data."""
    from schemas import BookingResponse
    
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


# Simple in-memory cache for stats
_stats_cache = {"data": None, "timestamp": 0}
_STATS_CACHE_TTL = 30  # seconds

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/bookings", response_model=PaginatedBookingResponse)
def list_all_bookings(
    lang: str = Query("en"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=50, description="Items per page"),
    current_user = Depends(get_current_staff),
    session: Session = Depends(get_session)
):
    """List all bookings with pagination (staff only)"""
    # Get total count
    total_count = session.exec(select(func.count()).select_from(Booking)).one()
    pages = math.ceil(total_count / page_size) if total_count > 0 else 1

    # Get paginated bookings
    bookings = session.exec(
        select(Booking).order_by(Booking.created_at.desc())
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
    """Get dashboard statistics (staff only) - cached for 30 seconds"""
    global _stats_cache
    
    # Check cache
    now = time.time()
    if _stats_cache["data"] and (now - _stats_cache["timestamp"]) < _STATS_CACHE_TTL:
        return _stats_cache["data"]
    
    # Use COUNT queries instead of loading all rows
    total_bookings = session.exec(select(func.count()).select_from(Booking)).one()
    active_bookings = session.exec(
        select(func.count()).select_from(Booking).where(Booking.status == BookingStatus.CONFIRMED)
    ).one()
    pending_bookings = session.exec(
        select(func.count()).select_from(Booking).where(Booking.status == BookingStatus.PENDING)
    ).one()
    total_users = session.exec(select(func.count()).select_from(User)).one()
    total_rooms = session.exec(select(func.count()).select_from(Room)).one()
    
    # Revenue: use SUM aggregate instead of loading all rows
    total_revenue_result = session.exec(
        select(func.coalesce(func.sum(Booking.total_price), 0)).where(Booking.status == BookingStatus.CONFIRMED)
    ).one()
    
    result = {
        "total_bookings": total_bookings,
        "active_bookings": active_bookings,
        "pending_bookings": pending_bookings,
        "total_users": total_users,
        "total_rooms": total_rooms,
        "total_revenue": total_revenue_result
    }
    
    # Cache the result
    _stats_cache = {"data": result, "timestamp": now}
    
    return result


# Staff management endpoints (admin only)
@router.post("/staff", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
def create_staff_account(
    staff_data: StaffCreate,
    current_admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    """Create a new staff account (admin only)"""
    # Validate password strength (same rules as customer registration)
    password_error = validate_password(staff_data.password)
    if password_error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=password_error
        )

    # Check if email already exists
    existing_user = session.exec(select(User).where(User.email == staff_data.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = ph.hash(staff_data.password)
    
    # Combine first and last name for backward compatibility
    full_name = f"{staff_data.first_name} {staff_data.last_name}".strip()
    
    # Create staff user
    staff = User(
        email=staff_data.email,
        hashed_password=hashed_password,
        name=full_name,
        first_name=staff_data.first_name,
        last_name=staff_data.last_name,
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
