"""
Migration script to update room fields from old format to new format.
Converts:
  - size (string like "38 sq.m") -> size_sqm (integer like 38)
  - occupancy (string like "2 Adults") -> adults (integer) and children (integer)
"""

from sqlmodel import Session, select
from database import engine, init_db
from models import Room

def migrate_rooms():
    """Migrate room data from old format to new format."""
    print("🔄 Starting room field migration...")
    
    init_db()
    
    with Session(engine) as session:
        rooms = session.exec(select(Room)).all()
        
        if not rooms:
            print("✅ No rooms to migrate.")
            return
        
        migrated_count = 0
        for room in rooms:
            needs_update = False
            
            # Migrate size to size_sqm
            if room.size_sqm is None and hasattr(room, 'size') and room.size:
                # Try to extract number from size string like "38 sq.m"
                import re
                match = re.search(r'(\d+)', room.size)
                if match:
                    room.size_sqm = int(match.group(1))
                    needs_update = True
                    print(f"  Room {room.id}: size '{room.size}' -> size_sqm {room.size_sqm}")
            
            # Migrate occupancy to adults/children
            if room.adults is None and hasattr(room, 'occupancy') and room.occupancy:
                # Try to extract number from occupancy string like "2 Adults"
                import re
                match = re.search(r'(\d+)', room.occupancy)
                if match:
                    room.adults = int(match.group(1))
                    room.children = 0  # Default to 0 children
                    needs_update = True
                    print(f"  Room {room.id}: occupancy '{room.occupancy}' -> adults {room.adults}, children {room.children}")
            
            # Set defaults if still None
            if room.size_sqm is None:
                room.size_sqm = 0
                needs_update = True
            
            if room.adults is None:
                room.adults = 2
                room.children = 0
                needs_update = True
            
            if needs_update:
                session.add(room)
                migrated_count += 1
        
        if migrated_count > 0:
            session.commit()
            print(f"\n✅ Migrated {migrated_count} rooms.")
        else:
            print("✅ All rooms already have correct format.")

if __name__ == "__main__":
    migrate_rooms()