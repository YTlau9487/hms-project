"""
Seed script to populate database with test data.
Creates test accounts for customer and staff, sample rooms, and bookings.
This script is idempotent - it only creates data if it doesn't already exist.
"""

from sqlmodel import Session, select
from database import engine, init_db
from models import User, Room, Booking, UserRole, RoomStatus, BookingStatus
from argon2 import PasswordHasher
from datetime import date, datetime, timedelta

ph = PasswordHasher()


def seed_database():
    """Seed database with test data"""
    print("🌱 Starting database seeding...")
    
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
            phone="+852 1234 5678",
            role=UserRole.CUSTOMER
        )
        session.add(customer)
        
        # Create test staff
        staff = User(
            email="staff@test.com",
            hashed_password=ph.hash("password123"),
            name="Test Staff",
            phone="+852 8765 4321",
            role=UserRole.STAFF
        )
        session.add(staff)
        
        session.commit()
        session.refresh(customer)
        session.refresh(staff)
        
        print(f"✅ Created customer: {customer.email} (ID: {customer.id})")
        print(f"✅ Created staff: {staff.email} (ID: {staff.id})")
        
        print("🏨 Creating sample rooms...")
        
        # Create sample rooms
        rooms_data = [
            {
                "name": "Premier King Room",
                "description": "Luxurious king-sized room with stunning city views, featuring modern amenities and elegant design.",
                "price": 280.0,
                "image_url": "https://images.unsplash.com/photo-1590490359854-dfba19688d70?w=800",
                "size": "38 sq.m",
                "occupancy": "2 Adults",
                "amenities": "King Bed,City View,Free WiFi,Smart TV,Minibar",
                "status": RoomStatus.AVAILABLE,
                "featured": False
            },
            {
                "name": "Deluxe Twin Room",
                "description": "Comfortable twin room perfect for friends or colleagues traveling together.",
                "price": 240.0,
                "image_url": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
                "size": "35 sq.m",
                "occupancy": "2 Adults",
                "amenities": "Twin Beds,Garden View,Free WiFi,Rain Shower,Work Desk",
                "status": RoomStatus.AVAILABLE,
                "featured": False
            },
            {
                "name": "Presidential Suite",
                "description": "The ultimate luxury experience with panoramic harbor views and exclusive butler service.",
                "price": 850.0,
                "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
                "size": "120 sq.m",
                "occupancy": "4 Adults",
                "amenities": "Master Suite,Living Area,Personal Butler,Kitchenette,Panoramic View",
                "status": RoomStatus.AVAILABLE,
                "featured": True
            },
            {
                "name": "Harbor View Executive",
                "description": "Executive room with the best harbor views, perfect for business travelers.",
                "price": 420.0,
                "image_url": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
                "size": "45 sq.m",
                "occupancy": "2 Adults",
                "amenities": "Lounge Access,Harbor View,Nespresso,Work Desk,High-Speed WiFi",
                "status": RoomStatus.AVAILABLE,
                "featured": False
            }
        ]
        
        created_rooms = []
        for room_data in rooms_data:
            room = Room(**room_data)
            session.add(room)
            session.commit()
            session.refresh(room)
            created_rooms.append(room)
            print(f"✅ Created room: {room.name} (ID: {room.id})")
        
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
        print("\n🏨 Sample Rooms: 4 rooms created")
        print("📅 Sample Bookings: 2 bookings created")
        print("="*50)


if __name__ == "__main__":
    seed_database()