# System Patterns: HMS (Hotel Management System)

## Architecture Overview

### Full-Stack Architecture
```
┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │    Backend      │
│   (React/Vite)  │────▶│   (FastAPI)     │
│   Port 3000     │     │   Port 8000     │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │    SQLite DB    │
                        │  (SQLModel ORM) │
                        └─────────────────┘
```

### Frontend Architecture (React + TypeScript)
- **Component-Based**: Modular React components with clear responsibilities
- **Context API**: AuthContext for global authentication state
- **Service Layer**: Centralized API calls in `services/api.ts`
- **Layout System**: Reusable layouts (Public, Account, Admin)
- **Routing**: React Router for SPA navigation
- **Internationalization**: i18next for multi-language support (en, zh-TW, zh-CN)

### Backend Architecture (FastAPI + Python)
- **Router Pattern**: Modular route handlers in `routers/` directory
- **Dependency Injection**: FastAPI's Depends for auth and DB sessions
- **ORM Pattern**: SQLModel for type-safe database operations
- **Schema Validation**: Pydantic schemas for request/response validation

## Key Technical Patterns

### Authentication Pattern
```
Client Request → JWT Token → FastAPI Dependency → Protected Route
                     ↓
              Verify Token → Extract User → Authorize Role
```

### API Communication Pattern
```
Frontend Service → HTTP Request → FastAPI Router → Business Logic → Database
       ↓                                                              ↓
  State Update ←─────────────────────────────────────────────── Response
```

### Internationalization (i18n) Pattern
```
User Selects Language → i18next Changes Language → useTranslation Hook → t() Function
                              ↓
                    Translation JSON Files (en/zh-TW/zh-CN)
                              ↓
                    Component Re-renders with New Language
```

### Database Pattern
- **SQLModel**: Combines SQLAlchemy ORM with Pydantic validation
- **Relationships**: Foreign keys with cascade options
- **Enums**: Type-safe status fields (UserRole, BookingStatus, RoomStatus)

## Component Patterns

### Frontend Components
- **Pages**: Route-level components (HomePage, AdminDashboardPage)
- **Layouts**: Wrapper components for consistent structure
- **UI Components**: Reusable UI elements (Button, Card, Dialog)
- **Feature Components**: Business logic components (BookingModal, RoomCard)

### State Management
- **AuthContext**: User authentication state, login/logout functions
- **Local State**: Component-level state with useState
- **Form State**: React Hook Form for form management
- **Language State**: i18next manages current language and translations

### Translation Pattern
```typescript
// Component with translations
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('myComponent.title')}</h1>
      <p>{t('myComponent.description')}</p>
    </div>
  );
}
```

## API Design Patterns

### RESTful Endpoints
- `GET /api/rooms/` - List resources
- `GET /api/rooms/{id}` - Get single resource
- `POST /api/bookings/` - Create resource
- `PUT /api/rooms/{id}` - Update resource
- `DELETE /api/rooms/{id}` - Delete resource

### Error Handling
- HTTP status codes for different error types
- Consistent error response format
- Client-side error boundaries and fallbacks

### Data Validation
- Pydantic schemas on backend
- React Hook Form validation on frontend
- Type safety with TypeScript

## Security Patterns

### Authentication
- JWT tokens with expiration
- Password hashing with Argon2id (argon2-cffi)
- Protected route middleware

### Authorization
- Role-based access control (Customer vs Staff)
- Route-level permission checks
- API endpoint protection

### Data Protection
- CORS configuration for allowed origins
- Input validation and sanitization
- SQL injection prevention via ORM

## Internationalization Patterns

### Translation File Structure
```
src/locales/
├── en/
│   └── translation.json
├── zh-TW/
│   └── translation.json
└── zh-CN/
    └── translation.json
```

### Translation Key Naming Convention
- Namespaced by component: `navbar.home`, `roomCard.featured`
- Dot notation for hierarchy: `bookingModal.step1.title`
- Shared strings in `common.*` namespace

### Language Switching
- Toggle cycles: EN → 繁 → 简 → EN
- Display labels: EN, 繁, 简
- Language persists across sessions via i18next