# HMS Project (Hotel Management System)

A modern hotel management system built with React, Vite, and Material-UI.

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

The Docker setup provides a consistent development environment across all operating systems.

#### Prerequisites
- Docker Desktop installed and running on your system
- Ensure Docker is set to use Linux containers (Windows users)

#### Quick Start

**Windows Users:**
1. Double-click `start-dev.bat` to start the development environment
2. Or run in command prompt: `docker-compose up --build dev`

**Linux/macOS Users:**
1. Make the script executable: `chmod +x start-dev.sh`
2. Run the script: `./start-dev.sh`
3. Or run directly: `docker-compose up --build dev`

The application will be available at `http://localhost:3000`

#### Development with Docker Compose
```bash
# Start development environment
docker-compose up dev

# Stop the container
docker-compose down

# Run in detached mode
docker-compose up -d dev

# View logs
docker-compose logs -f dev
```

### Option 2: Local Development (Not Recommended)

If you prefer not to use Docker, you can set up the project locally:

#### Prerequisites
- Node.js (v18 or higher)
- pnpm package manager

#### Installation
```bash
# Install dependencies
pnpm i

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/
│   ├── components/     # React components
│   │   ├── ui/        # Reusable UI components
│   │   └── ...        # Feature-specific components
│   └── App.tsx         # Main App component
├── components/         # Shared components
├── styles/            # CSS and styling files
└── main.tsx           # Entry point
```

## 🛠️ Development

### Adding New Components
1. Create component files in the appropriate directory
2. Follow the existing naming conventions
3. Import and use the component in your application

### Styling
The project uses Tailwind CSS for styling. Component-specific styles should be included in the component file.

### Building for Production
```bash
# Build the application
pnpm build

# Preview the production build
pnpm preview
```

## 🐳 Docker Development

### Files
- `Dockerfile` - Production-optimized multi-stage build
- `Dockerfile.dev` - Development-specific build
- `docker-compose.yml` - Orchestration for development and production
- `.dockerignore` - Excludes unnecessary files from Docker build context
- `start-dev.bat` / `start-dev.sh` - Cross-platform startup scripts

### Features
- **Consistent Environment**: Works the same on Windows, macOS, and Linux
- **Real-time Updates**: Changes to React components are immediately reflected
- **Isolated Dependencies**: Node.js and pnpm are contained within the Docker image
- **Volume Mounting**: Code changes are reflected immediately without rebuilding

## 📚 Documentation

For detailed information about the Docker setup, troubleshooting, and advanced usage, see [DOCKER.md](DOCKER.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit with a descriptive message
5. Push and create a pull request

## 📄 License

This project is licensed under the MIT License.