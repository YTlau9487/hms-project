from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List, Optional

from database import get_session
from models import Room, RoomStatus
from schemas import RoomResponse, RoomCreate, RoomUpdate
from routers.auth import get_current_staff

router = APIRouter(prefix="/api/rooms", tags=["rooms"])


@router.get("/", response_model=List[RoomResponse])
def list_rooms(
    status: Optional[RoomStatus] = None,
    featured: Optional[bool] = None,
    session: Session = Depends(get_session)
):
    """List all rooms with optional filters"""
    query = select(Room)
    
    if status:
        query = query.where(Room.status == status)
    if featured is not None:
        query = query.where(Room.featured == featured)
    
    rooms = session.exec(query).all()
    return rooms


@router.get("/{room_id}", response_model=RoomResponse)
def get_room(room_id: int, session: Session = Depends(get_session)):
    """Get room by ID"""
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    return room


@router.post("/", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    room_data: RoomCreate,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_staff)
):
    """Create a new room (staff only)"""
    room = Room(**room_data.dict())
    session.add(room)
    session.commit()
    session.refresh(room)
    return room


@router.put("/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: int,
    room_data: RoomUpdate,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_staff)
):
    """Update a room (staff only)"""
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    update_data = room_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(room, key, value)
    
    session.add(room)
    session.commit()
    session.refresh(room)
    return room


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    room_id: int,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_staff)
):
    """Delete a room (staff only)"""
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    session.delete(room)
    session.commit()