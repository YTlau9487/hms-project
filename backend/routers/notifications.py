import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel
from datetime import datetime, timezone

from database import get_session
from models import Notification, NotificationType, User
from schemas import NotificationResponse, NotificationReadersResponse, NotificationReaderResponse
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
    message_key: str | None = None,
    message_params: dict | None = None,
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
        message_key=message_key,
        message_params=json.dumps(message_params) if message_params else None,
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
    """Get all notifications for the current staff user.

    NOTE: This endpoint is intentionally restricted to staff/admin users only.
    Customer users will receive a 403 Forbidden response. This is by design -
    notifications are used for staff operational awareness (new bookings,
    check-ins, check-outs, cancellations). Customers do not have a notification
    inbox; they see booking status updates via the /api/bookings/my endpoint.
    """
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
    notification.read_at = datetime.now(timezone.utc)
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
        notification.read_at = datetime.now(timezone.utc)
    session.commit()
    return {"message": "All notifications marked as read"}


# Admin-only notification management endpoints
@router.get("/admin", response_model=List[NotificationResponse])
def get_all_notifications_admin(
    current_user=Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Get all notifications for staff users only (admin only)."""
    notifications = session.exec(
        select(Notification)
        .join(User, Notification.user_id == User.id)
        .where(User.role == "staff")
        .order_by(Notification.created_at.desc())
    ).all()
    return notifications


@router.get("/admin/{notification_id}/readers", response_model=NotificationReadersResponse)
def get_notification_readers(
    notification_id: int,
    current_user=Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """Get all staff users with their read status for a specific notification (admin only).

    Groups notifications by booking_id (for booking-related) or message (for broadcasts)
    and returns per-staff read status.
    """
    # Get the target notification
    target_notification = session.get(Notification, notification_id)
    if not target_notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    # Find all staff notifications with the same booking_id or message
    if target_notification.booking_id is not None:
        # Group by booking_id for booking-related notifications
        related_notifications = session.exec(
            select(Notification)
            .join(User, Notification.user_id == User.id)
            .where(
                User.role == "staff",
                Notification.booking_id == target_notification.booking_id,
                Notification.type == target_notification.type,
            )
        ).all()
    else:
        # Group by message for broadcast notifications
        related_notifications = session.exec(
            select(Notification)
            .join(User, Notification.user_id == User.id)
            .where(
                User.role == "staff",
                Notification.message == target_notification.message,
                Notification.type == target_notification.type,
            )
        ).all()

    # Build readers list
    readers = []
    for notif in related_notifications:
        user = session.get(User, notif.user_id)
        if user:
            readers.append(NotificationReaderResponse(
                user_id=user.id,
                name=user.name,
                first_name=user.first_name,
                last_name=user.last_name,
                read=notif.read,
                read_at=notif.read_at,
            ))

    read_count = sum(1 for r in readers if r.read)

    # Parse message_params from JSON string
    message_params = None
    if target_notification.message_params:
        try:
            message_params = json.loads(target_notification.message_params)
        except json.JSONDecodeError:
            message_params = None

    return NotificationReadersResponse(
        notification_id=notification_id,
        type=target_notification.type,
        message=target_notification.message,
        message_key=target_notification.message_key,
        message_params=message_params,
        created_at=target_notification.created_at,
        readers=readers,
        read_count=read_count,
        total_count=len(readers),
    )


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
