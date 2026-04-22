# HMS Project (Hotel Management System)

A full-stack hotel management system built with React, Vite, Tailwind CSS (frontend) and FastAPI, SQLite (backend).

## 🚀 Quick Start

### Using Docker (Recommended)

The Docker setup provides a complete development environment with both frontend and backend services.

#### Prerequisites
- Docker Desktop installed and running on your system
- Ensure Docker is set to use Linux containers (Windows users)

#### Quick Start

**Windows Users:**
1. Double-click `start-dev.bat` to start the development environment
2. Or run in command prompt: `docker-compose up --build`

**Linux/macOS Users:**
1. Make the script executable: `chmod +x start-dev.sh`
2. Run the script: `./start-dev.sh`
3. Or run directly: `docker-compose up --build`

#### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

#### Test Credentials
The system automatically seeds test accounts on startup:
- **Customer**: `customer@test.com` / `password123`
- **Staff**: `staff@test.com` / `password123`

#### Docker Commands
```bash
# Start all services
docker-compose up

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs -f

# Start only backend
docker-compose up backend

# Start only frontend (dev mode)
docker-compose up dev
```

## 📁 Project Structure

```
├── backend/                    # FastAPI backend
│   ├── routers/               # API route handlers
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── rooms.py          # Room management
│   │   ├── bookings.py       # Booking management
│   │   └── admin.py          # Admin endpoints
│   ├── models.py             # Database models
│   ├── schemas.py            # Pydantic schemas
│   ├── database.py           # Database configuration
│   ├── seed.py               # Database seeding script
│   └── main.py               # FastAPI application
├── src/                        # React frontend
│   ├── app/
│   │   ├── components/       # React components
│   │   ├── context/          # React context (AuthContext)
│   │   ├── layouts/          # Layout components
│   │   ├── pages/            # Page components
│   │   └── services/         # API service layer
│   ├── locales/              # i18n translations
│   └── main.tsx              # Entry point
├── docker-compose.yml          # Docker orchestration
├── Dockerfile                  # Production frontend build
├── Dockerfile.dev              # Development frontend build
└── backend/Dockerfile          # Backend Docker build
```

## 🔐 Authentication & Authorization

### User Roles
- **Customer**: View rooms, book, view bookings (/account/*)
- **Staff**: Operational dashboard, bookings, rooms, stay management (/staff/*)
- **Admin**: Oversight (staff management, rooms, notifications), separate login (/admin/*, 5-min timeout)

### Test Credentials
The system automatically seeds test accounts on startup:
- **Customer**: `customer@test.com` / `password123`
- **Staff**: `staff@test.com` / `password123`
- **Admin**: `admin@test.com` / `password123` (use /admin/login)

### Protected Routes
- `/account/*` - Customer
- `/staff/*` - Staff
- `/admin/*` - Admin


### API Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info
- `GET /api/rooms/` - List all rooms
- `GET /api/rooms/{id}` - Get room details
- `POST /api/bookings/` - Create booking
- `GET /api/bookings/my` - Get user's bookings
- `GET /api/admin/stats` - Get dashboard statistics (staff only)
- `GET /api/admin/bookings` - Get all bookings (staff only)

## 🛠️ Development

### Frontend Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Internationalization (i18n)
The frontend supports multiple languages:
- **English (EN)** - Default language
- **Traditional Chinese (繁/zh-TW)** - 繁體中文
- **Simplified Chinese (简/zh-CN)** - 简体中文

#### Language Switching
- Use the language switcher in the Navbar to cycle through languages
- Language preference persists across sessions
- All 20+ frontend components are fully translated

#### Translation Files
- `src/locales/en/translation.json` - English translations
- `src/locales/zh-TW/translation.json` - Traditional Chinese translations
- `src/locales/zh-CN/translation.json` - Simplified Chinese translations

#### Adding New Languages
1. Create a new translation file in `src/locales/{language-code}/translation.json`
2. Add the language to `src/i18n.ts` resources
3. Update the language switcher in `Navbar.tsx`

### Backend Development
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database seed
python seed.py

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### API Documentation
The backend provides automatic API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🐳 Docker Configuration

### Development Setup

#### Services
- **backend**: FastAPI server on port 8000
- **dev**: Vite development server on port 3000

#### Volumes
- `backend-data`: SQLite database persistence
- `pnpm-store`: pnpm package cache

#### Environment Variables
- `DOCKER_ENV=true`: Enables Docker-specific configuration
- `VITE_API_URL`: Backend API URL for frontend proxy

### Production Deployment

The production setup uses Nginx as a reverse proxy to serve the frontend and proxy API requests to the backend.

#### Quick Start

**Windows:**
```bash
start-prod.bat
```

**Linux/macOS:**
```bash
./start-prod.sh
```

#### Access
- **Application**: http://localhost (port 80)
- **Backend API**: Not exposed publicly (accessible only via Nginx proxy)

#### Production Commands
```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop
docker compose -f docker-compose.prod.yml down

# Restart
docker compose -f docker-compose.prod.yml restart

# Reset database
docker compose -f docker-compose.prod.yml down -v && docker compose -f docker-compose.prod.yml up --build -d
```

#### Production Architecture
```
Port 80 → Nginx (frontend container)
  ├── Serves static files (built React app)
  └── /api/* → backend:8000 (internal network only)
```

#### Production Deployment Scenarios

The production Nginx configuration (`nginx/nginx.conf`) supports three deployment scenarios:

##### Scenario A: Traditional Nginx HTTP (Default)
- Nginx listens on port 80 with `server_name _;` (accepts any host header).
- Suitable for:
  - Local testing or on-prem deployments
  - Behind another reverse proxy or load balancer
  - VPS deployments without SSL
- **No configuration changes needed** — just start the production stack.

##### Scenario B: Nginx with HTTPS + SSL Certificates
- To let Nginx terminate HTTPS directly:
  1. Obtain valid SSL certificates (e.g., via Let's Encrypt or another CA).
  2. Mount them into the container at `/etc/nginx/ssl/` by adding a volume in `docker-compose.prod.yml`:
     ```yaml
     volumes:
       - ./nginx/ssl:/etc/nginx/ssl:ro
     ```
  3. Edit `nginx/nginx.conf`:
     - Set `server_name` to your actual domain(s).
     - Uncomment the HTTPS server block (`listen 443 ssl http2;` and `ssl_certificate` lines).
     - Optionally enable the HTTP → HTTPS redirect server block.
  4. Rebuild: `docker compose -f docker-compose.prod.yml up --build -d`
- The `nginx/nginx.conf` file includes a commented-out example for reference.
- For advanced SSL/TLS tuning, refer to the [official Nginx documentation](https://nginx.org/en/docs/http/configuring_https_servers.html).

##### Scenario C: Deployment Behind Cloudflare Tunnel (No Port Forwarding)
- Nginx still listens on HTTP port 80 inside the container.
- Cloudflare Tunnel runs on the host and forwards traffic from Cloudflare's edge to `http://localhost:80`.
- HTTPS is terminated at Cloudflare; Nginx only serves plain HTTP.
- **Setup steps:**
  1. Run the production stack: `./start-prod.sh` or `start-prod.bat`
  2. Install `cloudflared` on the host machine.
  3. Create a tunnel and route your hostname (e.g., `hotel.yourdomain.com`) to `http://localhost:80`.
  4. Ensure Cloudflare DNS points the hostname to the tunnel.
- The application code and Nginx config do not need special changes for Cloudflare Tunnel. Cloudflare handles encryption and DNS, while the Nginx container exposes a standard HTTP endpoint on port 80.
- For detailed Cloudflare Tunnel setup and options, please refer to the [official Cloudflare documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/).

> **Note:** If your deployment scenario does not fall exactly into the examples above, you can still use the same Docker + Nginx setup as a base and adapt it. Please refer to the [official Nginx documentation](https://nginx.org/en/docs/) and your hosting provider's guides for advanced or custom configurations.

## 📚 Documentation

For detailed information about the Docker setup, troubleshooting, and advanced usage, see [DOCKER.md](DOCKER.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit with a descriptive message
5. Push and create a pull request

## 📄 License

This is a student project for educational purposes. All rights reserved.
