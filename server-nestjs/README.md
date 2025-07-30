# Kaha Hostel Management System - NestJS Backend

This is the NestJS backend implementation for the Kaha Hostel Management System with PostgreSQL database integration using TypeORM.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup

First, create a PostgreSQL database and user:

```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database
CREATE DATABASE kaha_hostel_db;

-- Create user
CREATE USER kaha_user WITH ENCRYPTED PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE kaha_hostel_db TO kaha_user;
GRANT ALL ON SCHEMA public TO kaha_user;

-- Exit PostgreSQL
\q
```

### 2. Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=kaha_user
DB_PASSWORD=your_secure_password
DB_NAME=kaha_hostel_db
PORT=3001
NODE_ENV=development
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Migration

Once entities are implemented, run:

```bash
# Generate migration
npm run migration:generate -- src/database/migrations/InitialMigration

# Run migration
npm run migration:run
```

### 5. Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Once the server is running, you can access:

- **API Documentation**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health

## Project Structure

```
src/
├── app.module.ts           # Main application module
├── main.ts                 # Application entry point
├── database/               # Database configuration and migrations
│   ├── database.module.ts
│   ├── data-source.ts
│   └── migrations/
├── students/               # Student management module
│   ├── entities/
│   ├── dto/
│   ├── students.controller.ts
│   ├── students.service.ts
│   └── students.module.ts
├── rooms/                  # Room management module
├── invoices/               # Invoice management module
├── payments/               # Payment management module
├── ledger/                 # Ledger management module
├── bookings/               # Booking request module
├── discounts/              # Discount management module
└── reports/                # Report generation module
```

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run migration:generate` - Generate new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration

## API Endpoints

The API maintains 100% compatibility with the existing Express.js implementation:

### Students
- `GET /api/v1/students` - Get all students
- `GET /api/v1/students/stats` - Get student statistics
- `GET /api/v1/students/:id` - Get student by ID
- `POST /api/v1/students` - Create new student
- `PUT /api/v1/students/:id` - Update student

### Rooms
- `GET /api/v1/rooms` - Get all rooms
- `GET /api/v1/rooms/stats` - Get room statistics
- `GET /api/v1/rooms/:id` - Get room by ID

### Invoices
- `GET /api/v1/invoices` - Get all invoices
- `GET /api/v1/invoices/stats` - Get invoice statistics
- `GET /api/v1/invoices/:id` - Get invoice by ID

### Payments
- `GET /api/v1/payments` - Get all payments
- `GET /api/v1/payments/stats` - Get payment statistics
- `GET /api/v1/payments/:id` - Get payment by ID

### Ledger
- `GET /api/v1/ledgers` - Get all ledger entries
- `GET /api/v1/ledgers/stats` - Get ledger statistics
- `GET /api/v1/ledgers/student/:studentId` - Get student ledger

### Booking Requests
- `GET /api/v1/booking-requests` - Get all booking requests
- `GET /api/v1/booking-requests/stats` - Get booking statistics
- `GET /api/v1/booking-requests/:id` - Get booking request by ID

### Discounts
- `GET /api/v1/discounts` - Get all discounts
- `GET /api/v1/discounts/stats` - Get discount statistics
- `GET /api/v1/discounts/:id` - Get discount by ID

### Reports
- `GET /api/v1/reports` - Get all reports
- `GET /api/v1/reports/:id` - Get report by ID
- `POST /api/v1/reports` - Generate new report

## Development Status

✅ **Completed:**
- Basic NestJS project structure
- Database configuration with TypeORM
- Module structure for all features
- Basic controllers with placeholder endpoints
- Swagger API documentation setup
- Health check endpoints

🚧 **In Progress:**
- TypeORM entities implementation
- Service layer implementation
- Data migration scripts

📋 **TODO:**
- Complete entity definitions
- Implement service methods
- Create DTOs with validation
- Write comprehensive tests
- Data migration from JSON files
- Performance optimization

## Contributing

1. Follow the existing code structure
2. Maintain 100% API compatibility
3. Write tests for new features
4. Update documentation as needed

## License

Private - Kaha Hostel Management System





focus on finishing the hostel lagder api's 
finised hostel lagder api's 
   -- complete related all api s