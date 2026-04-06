#!/bin/bash
echo "Starting HMS Project Production Environment..."
echo ""

# Check if Docker is running
if ! docker version > /dev/null 2>&1; then
    echo "Docker is not running or not accessible."
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "Docker is running. Building and starting production environment..."
echo ""

# Build and start the production environment
docker compose -f docker-compose.prod.yml up --build -d

if [ $? -ne 0 ]; then
    echo ""
    echo "Error occurred while starting the production environment."
    echo "Please check the error messages above."
    exit 1
fi

echo ""
echo "Production environment started successfully!"
echo "Access your application at: http://localhost"
echo ""
echo "Useful commands:"
echo "  View logs:     docker compose -f docker-compose.prod.yml logs -f"
echo "  Stop:          docker compose -f docker-compose.prod.yml down"
echo "  Restart:       docker compose -f docker-compose.prod.yml restart"
echo ""