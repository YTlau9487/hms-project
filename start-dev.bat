@echo off
echo Starting HMS Project Development Environment with Docker...
echo.

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running or not accessible.
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Docker is running. Building and starting development environment...
echo.

REM Build and start the development environment
docker-compose up --build

if %errorlevel% neq 0 (
    echo.
    echo Error occurred while starting the development environment.
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo Development environment started successfully!
echo Access your application at: http://localhost:3000
echo Press Ctrl+C to stop the containers.
echo.

pause