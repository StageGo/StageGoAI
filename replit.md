# Overview

StageGo is a French-language SaaS application that helps international students generate professional cover letters for internship applications. The platform features an AI-powered cover letter generator using OpenAI's API, user authentication through Replit Auth, and a subscription model with Stripe integration. Users can create profiles with their academic information and generate customized cover letters based on specific internship requirements and target companies.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI design
- **State Management**: TanStack Query for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect for secure user authentication
- **Session Management**: Express sessions stored in PostgreSQL using connect-pg-simple
- **API Design**: RESTful API endpoints with proper error handling and logging middleware

## Database Layer
- **Primary Database**: PostgreSQL hosted on Neon with connection pooling
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema**: Includes users, cover letters, and sessions tables with proper relationships
- **Migrations**: Automated schema migrations using Drizzle Kit

## AI Integration
- **Provider**: OpenAI API for natural language generation
- **Functionality**: Generates professional French cover letters based on user profiles and internship requirements
- **Input Processing**: Structured prompts combining user academic information with specific job requirements

## Payment Processing
- **Provider**: Stripe for subscription management and payment processing
- **Model**: Freemium with credit-based system (3 free generations, unlimited with premium)
- **Integration**: Stripe Elements for secure payment forms with proper error handling

# External Dependencies

## Core Services
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **OpenAI API**: GPT models for cover letter generation
- **Stripe**: Payment processing and subscription management
- **Replit Auth**: Authentication service with OpenID Connect

## Development Tools
- **Vite**: Fast build tool with hot module replacement for development
- **Drizzle Kit**: Database schema management and migration tool
- **TypeScript**: Type safety across the entire codebase

## UI Libraries
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## Monitoring and Development
- **Replit Runtime Error Modal**: Development error overlay for debugging
- **Express Logging**: Custom request/response logging middleware for API monitoring