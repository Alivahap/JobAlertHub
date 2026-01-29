# Kamu İlan - Government Job Announcements Platform

## Overview

A Turkish government job announcements tracking platform that allows users to register, select their professions, and receive filtered job announcements relevant to their selected fields. The application uses a React frontend with Express backend, PostgreSQL database, and includes push notification support for real-time alerts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for smooth transitions
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **Language**: TypeScript with ESM modules
- **API Structure**: RESTful endpoints defined in `shared/routes.ts`
- **Authentication**: Custom JWT-like token system using Base64 encoding (mock implementation)
- **Development Server**: Vite middleware integration for HMR

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Drizzle Kit with `db:push` command
- **In-Memory Fallback**: `MemStorage` class in `server/storage.ts` for development

### Key Design Patterns
- **Shared Types**: Schema and route definitions shared between client and server via `shared/` directory
- **Type-Safe API**: Zod schemas define both validation and TypeScript types
- **Component Architecture**: shadcn/ui components in `client/src/components/ui/`
- **Protected Routes**: Client-side route guards with auth context
- **Path Aliases**: `@/` for client, `@shared/` for shared code

### Authentication Flow
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns Base64-encoded token containing user ID
3. Token stored in localStorage
4. `authFetch` helper attaches Bearer token to requests
5. `requireAuth` middleware validates token on protected routes

### Database Schema
- **users**: id, email, password, professions (JSON array), isAdmin
- **announcements**: id, title, profession, institution, description, date, url
- **push_subscriptions**: id, userId, endpoint, keys (for web push)

## External Dependencies

### UI Components (Radix UI)
Full shadcn/ui component suite including dialogs, forms, navigation, and feedback components.

### Database
- **drizzle-orm**: Type-safe ORM for PostgreSQL
- **pg**: PostgreSQL client
- **connect-pg-simple**: Session storage (available but not currently used)

### API & Validation
- **zod**: Schema validation and type inference
- **drizzle-zod**: Auto-generate Zod schemas from Drizzle tables

### Build & Development
- **vite**: Frontend build tool
- **esbuild**: Server bundling
- **tsx**: TypeScript execution for development

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (required for database operations)