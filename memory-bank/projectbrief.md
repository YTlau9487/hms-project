# Project Brief: HMS (Hotel Management System)

## Overview
A full-stack hotel management system that enables customers to browse and book hotel rooms, while providing staff with administrative tools to manage rooms, bookings, and view business statistics. The system features a professional hotel website with informational pages and full internationalization support.

## Core Requirements

### User Management
- Two user roles: Customer and Staff
- JWT-based authentication
- User registration and login with phone number support
- Role-based access control
- User profile management

### Room Management
- Display available rooms with details (price, size, amenities, images)
- Room status management (available/unavailable)
- Featured rooms highlighting
- Staff can add, edit, and delete rooms
- Image upload with fallback handling

### Booking System
- Customers can book rooms for specific dates
- Date validation and availability checking
- Booking status tracking (pending, confirmed, cancelled)
- Price calculation based on room rate and duration
- Package options for bookings

### Admin Dashboard
- View booking statistics and revenue charts
- Manage all bookings across the system
- Room inventory management
- User management capabilities

### Public Website Pages
- Homepage with hero section and room listings
- Rooms & Suites overview page
- Dining page
- Meetings & Events page
- About page
- Legal pages: Privacy, Terms, Cookies, Accessibility
- Consistent layout via StaticPageLayout component

### Internationalization (i18n)
- Multi-language support: English, Traditional Chinese (zh-TW), Simplified Chinese (zh-CN)
- Language switcher in navigation bar
- All user-facing strings translated across all components
- Consistent language experience across the entire application

## Technical Goals
- Modern, responsive UI with Tailwind CSS + shadcn/ui components
- Type-safe development with TypeScript (frontend) and Python type hints (backend)
- Nested layout routing with React Router v7
- RESTful API design with FastAPI
- SQLite database with SQLModel ORM
- Docker containerization for easy deployment
- Full internationalization (i18n) support with i18next
- Animation support with Framer Motion (motion)

## Success Criteria
- Customers can successfully browse rooms and make bookings
- Staff can efficiently manage rooms and view business metrics
- System handles concurrent bookings without conflicts
- Application is deployable via Docker with minimal setup
- Users can switch between 3 languages seamlessly with all text properly translated
- Public website pages provide professional hotel information presentation
- Phone number input supports international formats

## Memory Bank Status
- **Last Reviewed**: 2026-04-01
- **Files**: projectbrief.md, progress.md, activeContext.md, techContext.md
- **Status**: All files up-to-date and consistent with project state
