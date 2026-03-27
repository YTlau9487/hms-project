#!/bin/bash

# Run seed script to populate database with test data
echo "Running database seed..."
python seed.py

# Start the FastAPI server
echo "Starting FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload