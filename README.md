# HMS Project (Hotel Management System)

A full-stack hotel management system built with React, Vite, Tailwind CSS (frontend) and FastAPI, SQLite (backend). Features a professional hotel website with full internationalization support, SEO optimization, and administrative tools for hotel staff.

## 🚀 Quick Start

### Using Docker (Recommended)

The Docker setup provides a complete development environment with both frontend and backend services.

#### Prerequisites
- Docker Desktop installed and running on your system

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
- **Admin**: `admin@test.com` / `admin123` (use /admin/login)

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

# Reset database (after schema changes)
docker compose run --rm reset-db
```

## ✨ Features

### Customer Features
- **Room Browsing**: Browse available rooms with detailed information, images, and pricing
- **Online Booking**: Book rooms with date selection and real-time availability checking
- **Booking Management**: View booking history with pagination, cancel bookings
- **User Profile**: Manage account information with international phone number support
- **Multi-Language Support**: Use the application in English, Traditional Chinese, or Simplified Chinese

### Staff Features
- **Admin Dashboard**: View booking statistics and revenue metrics (cached for performance)
- **Room Management**: Add, edit, and delete rooms with multilingual content
- **Booking Management**: View all bookings with pagination, confirm/cancel bookings
- **Stay Management**: Process check-ins and check-outs
- **Notification System**: Real-time alerts for booking events

### Admin Features
- **Staff Management**: Create and delete staff accounts
- **System Notifications**: Broadcast messages to all users
- **Full System Oversight**: Complete control over rooms, bookings, users, and notifications

### Website Features
- **Professional Hotel Website**: 9 public informational pages with consistent layout
- **SEO Optimized**: Lighthouse SEO score of 92 with dynamic meta tags and JSON-LD structured data
- **Accessibility**: Lighthouse Accessibility score of 90+ with ARIA labels and keyboard navigation
- **Performance Optimized**: Code splitting, chunk splitting, and CLS prevention for fast loading
- **Responsive Design**: Optimized for both desktop and mobile users

## 📁 Project Structure

```
HMS Project/
├── backend/                    # FastAPI backend
│   ├── routers/               # API route handlers
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── rooms.py          # Room management + multilingual support
│   │   ├── bookings.py       # Booking management + pagination
│   │   ├── admin.py          # Admin endpoints + caching
│   │   └── notifications.py  # Notification system
│   ├── models.py             # SQLModel database models
│   ├── schemas.py            # Pydantic schemas
│   ├── database.py           # Database configuration + SQLite pragmas
│   ├── seed.py               # Database seeding script
│   ├── migrate_names.py      # Migration script for name standardization
│   └── main.py               # FastAPI application
├── src/                        # React frontend
│   ├── app/
│   │   ├── components/       # React components
│   │   │   ├── ui/           # 50+ shadcn/ui primitives
│   │   │   ├── Navbar.tsx    # Navigation with language switcher
│   │   │   ├── Footer.tsx    # Footer with social links
│   │   │   ├── RoomCard.tsx  # Room display with aspect-ratio
│   │   │   ├── BookingModal.tsx
│   │   │   ├── SkeletonLoader.tsx
│   │   │   └── ...           # 20+ more components
│   │   ├── context/          # React contexts (AuthContext)
│   │   ├── layouts/          # 4 nested layouts
│   │   ├── pages/            # 21+ pages (19 lazy-loaded)
│   │   ├── services/         # API service layer
│   │   └── utils/            # Utility functions (SEO, etc.)
│   ├── locales/              # i18n translations
│   │   ├── en/translation.json
│   │   ├── zh-TW/translation.json
│   │   └── zh-CN/translation.json
│   ├── styles/               # CSS styles
│   ├── i18n.ts               # i18next configuration
│   └── main.tsx              # Entry point
├── public/                     # Static files
│   ├── robots.txt            # Search engine crawl directives
│   └── sitemap.xml           # XML sitemap
├── nginx/                      # Production Nginx configuration
│   └── nginx.conf
├── docker-compose.yml          # Development Docker orchestration
├── docker-compose.prod.yml     # Production Docker orchestration
├── Dockerfile                  # Production frontend build
├── Dockerfile.dev              # Development frontend build
├── Dockerfile.prod             # Production frontend Dockerfile
└── backend/Dockerfile          # Backend Docker build
```

## 🔐 Authentication & Authorization

### User Roles
- **Customer**: View rooms, book rooms, view bookings (`/account/*`)
- **Staff**: Operational dashboard, bookings, rooms, stay management (`/staff/*`)
- **Admin**: Full oversight (staff management, rooms, notifications), separate login (`/admin/*`, 5-min timeout)

### Protected Routes
- `/account/*` - Customer area
- `/staff/*` - Staff area
- `/admin/*` - Admin area

### Security Features
- JWT authentication with token expiration
- Password hashing with Argon2id
- Role-based access control
- CORS configuration for allowed origins
- Input validation with Pydantic schemas

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Rooms
- `GET /api/rooms/` - List all rooms (with filters)
- `GET /api/rooms/{id}` - Get room details
- `POST /api/rooms/` - Create room (staff)
- `PUT /api/rooms/{id}` - Update room (staff)
- `DELETE /api/rooms/{id}` - Delete room (staff)

### Bookings
- `POST /api/bookings/` - Create booking
- `GET /api/bookings/my?page=1&page_size=20` - Get user's bookings (paginated)
- `PUT /api/bookings/{id}/cancel` - Cancel booking
- `PUT /api/bookings/{id}/check-in` - Check-in (staff)
- `PUT /api/bookings/{id}/check-out` - Check-out (staff)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics (cached, staff only)
- `GET /api/admin/bookings?page=1&page_size=20` - Get all bookings (paginated, staff only)

### Notifications
- `GET /api/notifications/` - List user notifications
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `DELETE /api/notifications/{id}` - Delete notification
- `POST /api/notifications/broadcast` - Broadcast to all users (admin only)

### API Documentation
The backend provides automatic API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🌍 Internationalization (i18n)

The frontend supports multiple languages:
- **English (EN)** - Default language
- **Traditional Chinese (繁/zh-TW)** - 繁體中文
- **Simplified Chinese (简/zh-CN)** - 简体中文

### Language Switching
- Use the language switcher in the Navbar to cycle through languages
- Language preference persists across sessions
- All components are fully translated
- Room and amenity content translated per language

### Translation Files
- `src/locales/en/translation.json` - English translations
- `src/locales/zh-TW/translation.json` - Traditional Chinese translations
- `src/locales/zh-CN/translation.json` - Simplified Chinese translations

## 🎨 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18.3.1 | UI library |
| TypeScript | Type safety |
| Vite 6.3.5 | Build tool and dev server |
| Tailwind CSS 4.1.12 | Utility-first CSS framework |
| React Router 7.13.0 | Client-side routing with nested layouts |
| shadcn/ui | 50+ accessible component primitives |
| Radix UI | Accessible UI primitives |
| Lucide React | Icon system |
| Framer Motion | Page transitions and animations |
| Sonner | Toast notifications |
| i18next + react-i18next | Internationalization |
| Recharts | Charts for admin dashboard |
| react-helmet-async | SEO meta tag management |
| React Hook Form | Form management |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | Web framework |
| SQLModel | ORM (SQLAlchemy + Pydantic) |
| SQLite (WAL mode) | Database |
| Python-Jose | JWT token handling |
| argon2-cffi | Password hashing (Argon2id) |
| Uvicorn | ASGI server |

### DevOps
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Nginx | Reverse proxy and static file serving |

## 🚀 Performance Optimization

### Frontend
- **Code Splitting**: 17 pages lazy-loaded with React.lazy + Suspense
- **Vite Chunk Splitting**: Vendor libraries separated into chunks (react, ui, motion, chart, i18n, form)
- **CLS Prevention**: Skeleton loaders and aspect-ratio containers
- **Image Optimization**: Lazy loading for below-the-fold, eager for hero images
- **Non-blocking i18n**: `initImmediate: true` for fast initialization

### Backend
- **SQLite WAL Mode**: Better concurrent read/write performance
- **Batch Loading**: Eliminates N+1 queries in booking lists
- **Stats Caching**: 30-second in-memory cache for dashboard stats
- **Optimized Queries**: COUNT and SUM aggregates instead of loading all rows
- **Pagination**: Default 20 items per page, max 50

## 📄 Pages & Routing

### Public Pages
| Route | Description | Loading |
|-------|-------------|---------|
| `/` | Homepage with hero and room listings | Eager |
| `/rooms-and-suites` | Rooms overview page | Lazy |
| `/dining` | Dining information | Lazy |
| `/meetings-events` | Meetings & Events | Lazy |
| `/about` | About the hotel | Lazy |
| `/privacy` | Privacy Policy | Lazy |
| `/terms` | Terms & Conditions | Lazy |
| `/cookies` | Cookies Policy | Lazy |
| `/accessibility` | Accessibility statement | Lazy |
| `/availability` | Room availability checking | Lazy |
| `/login` | Login page (noindex) | Eager |
| `/register` | Registration page (noindex) | Eager |
| `/*` | 404 Not Found | Lazy |

### Account Pages (Protected)
| Route | Description |
|-------|-------------|
| `/account/profile` | User profile management |
| `/account/bookings` | Booking history (paginated) |

### Staff Pages (Protected)
| Route | Description |
|-------|-------------|
| `/staff/dashboard` | Admin dashboard with stats |
| `/staff/rooms` | Room management |
| `/staff/bookings` | All bookings (paginated) |
| `/staff/stay-management/:action` | Check-in/check-out processing |

### Admin Pages (Protected)
| Route | Description |
|-------|-------------|
| `/admin/staff` | Staff account management |
| `/admin/rooms` | Room management |
| `/admin/notifications` | System notifications |
| `/admin/login` | Admin login (separate, 5-min timeout) |

## 🐳 Docker Configuration

### Development Setup
- **backend**: FastAPI server on port 8000
- **dev**: Vite development server on port 3000
- **reset-db**: One-time database reset helper

### Production Deployment

The production setup uses Nginx as a reverse proxy to serve the frontend and proxy API requests to the backend.

#### Quick Start
```bash
# Windows
start-prod.bat

# Linux/macOS
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

For detailed production deployment options including SSL and Cloudflare Tunnel, see the full documentation below.

## 📚 Documentation

- [DOCKER.md](DOCKER.md) - Detailed Docker setup and troubleshooting
- [main-readme.md](main-readme.md) - Additional project documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit with a descriptive message
5. Push and create a pull request

## 📄 License

This is a student project for educational purposes. All rights reserved.
