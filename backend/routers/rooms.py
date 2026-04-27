from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List, Optional
from datetime import date, timedelta

from database import get_session
from models import (
    Room, RoomStatus, RoomTranslation, Amenity, AmenityTranslation, RoomAmenity,
    Booking, BookingStatus
)
from schemas import (
    RoomLocalizedResponse, RoomCreate, RoomUpdate,
    RoomAdminResponse, RoomTranslationAdmin, AmenityAdmin, AmenityTranslationAdmin,
    AvailabilityResponse
)
from routers.auth import get_current_staff, get_current_admin

router = APIRouter(prefix="/api/rooms", tags=["rooms"])

SUPPORTED_LANGUAGES = ["en", "zh-TW", "zh-CN"]
DEFAULT_LANGUAGE = "en"


def get_best_translation(translations: list, lang: str) -> dict:
    """Get translation for requested language, falling back to English, then empty strings."""
    # Build lookup dict
    trans_map = {t.language if hasattr(t, 'language') else t['language']: t for t in translations}

    # Try requested language
    if lang in trans_map:
        t = trans_map[lang]
        return {
            "name": t.name if hasattr(t, 'name') else t['name'],
            "description": t.description if hasattr(t, 'description') else t['description']
        }

    # Fallback to English
    if DEFAULT_LANGUAGE in trans_map:
        t = trans_map[DEFAULT_LANGUAGE]
        return {
            "name": t.name if hasattr(t, 'name') else t['name'],
            "description": t.description if hasattr(t, 'description') else t['description']
        }

    # Last resort: empty strings
    return {"name": "", "description": ""}


def get_best_amenity_name(translation_obj, lang: str) -> str:
    """Get amenity name for requested language with fallback."""
    if hasattr(translation_obj, 'language'):
        # ORM object
        trans_map = {}
        # We need all translations for this amenity - handled at call site
        return translation_obj.name if translation_obj.language == lang else ""
    return ""


def build_localized_room(room: Room, lang: str, session: Session) -> dict:
    """Build a localized room response from Room ORM object."""
    # Get room translations
    room_trans = session.exec(
        select(RoomTranslation).where(RoomTranslation.room_id == room.id)
    ).all()

    trans_data = get_best_translation(room_trans, lang)

    # Get amenity names in requested language with fallback
    amenity_names = []
    for amenity in room.amenities:
        amenity_trans = session.exec(
            select(AmenityTranslation).where(AmenityTranslation.amenity_id == amenity.id)
        ).all()

        # Build lookup
        trans_map = {t.language: t.name for t in amenity_trans}

        name = trans_map.get(lang) or trans_map.get(DEFAULT_LANGUAGE) or ""
        if name:
            amenity_names.append(name)

    return {
        "id": room.id,
        "name": trans_data["name"],
        "description": trans_data["description"],
        "price": room.price,
        "image_url": room.image_url,
        "size_sqm": int(room.size_sqm) if room.size_sqm is not None else None,
        "adults": int(room.adults) if room.adults is not None else 2,
        "children": int(room.children) if room.children is not None else 0,
        "amenities": amenity_names,
        "status": room.status,
        "featured": room.featured,
        "room_type": room.room_type,
    }


@router.get("/", response_model=List[RoomLocalizedResponse])
def list_rooms(
    status: Optional[RoomStatus] = None,
    featured: Optional[bool] = None,
    lang: str = Query("en"),
    session: Session = Depends(get_session)
):
    """List all rooms with optional filters and localized content"""
    query = select(Room)

    if status:
        query = query.where(Room.status == status)
    if featured is not None:
        query = query.where(Room.featured == featured)

    query = query.order_by(Room.id.asc())
    rooms = session.exec(query).all()

    return [build_localized_room(room, lang, session) for room in rooms]


@router.get("/availability", response_model=AvailabilityResponse)
def check_availability(
    check_in: date = Query(..., description="Check-in date (YYYY-MM-DD)"),
    check_out: date = Query(..., description="Check-out date (YYYY-MM-DD)"),
    guests: Optional[int] = Query(None, ge=1, description="Minimum guest capacity"),
    lang: str = Query("en"),
    session: Session = Depends(get_session)
):
    """Check room availability for given dates (public endpoint)"""
    today = date.today()
    
    # Validate dates
    if check_out <= check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be after check-in date"
        )
    
    if check_in < today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in date cannot be in the past"
        )
    
    # Max 1 month stay
    max_date = check_in + timedelta(days=31)
    if check_out > max_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum stay duration is 1 month"
        )

    # Build query for available rooms using SQL overlap predicate
    # A room is unavailable if there exists a non-cancelled booking where:
    # existing.check_in < requested.check_out AND existing.check_out > requested.check_in
    query = select(Room).where(
        Room.id.not_in(
            select(Booking.room_id).where(
                Booking.status != BookingStatus.CANCELLED,
                Booking.check_in < check_out,
                Booking.check_out > check_in,
            )
        )
    )
    
    # Filter by guest capacity if specified
    if guests is not None:
        query = query.where(Room.adults >= guests)
    
    query = query.order_by(Room.id.asc())
    available_rooms = session.exec(query).all()

    return AvailabilityResponse(
        rooms=[build_localized_room(room, lang, session) for room in available_rooms],
        check_in=check_in,
        check_out=check_out,
    )


@router.get("/{room_id}", response_model=RoomLocalizedResponse)
def get_room(
    room_id: int,
    lang: str = Query("en"),
    session: Session = Depends(get_session)
):
    """Get room by ID with localized content"""
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    return build_localized_room(room, lang, session)


@router.get("/{room_id}/admin", response_model=RoomAdminResponse)
def get_room_admin(
    room_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_staff)
):
    """Get room with all translations for admin editing"""
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    # Get all room translations
    room_trans = session.exec(
        select(RoomTranslation).where(RoomTranslation.room_id == room_id)
    ).all()

    # Ensure all 3 languages are represented (fill empty ones)
    trans_by_lang = {t.language: t for t in room_trans}
    translations = []
    for lang in SUPPORTED_LANGUAGES:
        if lang in trans_by_lang:
            t = trans_by_lang[lang]
            translations.append(RoomTranslationAdmin(
                language=lang, name=t.name, description=t.description
            ))
        else:
            translations.append(RoomTranslationAdmin(
                language=lang, name="", description=""
            ))

    # Get all amenities with their translations
    amenity_admins = []
    for amenity in room.amenities:
        amenity_trans = session.exec(
            select(AmenityTranslation).where(AmenityTranslation.amenity_id == amenity.id)
        ).all()

        trans_by_lang = {t.language: t for t in amenity_trans}
        amenity_translations = []
        for lang in SUPPORTED_LANGUAGES:
            if lang in trans_by_lang:
                t = trans_by_lang[lang]
                amenity_translations.append(AmenityTranslationAdmin(
                    language=lang, name=t.name
                ))
            else:
                amenity_translations.append(AmenityTranslationAdmin(
                    language=lang, name=""
                ))

        amenity_admins.append(AmenityAdmin(
            id=amenity.id,
            translations=amenity_translations
        ))

    return RoomAdminResponse(
        id=room.id,
        price=room.price,
        image_url=room.image_url,
        size_sqm=room.size_sqm,
        adults=room.adults,
        children=room.children,
        status=room.status,
        featured=room.featured,
        room_type=room.room_type,
        translations=translations,
        amenities=amenity_admins,
    )


@router.post("/", response_model=RoomAdminResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    room_data: RoomCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin)
):
    """Create a new room with translations and amenities (admin only)"""
    # Create room
    room = Room(
        price=room_data.price,
        image_url=room_data.image_url,
        size_sqm=room_data.size_sqm,
        adults=room_data.adults,
        children=room_data.children,
        status=room_data.status,
        featured=room_data.featured,
        room_type=room_data.room_type,
    )
    session.add(room)
    session.commit()
    session.refresh(room)

    # Create room translations
    for trans_input in room_data.translations:
        trans = RoomTranslation(
            room_id=room.id,
            language=trans_input.language,
            name=trans_input.name,
            description=trans_input.description,
        )
        session.add(trans)

    # Create amenities and their translations
    created_amenities = []
    for amenity_input in room_data.amenities:
        amenity = Amenity()
        session.add(amenity)
        session.commit()
        session.refresh(amenity)

        for trans_input in amenity_input.translations:
            trans = AmenityTranslation(
                amenity_id=amenity.id,
                language=trans_input.language,
                name=trans_input.name,
            )
            session.add(trans)

        # Link amenity to room
        link = RoomAmenity(room_id=room.id, amenity_id=amenity.id)
        session.add(link)
        created_amenities.append(amenity)

    session.commit()

    # Return admin response
    return get_room_admin(room.id, session, current_user)


@router.put("/{room_id}", response_model=RoomAdminResponse)
def update_room(
    room_id: int,
    room_data: RoomUpdate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin)
):
    """Update a room with translations and amenities (admin only)"""
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    # Update room fields
    update_data = room_data.dict(exclude_unset=True, exclude={"translations", "amenities"})
    for key, value in update_data.items():
        setattr(room, key, value)

    session.add(room)

    # Update translations if provided
    if room_data.translations is not None:
        # Delete existing translations
        existing_trans = session.exec(
            select(RoomTranslation).where(RoomTranslation.room_id == room_id)
        ).all()
        for t in existing_trans:
            session.delete(t)

        # Create new translations
        for trans_input in room_data.translations:
            trans = RoomTranslation(
                room_id=room_id,
                language=trans_input.language,
                name=trans_input.name,
                description=trans_input.description,
            )
            session.add(trans)

    # Update amenities if provided
    if room_data.amenities is not None:
        # Delete existing amenity links
        existing_links = session.exec(
            select(RoomAmenity).where(RoomAmenity.room_id == room_id)
        ).all()
        for link in existing_links:
            session.delete(link)

        # Delete existing amenity translations and amenities that are no longer linked
        # (We'll just create new ones for simplicity)

        # Create new amenities
        for amenity_input in room_data.amenities:
            amenity = Amenity()
            session.add(amenity)
            session.commit()
            session.refresh(amenity)

            for trans_input in amenity_input.translations:
                trans = AmenityTranslation(
                    amenity_id=amenity.id,
                    language=trans_input.language,
                    name=trans_input.name,
                )
                session.add(trans)

            link = RoomAmenity(room_id=room_id, amenity_id=amenity.id)
            session.add(link)

    session.commit()

    return get_room_admin(room_id, session, current_user)


def check_room_occupancy(room_id: int, session: Session, check_date: date = None) -> bool:
    """Check if room has any active or future bookings. Returns True if occupied."""
    today = check_date or date.today()
    
    # Check for active bookings (guest currently staying)
    active_booking = session.exec(
        select(Booking).where(
            Booking.room_id == room_id,
            Booking.status != BookingStatus.CANCELLED,
            Booking.check_in <= today,
            Booking.check_out > today,
        )
    ).first()
    
    if active_booking:
        return True
    
    # Check for future bookings
    future_booking = session.exec(
        select(Booking).where(
            Booking.room_id == room_id,
            Booking.status != BookingStatus.CANCELLED,
            Booking.check_in > today,
        )
    ).first()
    
    if future_booking:
        return True
    
    return False


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    room_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin)
):
    """Delete a room (admin only) - blocked if room has active or future bookings"""
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    # Check for active or future bookings
    if check_room_occupancy(room_id, session):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete room: Room has active or future bookings"
        )

    # Delete RoomAmenity links first
    existing_links = session.exec(
        select(RoomAmenity).where(RoomAmenity.room_id == room_id)
    ).all()
    for link in existing_links:
        session.delete(link)

    # Delete the room (cascade will handle translations and bookings)
    session.delete(room)
    session.commit()
