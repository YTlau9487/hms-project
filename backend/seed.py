"""
Seed script to populate database with test data.
Creates test accounts for customer and staff, sample rooms, and bookings.
This script is idempotent - it only creates data if it doesn't already exist.
"""

import os
from sqlmodel import Session, select
from database import engine, init_db
from models import (
    User, Room, Booking, UserRole, RoomStatus, BookingStatus, RoomType,
    RoomTranslation, Amenity, AmenityTranslation, RoomAmenity, RoomImage
)
from argon2 import PasswordHasher
from datetime import date, datetime, timedelta

ph = PasswordHasher()

# Translation data for rooms
ROOM_TRANSLATIONS = {
    0: [  # Premier King Room
        {"language": "en", "name": "Premier King Room", "description": "Luxurious king-sized room with stunning city views, featuring modern amenities and elegant design."},
        {"language": "zh-TW", "name": "豪華大床房", "description": "寬敞豪華的大床房，享有壯麗的城市景觀，配備現代化設施和優雅設計。"},
        {"language": "zh-CN", "name": "豪华大床房", "description": "宽敞豪华的大床房，享有壮丽的城市景观，配备现代化设施和优雅设计。"},
    ],
    1: [  # Deluxe Twin Room
        {"language": "en", "name": "Deluxe Twin Room", "description": "Comfortable twin room perfect for friends or colleagues traveling together."},
        {"language": "zh-TW", "name": "豪華雙床房", "description": "舒適的雙床房，非常適合朋友或同事一起旅行。"},
        {"language": "zh-CN", "name": "豪华双床房", "description": "舒适的双床房，非常适合朋友或同事一起旅行。"},
    ],
    2: [  # Presidential Suite
        {"language": "en", "name": "Presidential Suite", "description": "The ultimate luxury experience with panoramic harbor views and exclusive butler service."},
        {"language": "zh-TW", "name": "總統套房", "description": "極致奢華體驗，享有全景海港景觀和專屬管家服務。"},
        {"language": "zh-CN", "name": "总统套房", "description": "极致奢华体验，享有全景海港景观和专属管家服务。"},
    ],
    3: [  # Harbor View Executive
        {"language": "en", "name": "Harbor View Executive", "description": "Executive room with the best harbor views, perfect for business travelers."},
        {"language": "zh-TW", "name": "海港景觀行政房", "description": "享有最佳海港景觀的行政房，非常適合商務旅客。"},
        {"language": "zh-CN", "name": "海港景观行政房", "description": "享有最佳海港景观的行政房，非常适合商务旅客。"},
    ],
}

# Amenity translations: each tuple is (en, zh-TW, zh-CN)
AMENITY_TRANSLATIONS = [
    ("King Bed", "大床", "大床"),
    ("City View", "城市景觀", "城市景观"),
    ("Free WiFi", "免費WiFi", "免费WiFi"),
    ("Smart TV", "智能電視", "智能电视"),
    ("Minibar", "迷你吧", "迷你吧"),
    ("Twin Beds", "雙床", "双床"),
    ("Garden View", "花園景觀", "花园景观"),
    ("Rain Shower", "花灑", "花洒"),
    ("Work Desk", "工作桌", "工作桌"),
    ("Master Suite", "主套房", "主套房"),
    ("Living Area", "客廳區域", "客厅区域"),
    ("Personal Butler", "專屬管家", "专属管家"),
    ("Kitchenette", "小廚房", "小厨房"),
    ("Panoramic View", "全景景觀", "全景景观"),
    ("Lounge Access", "酒廊使用權", "酒廊使用权"),
    ("Harbor View", "海港景觀", "海港景观"),
    ("Nespresso", "Nespresso咖啡機", "Nespresso咖啡机"),
    ("High-Speed WiFi", "高速WiFi", "高速WiFi"),
]

# Room-amenity mapping: room index -> list of amenity indices
ROOM_AMENITY_MAP = {
    0: [0, 1, 2, 3, 4],       # Premier King: King Bed, City View, Free WiFi, Smart TV, Minibar
    1: [5, 6, 2, 7, 8],       # Deluxe Twin: Twin Beds, Garden View, Free WiFi, Rain Shower, Work Desk
    2: [9, 10, 11, 12, 13],   # Presidential: Master Suite, Living Area, Personal Butler, Kitchenette, Panoramic View
    3: [14, 15, 16, 8, 17],   # Harbor Exec: Lounge Access, Harbor View, Nespresso, Work Desk, High-Speed WiFi
}

# Room images: room index -> list of image URLs (ordered, first is primary)
# Using Pexels CDN which is accessible in Hong Kong region
# All images are 1920px wide (1080p+) and room/hotel related
ROOM_IMAGES = {
    0: [  # Premier King Room (Luxury) - luxury hotel rooms with king beds
        "https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "https://images.pexels.com/photos/164558/pexels-photo-164558.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "https://images.pexels.com/photos/250698/pexels-photo-250698.jpeg?auto=compress&cs=tinysrgb&w=1920",
    ],
    1: [  # Deluxe Twin Room (Standard) - clean standard hotel rooms
        "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "https://images.pexels.com/photos/276552/pexels-photo-276552.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1920",
    ],
    2: [  # Presidential Suite (Suite) - luxury suites and living areas
        "https://images.pexels.com/photos/1838640/pexels-photo-1838640.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "https://images.pexels.com/photos/2343468/pexels-photo-2343468.jpeg?auto=compress&cs=tinysrgb&w=1920",
    ],
    3: [  # Harbor View Executive (Business) - modern business hotel rooms
        "https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg?auto=compress&cs=tinysrgb&w=1920",
        "https://images.pexels.com/photos/271612/pexels-photo-271612.jpeg?auto=compress&cs=tinysrgb&w=1920",
    ],
}


def add_special_requests_column():
    """Add special_requests column to booking table if it doesn't exist."""
    import sqlite3
    db_path = "hotel.db"
    if not os.path.exists(db_path):
        print("Database not found. Skipping migration.")
        return
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(booking)")
    columns = [row[1] for row in cursor.fetchall()]
    if "special_requests" not in columns:
        cursor.execute("ALTER TABLE booking ADD COLUMN special_requests VARCHAR(100)")
        conn.commit()
        print("✅ Added special_requests column to booking table.")
    else:
        print("✅ special_requests column already exists.")
    conn.close()


def add_notification_read_at_column():
    """Add read_at column to notification table if it doesn't exist."""
    import sqlite3
    db_path = "hotel.db"
    if not os.path.exists(db_path):
        print("Database not found. Skipping migration.")
        return
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(notification)")
    columns = [row[1] for row in cursor.fetchall()]
    if "read_at" not in columns:
        cursor.execute("ALTER TABLE notification ADD COLUMN read_at DATETIME")
        conn.commit()
        print("✅ Added read_at column to notification table.")
    else:
        print("✅ read_at column already exists.")
    conn.close()


def seed_database():
    """Seed database with test data"""
    print("🌱 Starting database seeding...")

    # Run migrations for existing databases
    add_special_requests_column()
    add_notification_read_at_column()

    # Initialize database tables
    init_db()

    with Session(engine) as session:
        # Check if data already exists
        existing_users = session.exec(select(User)).all()
        if existing_users:
            print("✅ Database already seeded. Skipping...")
            return

        print("📝 Creating test accounts...")

        # Create test customer
        customer = User(
            email="customer@test.com",
            hashed_password=ph.hash("password123"),
            name="Test Customer",
            first_name="Test",
            last_name="Customer",
            phone="+85298765432",
            role=UserRole.CUSTOMER
        )
        session.add(customer)

        # Create test staff
        staff = User(
            email="staff@test.com",
            hashed_password=ph.hash("password123"),
            name="Test Staff",
            first_name="Test",
            last_name="Staff",
            phone="+85223456789",
            role=UserRole.STAFF
        )
        session.add(staff)

        # Create admin account (from env vars or default)
        admin_email = os.environ.get("ADMIN_EMAIL", "admin@test.com")
        admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
        admin_name = os.environ.get("ADMIN_NAME", "System Admin")
        
        # Split admin name into first/last if it contains a space
        admin_name_parts = admin_name.split(" ", 1)
        admin_first = admin_name_parts[0] if len(admin_name_parts) > 0 else admin_name
        admin_last = admin_name_parts[1] if len(admin_name_parts) > 1 else ""
        
        admin = User(
            email=admin_email,
            hashed_password=ph.hash(admin_password),
            name=admin_name,
            first_name=admin_first,
            last_name=admin_last,
            phone="+85211111111",
            role=UserRole.ADMIN
        )
        session.add(admin)

        session.commit()
        session.refresh(customer)
        session.refresh(staff)
        session.refresh(admin)

        print(f"✅ Created customer: {customer.email} (ID: {customer.id})")
        print(f"✅ Created staff: {staff.email} (ID: {staff.id})")
        print(f"✅ Created admin: {admin.email} (ID: {admin.id})")

        print("🏷️ Creating amenities with translations...")

        # Create amenities and their translations
        amenity_objects = []
        for en_name, tw_name, cn_name in AMENITY_TRANSLATIONS:
            amenity = Amenity()
            session.add(amenity)
            session.commit()
            session.refresh(amenity)

            for lang, name in [("en", en_name), ("zh-TW", tw_name), ("zh-CN", cn_name)]:
                trans = AmenityTranslation(
                    amenity_id=amenity.id,
                    language=lang,
                    name=name
                )
                session.add(trans)

            amenity_objects.append(amenity)
            print(f"✅ Created amenity: {en_name}")

        session.commit()

        print("🏨 Creating sample rooms with translations...")

        # Create sample rooms
        rooms_data = [
            {
                "price": 280.0,
                "image_url": "https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=1920",
                "size_sqm": 38,
                "adults": 2,
                "children": 0,
                "status": RoomStatus.AVAILABLE,
                "featured": False,
                "room_type": RoomType.LUXURY
            },
            {
                "price": 240.0,
                "image_url": "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=1920",
                "size_sqm": 35,
                "adults": 2,
                "children": 0,
                "status": RoomStatus.AVAILABLE,
                "featured": False,
                "room_type": RoomType.STANDARD
            },
            {
                "price": 850.0,
                "image_url": "https://images.pexels.com/photos/1838640/pexels-photo-1838640.jpeg?auto=compress&cs=tinysrgb&w=1920",
                "size_sqm": 120,
                "adults": 4,
                "children": 2,
                "status": RoomStatus.AVAILABLE,
                "featured": True,
                "room_type": RoomType.SUITE
            },
            {
                "price": 420.0,
                "image_url": "https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?auto=compress&cs=tinysrgb&w=1920",
                "size_sqm": 45,
                "adults": 2,
                "children": 1,
                "status": RoomStatus.AVAILABLE,
                "featured": False,
                "room_type": RoomType.BUSINESS
            }
        ]

        created_rooms = []
        for i, room_data in enumerate(rooms_data):
            room = Room(**room_data)
            session.add(room)
            session.commit()
            session.refresh(room)

            # Add translations
            for trans_data in ROOM_TRANSLATIONS[i]:
                trans = RoomTranslation(
                    room_id=room.id,
                    language=trans_data["language"],
                    name=trans_data["name"],
                    description=trans_data["description"]
                )
                session.add(trans)

            # Add amenity links
            for amenity_idx in ROOM_AMENITY_MAP[i]:
                link = RoomAmenity(
                    room_id=room.id,
                    amenity_id=amenity_objects[amenity_idx].id
                )
                session.add(link)

            # Add room images
            for order, image_url in enumerate(ROOM_IMAGES[i]):
                room_image = RoomImage(
                    room_id=room.id,
                    image_url=image_url,
                    order=order
                )
                session.add(room_image)

            session.commit()
            created_rooms.append(room)
            print(f"✅ Created room: {ROOM_TRANSLATIONS[i][0]['name']} (ID: {room.id})")

        print("📅 Creating sample bookings...")

        # Create sample bookings for customer
        today = date.today()
        bookings_data = [
            {
                "user_id": customer.id,
                "room_id": created_rooms[0].id,  # Premier King Room
                "check_in": today + timedelta(days=7),
                "check_out": today + timedelta(days=10),
                "status": BookingStatus.CONFIRMED,
                "total_price": 280.0 * 3,  # 3 nights
                "package_name": "Breakfast Included"
            },
            {
                "user_id": customer.id,
                "room_id": created_rooms[2].id,  # Presidential Suite
                "check_in": today + timedelta(days=14),
                "check_out": today + timedelta(days=18),
                "status": BookingStatus.PENDING,
                "total_price": 850.0 * 4,  # 4 nights
                "package_name": "Ultimate VIP"
            }
        ]

        for booking_data in bookings_data:
            booking = Booking(**booking_data)
            session.add(booking)
            session.commit()
            session.refresh(booking)
            print(f"✅ Created booking: {booking.id} for room {booking.room_id}")

        print("\n" + "="*50)
        print("🎉 Database seeding completed successfully!")
        print("="*50)
        print("\n📋 Test Credentials:")
        print("   Customer: customer@test.com / password123")
        print("   Staff:    staff@test.com / password123")
        print("\n🏨 Sample Rooms: 4 rooms created (with en/zh-TW/zh-CN translations)")
        print("🏷️ Amenities: 18 amenities created (with translations)")
        print("📅 Sample Bookings: 2 bookings created")
        print("="*50)


if __name__ == "__main__":
    seed_database()