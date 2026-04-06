#!/bin/bash
echo "Starting HMS Project Development Environment..."
echo ""

# Check if Docker is running
if ! docker version > /dev/null 2>&1; then
    echo "Docker is not running or not accessible."
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "Docker is running. Building and starting development environment..."
echo ""

# Build and start the development environment
docker compose -f docker-compose.yml up --build -d

if [ $? -ne 0 ]; then
    echo ""
    echo "Error occurred while starting the development environment."
    echo "Please check the error messages above."
    exit 1
fi

echo ""
echo "Development environment started successfully!"
echo "Access your application at: http://localhost:3000"
echo "API server at: http://localhost:8000"
echo ""
echo "Useful commands:"
echo "  View logs:     docker compose -f docker-compose.yml logs -f"
echo "  Stop:          docker compose -f docker-compose.yml down"
echo "  Restart:       docker compose -f docker-compose.yml restart"
echo "  Access DB:     docker compose -f docker-compose.yml exec backend sqlite3 /app/data/hotel.db"
echo ""