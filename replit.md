# Mbeki Healthcare Patient Management System

## Overview

This is a comprehensive patient management system designed for Mbeki Healthcare, built as a full-stack web application. The system enables healthcare professionals to manage patient records, create and track consent forms, generate reports, and maintain treatment documentation. The application features a modern React frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence and PDF generation capabilities for medical documentation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the entire stack
- **API Design**: RESTful API endpoints for CRUD operations
- **Middleware**: Custom logging, error handling, and request processing
- **Development**: Hot module replacement and middleware mode integration with Vite

### Data Layer
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Shared TypeScript schema definitions between frontend and backend
- **Validation**: Zod schemas for runtime data validation
- **Migrations**: Drizzle Kit for database schema management

### Key Features & Components
- **Patient Management**: Complete CRUD operations for patient records with personal information, medical history, and emergency contacts
- **Consent Forms**: Digital consent form creation with signature capture, treatment-specific templates, and vital signs recording
- **Reporting System**: PDF generation for patient reports and consent documentation
- **Dashboard**: Statistics overview with recent activity and quick access to common tasks
- **Responsive Design**: Mobile-first approach with adaptive layouts

### File Structure
- `/client`: React frontend application with components, pages, and utilities
- `/server`: Express backend with routes, database layer, and business logic
- `/shared`: Common TypeScript definitions and schemas used by both frontend and backend
- `/migrations`: Database migration files managed by Drizzle

### Security & Validation
- Input validation using Zod schemas on both client and server
- Type-safe database operations with Drizzle ORM
- Error boundary implementation for graceful error handling
- Secure form handling with CSRF protection patterns

## External Dependencies

### Database & Storage
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL adapter

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Headless UI primitives for accessible components
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography

### Data Management
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with performance optimization
- **Zod**: Schema validation for TypeScript

### Development Tools
- **TypeScript**: Type safety across the entire application
- **Vite**: Build tool with hot module replacement
- **ESBuild**: Fast JavaScript bundler for production builds

### Document Generation
- **jsPDF**: PDF generation for medical reports and consent forms
- **html2canvas**: HTML to canvas conversion for PDF generation

### Utilities
- **date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Conditional CSS class handling
- **nanoid**: Unique ID generation for database records