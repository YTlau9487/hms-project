# Docker Setup for HMS Project

This project includes Docker configuration to ensure consistent development environments across all operating systems.

## Files Added

- `Dockerfile` - Production-optimized multi-stage build
- `Dockerfile.dev` - Development-specific build with pnpm store optimization
- `.dockerignore` - Excludes unnecessary files from Docker build context
- `docker-compose.yml` - Easy orchestration of development and production environments

## Prerequisites

- Docker Desktop installed and running on your system
- Ensure Docker is set to use Linux containers (Windows users)

## Quick Start

### Windows Users
1. Double-click `start-dev.bat` to start the development environment
2. Or run in command prompt: `docker-compose up --build dev`

### Linux/macOS Users
1. Make the script executable: `chmod +x start-dev.sh`
2. Run the script: `./start-dev.sh`
3. Or run directly: `docker-compose up --build dev`

## Usage

### Development with Docker Compose

1. Start the development environment:
   ```bash
   docker-compose up dev
   ```

2. The application will be available at `http://localhost:3000`

3. To stop the container:
   ```bash
   docker-compose down
   ```

4. To run in detached mode (in the background):
   ```bash
   docker-compose up -d dev
   ```

5. To view logs:
   ```bash
   docker-compose logs -f dev
   ```

### Direct Docker Build for Development

1. Build the development image:
   ```bash
   docker build -f Dockerfile.dev -t hms-dev .
   ```

2. Run the development container:
   ```bash
   docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules -v pnpm-store:/pnpm-store hms-dev
   ```

### Production Build

1. Build the production image:
   ```bash
   docker build -t hms-prod .
   ```

2. Run the production container:
   ```bash
   docker run -p 3000:3000 hms-prod
   ```

### Using Docker Compose for Production

1. Start the production environment:
   ```bash
   docker-compose up prod
   ```

2. To stop the container:
   ```bash
   docker-compose down
   ```

## Features

- **Consistent Environment**: Works the same on Windows, macOS, and Linux
- **Isolated Dependencies**: Node.js and pnpm are contained within the Docker image
- **Volume Mounting**: For development, code changes are reflected immediately without rebuilding
- **PNPM Store**: Dedicated volume for pnpm packages to improve build times
- **Multi-stage Builds**: Production builds are optimized for size and performance
- **Port Mapping**: Application is accessible on `localhost:3000`

## Troubleshooting

### Windows-specific Issues

1. If you encounter Docker Desktop connection errors:
   - Ensure Docker Desktop is running (check the system tray)
   - Try restarting Docker Desktop completely
   - Check that Docker is set to use Linux containers (Docker Desktop settings)
   - Try running your terminal as administrator
   - Reset Docker network: `docker network prune`

2. If you get permission errors:
   - Ensure your user account has Docker access
   - Try running your terminal as administrator
   - Check Docker Desktop settings for shared drives

3. If you see "cannot connect to the Docker daemon" errors:
   - Wait for Docker Desktop to fully start (it might take a minute or two)
   - Try the command: `docker context ls` and ensure you're using the correct context
   - Reset Docker: `docker system prune -a` (use with caution)

### General Issues

1. If the build fails:
   - Check that all files are present in the project directory
   - Ensure pnpm-lock.yaml exists
   - Try clearing Docker's build cache: `docker system prune -a`

2. If the application doesn't start:
   - Check the logs: `docker-compose logs dev`
   - Ensure port 3000 is available on your host machine

## Notes

- The development container mounts your source code as a volume, so changes made on your host machine are immediately reflected in the container.
- Node modules are installed inside the container, not on your host machine.
- The pnpm store is shared between builds to improve performance.
- The production build creates a standalone Node.js application with all dependencies included.
