# Active Context: HMS (Hotel Management System)

## Current Work Focus
Memory bank review and update - ensuring all documentation is current and accurate. Project remains in a fully functional state with all core features complete.

## Recent Changes
- **Memory Bank Review** (2026-04-01): Reviewed and updated all memory bank files for accuracy and consistency
- **Development Dockerfile for Backend** (2026-04-01): Added `backend/Dockerfile.dev` with sqlite3 for debugging and dos2unix for Windows line ending fixes
- **Staff Navigation Fixes**: Fixed navigation for staff users on account pages
  - **Navbar Visibility**: Customer navigation items (Rooms, My Booking, My Profile, Amenities) now visible when staff users are on account pages
  - **Golden Mile Logo**: Redirects to `/?view=customer` for staff users when not on admin pages
  - **Rooms Button**: Redirects to `/?view=customer` for staff users
  - **Return to Exploring Button**: Redirects to `/?view=customer` for staff users in My Bookings
  - **Explore Rooms Button**: Redirects to `/?view=customer` for staff users in My Bookings
  - **Back Button**: Redirects to `/?view=customer` for staff users in My Profile
- **TypeScript Error Fix**: Fixed TypeScript error in AccountProfilePage by removing non-existent `updateProfile` function
- **i18n Translation Fix**: Fixed room size and occupancy translation in RoomCard component
- **Room Filter Fix**: Fixed room filter buttons functionality in HomePage

## Active Decisions and Considerations

### Architecture Decisions
- **Frontend**: React with TypeScript for type safety
- **Backend**: FastAPI for modern Python API development
- **Database**: SQLite with SQLModel ORM for simplicity
- **Styling**: Tailwind CSS + shadcn/ui for rapid UI development
- **Icons**: Lucide React for consistent icon system
- **Animations**: Framer Motion (motion) for page transitions
- **Toasts**: Sonner for notification system
- **Deployment**: Docker for consistent environments
- **Internationalization**: i18next with react-i18next for seamless language switching
- **Routing**: React Router v7 with nested layouts

### Current State
The project is a fully functional hotel management system with:
- Complete frontend with 19 application components + 50+ shadcn/ui primitives, all with i18n support
- 17 pages including 8 public informational pages
- 3 nested layouts (PublicLayout, AccountLayout, AdminLayout)
- Backend API with authentication, rooms, bookings, and admin endpoints
- Docker configuration for development and deployment
- Full internationalization support (EN, zh-TW, zh-CN)

### Component Inventory

#### Application Components (`src/app/components/`)
- **Navigation**: Navbar, Footer
- **Room**: RoomCard, RoomDetails, ImageWithFallback
- **Booking**: BookingModal, MyBookings
- **Auth**: AuthModal
- **Admin**: AdminPanel, ManageRooms
- **User**: UserProfile, PhoneInput
- **Layout**: StaticPageLayout
- **UI Helpers**: LoadingSpinner, ErrorMessage, ConfirmationDialog, NotificationDropdown
- **Hero**: Hero, EnhancedHero

#### shadcn/ui Primitives (`src/app/components/ui/`)
50+ components including: accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle-group, toggle, tooltip, use-mobile hook, utils

#### Pages (`src/app/pages/`)
- **Public**: HomePage, LoginPage, RegisterPage, RoomDetailsPage, AboutPage, RoomsAndSuitesPage, DiningPage, MeetingsEventsPage, PrivacyPage, TermsPage, CookiesPage, AccessibilityPage
- **Account**: AccountProfilePage, AccountBookingsPage
- **Admin**: AdminDashboardPage, AdminRoomsPage, AdminBookingsPage

#### Layouts (`src/app/layouts/`)
- PublicLayout (Navbar + Footer)
- AccountLayout (protected customer area)
- AdminLayout (protected staff area)

## Next Steps
- Test all three languages across all pages and user flows
- Verify no hardcoded strings remain in any component
- Check browser console for i18n missing key warnings
- Consider adding more languages if needed
- Document translation key naming conventions for future development

## Important Patterns and Preferences

### Code Organization
- Frontend components in `src/app/components/`
- shadcn/ui primitives in `src/app/components/ui/`
- Pages in `src/app/pages/`
- Layouts in `src/app/layouts/`
- Context in `src/app/context/`
- Services in `src/app/services/`
- Backend routes in `backend/routers/`
- Translation files in `src/locales/{language}/translation.json`
- Styles in `src/styles/` (fonts.css, index.css, tailwind.css, theme.css)

### Routing Pattern
```typescript
// Nested layout routes in App.tsx
<Routes>
  <Route element={<PublicLayout />}>
    <Route path="/" element={<HomePage />} />
    {/* ...public routes */}
  </Route>
  <Route element={<AccountLayout />}>
    <Route path="/account/profile" element={<AccountProfilePage />} />
    {/* ...protected customer routes */}
  </Route>
  <Route element={<AdminLayout />}>
    <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
    {/* ...protected staff routes */}
  </Route>
</Routes>
```

### Translation Pattern
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('myComponent.title')}</h1>;
}
```

### Translation Key Naming
- Namespaced by component: `navbar.home`, `roomCard.featured`
- Dot notation for hierarchy: `bookingModal.step1.title`
- Shared strings in `common.*` namespace

### Toast Pattern
```typescript
import { toast } from 'sonner';
toast.success('Success!', { description: 'Details here' });
toast.error('Error message');
```

## Learnings and Project Insights
- The project uses a clean separation between frontend and backend
- Authentication is JWT-based with role-based access control
- shadcn/ui provides a comprehensive set of accessible, composable UI primitives
- Nested layouts with React Router v7 provide clean route organization
- Framer Motion AnimatePresence enables smooth page transitions
- Internationalization is fully implemented with i18next
- All user-facing strings are externalized to translation files
- Language switching is seamless and persists across sessions
- Backend files are not tracked in git's working tree (only in Docker container)
- Phone input uses libphonenumber-js for international format validation