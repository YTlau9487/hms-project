#!/usr/bin/env python3
"""
Migration script to add the notification table to an existing database.
This script only creates the missing notification table without affecting other tables.
"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import inspect, text
from database import engine, init_db
from models import Notification


def migrate():
    """Run the migration to add the notification table."""
    inspector = inspect(engine)
    
    # Check if notification table already exists
    if "notification" in inspector.get_table_names():
        print("Notification table already exists. No migration needed.")
        return
    
    print("Creating notification table...")
    
    # Create only the notification table
    Notification.__table__.create(engine)
    
    print("Notification table created successfully!")


if __name__ == "__main__":
    migrate()