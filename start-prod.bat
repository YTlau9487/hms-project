@echo off
echo Starting HMS Project Production Environment...
echo.

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running or not accessible.
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Docker is running. Building and starting production environment...
echo.

REM Build and start the production environment
docker compose -f docker-compose.prod.yml up --build -d

if %errorlevel% neq 0 (
    echo.
    echo Error occurred while starting the production environment.
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo Production environment started successfully!
echo Access your application at: http://localhost
echo.
echo Useful commands:
echo   View logs:     docker compose -f docker-compose.prod.yml logs -f
echo   Stop:          docker compose -f docker-compose.prod.yml down
echo   Restart:       docker compose -f docker-compose.prod.yml restart
echo.

pause