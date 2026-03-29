#!/bin/bash

echo "Starting HMS Project Development Environment with Docker..."
echo ""

# Check if Docker is running
if ! docker version > /dev/null 2>&1; then
    echo "Docker is not running or not accessible."
    echo "Please start Docker and try again."
    exit 1
fi

echo "Docker is running. Building and starting development environment..."
echo ""

# Build and start the development environment
if ! docker-compose up --build; then
    echo ""
    echo "Error occurred while starting the development environment."
    echo "Please check the error messages above."
    exit 1
fi

echo ""
echo "Development environment started successfully!"
echo "Access your application at: http://localhost:3000"
echo "Press Ctrl+C to stop the containers."
echo ""

# Keep the script running to maintain the terminal session
exec "$@"