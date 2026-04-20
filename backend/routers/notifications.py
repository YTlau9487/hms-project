from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel

from database import get_session
from models import Notification, NotificationType, User
from schemas import NotificationResponse
from routers.auth import get_current_staff, get_current_admin


class BroadcastRequest(BaseModel):
    message: str

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


def create_notification(
    session: Session,
    notification_type: NotificationType,
    message: str,
    booking_id: int | None,
    user_id: int,
) -> Notification:
    """Create a notification, preventing duplicates for same booking+type+user."""
    if booking_id is not None:
        existing = session.exec(
            select(Notification).where(
                Notification.booking_id == booking_id,
                Notification.type == notification_type,
                Notification.user_id == user_id,
            )
        ).first()
        if existing:
            return existing

    notification = Notification(
        type=notification_type,
        message=message,
        booking_id=booking_id,
        user_id=user_id,
    )
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification


@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    current_user=Depends(get_current_staff),
    session: Session = Depends(get_session),
):
    """Get all notifications for staff users."""
    notifications = session.exec(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
    ).all()
    return notifications


@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    current_user=Depends(get_current_staff),
    session: Session = Depends(get_session),
):
    """Mark a notification as read."""
    notification = session.get(Notification, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    notification.read = True
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification


@router.post("/read-all")
def mark_all_notifications_read(
    current_user=Depends(get_current_staff),
    session: Session = Depends(get_session),
):
    """Mark all notifications as read."""
    notifications = session.exec(
        select(Notification).where(
            Notification.user_id == current_user.id,
            Notification.read == False,
        )
    ).all()
    for notification in notifications:
        notification.read = True
    session.commit()
    return {"message": "All notifications marked as read"}


# Admin-only notification management endpoints
@router.get("/admin", response_model=List[NotificationResponse])
def get_all_notifications_admin(
    current_user=Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Get all notifications (admin only)."""
    notifications = session.exec(
        select(Notification).order_by(Notification.created_at.desc())
    ).all()
    return notifications


@router.delete("/admin/{notification_id}")
def delete_notification_admin(
    notification_id: int,
    current_user=Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Delete a notification (admin only)."""
    notification = session.get(Notification, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    session.delete(notification)
    session.commit()
    return {"message": "Notification deleted successfully"}


@router.post("/admin/broadcast", response_model=NotificationResponse)
def broadcast_notification(
    request: BroadcastRequest,
    current_user=Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Broadcast a notification to all staff users (admin only)."""
    message = request.message
    # Get all staff users
    staff_users = session.exec(
        select(User).where(User.role == "staff")
    ).all()
    
    # Create notification for each staff user
    created_notifications = []
    for staff_user in staff_users:
        notification = Notification(
            type=NotificationType.BROADCAST,
            message=message,
            user_id=staff_user.id,
        )
        session.add(notification)
        created_notifications.append(notification)
    
    session.commit()
    
    # Return the first created notification as response
    if created_notifications:
        session.refresh(created_notifications[0])
        return created_notifications[0]
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="No staff users found",
    )
