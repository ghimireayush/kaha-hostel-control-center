# 🏨 Kaha Hostel Management System - NestJS Backend

A comprehensive hostel management system built with NestJS, TypeORM, and PostgreSQL.

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=kaha_user
DB_PASSWORD=password
DB_NAME=kaha_hostel_db
NODE_ENV=development
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Interactive setup (recommended)
npm run db:setup

# Or quick commands:
npm run db:migrate  # Migration mode + seeding
npm run db:sync     # Sync mode + seeding (dev only)
```

### 4. Start Development Server
```bash
npm run start:dev
```

### 5. Seed Data via API
```bash
# Test seeding endpoints
npm run test:seed

# Or manually seed all data
curl -X POST http://localhost:3001/api/v1/seed/all
```

## 📋 Available Scripts

### Development
| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start development server with hot reload |
| `npm run start:debug` | Start server in debug mode |
| `npm run build` | Build production bundle |
| `npm run start:prod` | Start production server |

### Database Management
| Command | Description |
|---------|-------------|
| `npm run db:setup` | Interactive database setup wizard |
| `npm run db:migrate` | Run migrations + seed data |
| `npm run db:sync` | Sync schema + seed data (dev only) |
| `npm run db:reset` | Drop + recreate + seed (dev only) |
| `npm run migrate` | Migration management CLI |

### Data Seeding
| Command | Description |
|---------|-------------|
| `npm run test:seed` | Test API seeding endpoin