"""
Migration script to populate first_name and last_name for existing users
who only have the 'name' field populated.

This script is idempotent - it only updates users where first_name is NULL.
"""

from sqlmodel import Session, select
from database import engine, init_db
from models import User


def migrate_names():
    """Migrate existing user names into first_name/last_name fields."""
    print("🔄 Starting name migration...")

    init_db()

    with Session(engine) as session:
        # Find users who have a name but no first_name
        users_to_migrate = session.exec(
            select(User).where(
                User.name != None,
                User.name != "",
                User.first_name == None
            )
        ).all()

        if not users_to_migrate:
            print("✅ No users need migration. All first_name fields are populated.")
            return

        print(f"📝 Found {len(users_to_migrate)} user(s) to migrate...")

        migrated_count = 0
        for user in users_to_migrate:
            full_name = user.name.strip()
            if not full_name:
                continue

            # Split on first space: first word = first_name, rest = last_name
            parts = full_name.split(" ", 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ""

            user.first_name = first_name
            user.last_name = last_name

            migrated_count += 1
            print(f"  ✅ Migrated user {user.email}: '{full_name}' -> first='{first_name}', last='{last_name}'")

        if migrated_count > 0:
            session.commit()
            print(f"\n🎉 Migration complete! {migrated_count} user(s) updated.")
        else:
            print("\n✅ No users were migrated.")


if __name__ == "__main__":
    migrate_names()