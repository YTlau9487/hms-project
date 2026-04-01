# Tech Context: HMS (Hotel Management System)

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI library |
| TypeScript | - | Type safety |
| Vite | 6.3.5 | Build tool and dev server |
| Tailwind CSS | 4.1.12 | Utility-first CSS framework |
| React Router | 7.13.0 | Client-side routing (nested layouts) |
| React Hook Form | 7.55.0 | Form management |
| shadcn/ui | - | Component library (50+ primitives) |
| Radix UI | Various | Accessible UI primitives (underlying shadcn/ui) |
| MUI | 7.3.5 | Material Design components (supplementary) |
| Lucide React | 0.487.0 | Icon system |
| Framer Motion | 12.23.24 | Page transitions and animations |
| Sonner | 2.0.3 | Toast notifications |
| i18next | 25.10.10 | Internationalization framework |
| react-i18next | 16.6.6 | React integration for i18next |
| date-fns | 3.6.0 | Date utilities |
| Recharts | 2.15.2 | Charts for admin dashboard |
| libphonenumber-js | 1.12.41 | Phone number validation/formatting |
| react-phone-number-input | 3.4.16 | Phone input component |
| class-variance-authority | 0.7.1 | Component variant styling (shadcn/ui) |
| clsx | 2.1.1 | Conditional class names |
| tailwind-merge | 3.2.0 | Tailwind class merging |
| cmdk | 1.1.1 | Command menu (shadcn/ui) |
| embla-carousel-react | 8.6.0 | Carousel component |
| react-day-picker | 8.10.1 | Date picker |
| react-dnd | 16.0.1 | Drag and drop |
| react-responsive-masonry | 2.7.1 | Masonry layout |
| react-slick | 0.31.0 | Slick carousel |
| vaul | 1.1.2 | Drawer component |
| tw-animate-css | 1.3.8 | Tailwind animation utilities |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | - | Web framework |
| SQLModel | - | ORM (SQLAlchemy + Pydantic) |
| SQLite | - | Database |
| Python-Jose | - | JWT token handling |
| argon2-cffi | 23.1.0 | Password hashing (Argon2id) |
| Uvicorn | - | ASGI server |

### DevOps
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| pnpm | 10.32.1 - Package manager (frontend) |
| pip | Package manager (backend) |

## Project Structure

```
HMS Project/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── i18n.ts                     # i18next configuration
│   ├── global.d.ts                 # TypeScript global declarations
│   ├── app/
│   │   ├── App.tsx                 # Root component with routing
│   │   ├── components/
│   │   │   ├── ui/                 # 50+ shadcn/ui primitives
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── RoomCard.tsx
│   │   │   ├── RoomDetails.tsx
│   │   │   ├── ImageWithFallback.tsx
│   │   │   ├── BookingModal.tsx
│   │   │   ├── MyBookings.tsx
│   │   │   ├── AuthModal.tsx
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── ManageRooms.tsx
│   │   │   ├── UserProfile.tsx
│   │   │   ├── PhoneInput.tsx
│   │   │   ├── StaticPageLayout.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── ConfirmationDialog.tsx
│   │   │   ├── NotificationDropdown.tsx
│   │   │   ├── Hero.tsx
│   │   │   └── EnhancedHero.tsx
│   │   ├── pages/                  # 17 pages
│   │   ├── layouts/                # 3 nested layouts
│   │   ├── context/                # React contexts
│   │   └── services/               # API services
│   ├── locales/
│   │   ├── en/translation.json
│   │   ├── zh-TW/translation.json
│   │   └── zh-CN/translation.json
│   └── styles/
│       ├── fonts.css
│       ├── index.css
│       ├── tailwind.css
│       └── theme.css
├── backend/
│   ├── Dockerfile                  # Production Dockerfile
│   ├── Dockerfile.dev              # Development Dockerfile
│   ├── main.py                     # FastAPI app entry
│   ├── database.py                 # DB connection
│   ├── models.py                   # SQLModel models
│   ├── schemas.py                  # Pydantic schemas
│   ├── seed.py                     # Database seeding
│   ├── update_phone_numbers.py     # Phone number utility
│   ├── start.sh                    # Container startup script
│   └── routers/                    # API route modules
│       ├── auth.py
│       ├── rooms.py
│       ├── bookings.py
│       └── admin.py
├── docker-compose.yml
├── Dockerfile.dev                  # Frontend dev Dockerfile
├── Dockerfile                      # Frontend prod Dockerfile
├── package.json
├── vite.config.ts
├── tsconfig.json
└── postcss.config.mjs
```

## Development Setup

### Prerequisites
- Docker Desktop (required - project runs exclusively via Docker)
- pnpm 10.32.1 (managed inside Docker container)

### Docker-Only Development
**Note**: This project runs exclusively via docker-compose. All local Python artifacts have been removed. Backend source files exist locally but are mounted into the container.

```bash
# Start all services (frontend + backend)
docker-compose up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs

# Reset database (after schema changes)
docker compose run --rm reset-db
```

### Docker Services
| Service | Port | Description |
|---------|------|-------------|
| backend | 8000 | FastAPI server (uses `Dockerfile.dev`) |
| dev | 3000 | React dev server (uses root `Dockerfile.dev`) |
| reset-db | - | One-time DB reset helper (tools profile) |

### Volumes
| Volume | Purpose |
|--------|---------|
| backend-data | Persistent SQLite database storage |
| pnpm-store | Package manager cache for faster rebuilds |

### Development Dockerfile (backend/Dockerfile.dev)
- Based on `python:3.11-slim`
- Includes sqlite3 for development debugging
- Installs dos2unix for Windows line ending compatibility
- Mounts local backend directory for live code reloading
- Runs with `start.sh` script for database seeding

## Configuration

### Environment Variables
| Variable | Value | Purpose |
|----------|-------|---------|
| `DOCKER_ENV` | `true` | Enables Docker-specific configuration |
| `NODE_ENV` | `development` | Node environment mode |
| `PYTHONUNBUFFERED` | `1` | Python unbuffered output |

### CORS Configuration
Allowed origins:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (Docker frontend)
- `http://127.0.0.1:5173`

### Database
- **Type**: SQLite
- **Location**: `/app/data/hotel.db` (inside container, persisted via volume)
- **ORM**: SQLModel (type-safe models)
- **Seeding**: Automatic on container startup via `seed.py`

## Routing Architecture

### Route Map
```
/                           → PublicLayout → HomePage
/rooms/:roomId              → PublicLayout → RoomDetailsPage
/login                      → PublicLayout → LoginPage
/register                   → PublicLayout → RegisterPage
/about                      → PublicLayout → AboutPage
/rooms-and-suites           → PublicLayout → RoomsAndSuitesPage
/dining                     → PublicLayout → DiningPage
/meetings-events            → PublicLayout → MeetingsEventsPage
/privacy                    → PublicLayout → PrivacyPage
/terms                      → PublicLayout → TermsPage
/cookies                    → PublicLayout → CookiesPage
/accessibility              → PublicLayout → AccessibilityPage
/account                    → AccountLayout → Redirect to /account/profile
/account/profile            → AccountLayout → AccountProfilePage (protected)
/account/bookings           → AccountLayout → AccountBookingsPage (protected)
/admin                      → AdminLayout → Redirect to /admin/dashboard
/admin/dashboard            → AdminLayout → AdminDashboardPage (staff only)
/admin/rooms                → AdminLayout → AdminRoomsPage (staff only)
/admin/bookings             → AdminLayout → AdminBookingsPage (staff only)
```

## Internationalization (i18n) Configuration

### Supported Languages
| Code | Language | Display Label |
|------|----------|---------------|
| en | English | EN |
| zh-TW | Traditional Chinese | 繁 |
| zh-CN | Simplified Chinese | 简 |

### Translation File Structure
```
src/
├── i18n.ts                    # i18next configuration
└── locales/
    ├── en/translation.json    # English translations
    ├── zh-TW/translation.json # Traditional Chinese translations
    └── zh-CN/translation.json # Simplified Chinese translations
```

### i18n Configuration (src/i18n.ts)
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import zhTW from './locales/zh-TW/translation.json';
import zhCN from './locales/zh-CN/translation.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'zh-TW': { translation: zhTW },
    'zh-CN': { translation: zhCN },
  },
  lng: 'en',
  fallbackLng: 'en',
});
```

### Using Translations in Components
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  // Access translation
  const title = t('myComponent.title');
  
  // Change language
  i18n.changeLanguage('zh-CN');
}
```

## API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- Auto-generated from FastAPI route decorators

## Test Credentials
- **Customer**: `customer@test.com` / `password123`
- **Staff**: `staff@test.com` / `password123`

## Build Outputs
- **Frontend**: `dist/` directory (Vite build)
- **Backend**: Runs directly via Python/Uvicorn
- **Docker Images**: Multi-stage builds for optimization

## Git Information
- **Repository**: https://github.com/YTlau9487/hms-project
- **Default Branch**: main
- **Latest Commit**: df163d0 - feat: switch backend to development Dockerfile (#6)
- **Memory bank files are gitignored** (in `.gitignore`: `memory-bank/`, `implementation_plan.md`)

## Memory Bank Status
- **Last Reviewed**: 2026-04-01
- **Files**: projectbrief.md, progress.md, activeContext.md, techContext.md
- **Status**: All files up-to-date and consistent with project state
