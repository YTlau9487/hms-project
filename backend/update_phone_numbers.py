"""
Migration script to update phone numbers to E.164 format (without spaces).
This script updates existing phone numbers in the database.
"""

from sqlmodel import Session, select
from database import engine, init_db
from models import User

def update_phone_numbers():
    """Update phone numbers to E.164 format"""
    print("🔄 Updating phone numbers to E.164 format...")

    # Initialize database tables
    init_db()

    with Session(engine) as session:
        # Get all users with phone numbers
        users = session.exec(select(User).where(User.phone.is_not(None))).all()
        
        if not users:
            print("✅ No users with phone numbers found.")
            return

        updated_count = 0
        for user in users:
            if user.phone and ' ' in user.phone:
                # Remove spaces from phone number
                old_phone = user.phone
                new_phone = old_phone.replace(' ', '')
                user.phone = new_phone
                session.add(user)
                print(f"✅ Updated {user.email}: {old_phone} -> {new_phone}")
                updated_count += 1

        if updated_count > 0:
            session.commit()
            print(f"\n🎉 Successfully updated {updated_count} phone number(s)!")
        else:
            print("✅ All phone numbers are already in E.164 format.")

if __name__ == "__main__":
    update_phone_numbers()