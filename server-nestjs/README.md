# Kaha Hostel Management System - NestJS Backend

A comprehensive hostel management system built with NestJS, TypeORM, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database:**
   ```sql
   CREATE DATABASE kaha_hostel_db;
   CREATE USER root WITH PASSWORD 'root';
   GRANT ALL PRIVILEGES ON DATABASE kaha_hostel_db TO root;
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=root
   DB_PASSWORD=root
   DB_NAME=kaha_hostel_db
   NODE_ENV=development
   PORT=3001
   ```

4. **Start the development server:**
   ```bash
   npm run start:dev
   ```

The API will be available at:
- **API Server:** http://localhost:3001
- **API Documentation:** http://localhost:3001/api-docs
- **Health Check:** http://localhost:3001/health

## 🏗️ Architecture

### Database Schema (Auto-Synchronized)

The application runs in **synchronized mode** during development, which means:
- Database schema is automatically created/updated based on entities
- No manual migrations needed during development
- Perfect for rapid development and testing

### Core Modules

- **Students Module** - Student management and profiles
- **Rooms Module** - Room management and occupancy
- **Invoices Module** - Invoice generation and management
- **Payments Module** - Payment processing and tracking
- **Ledger Module** - Financial ledger and balance calculations
- **Bookings Module** - Booking request workflow
- **Discounts Module** - Discount management
- **Reports Module** - Report generation system

## 📚 API Documentation

Once the server is running, visit http://localhost:3001/api-docs for interactive API documentation.

### Key Endpoints

- `GET /api/v1/students` - List all students
- `GET /api/v1/rooms` - List all rooms
- `GET /api/v1/invoices` - List all invoices
- `GET /api/v1/payments` - List all payments
- `GET /api/v1/ledgers` - List ledger entries
- `GET /api/v1/booking-requests` - List booking requests
- `GET /api/v1/discounts` - List discounts
- `GET /api/v1/reports` - List reports

## 🔧 Development

### Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start with debugging enabled
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

### Database Operations

- `npm run schema:sync` - Manually sync database schema
- `npm run schema:drop` - Drop all database tables
- `npm run migration:generate` - Generate migration (for production)
- `npm run migration:run` - Run migrations (for production)

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:3001/health
```

### Create a Student
```bash
curl -X POST http://localhost:3001/api/v1/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "1234567890",
    "email": "john@example.com",
    "address": "123 Main St"
  }'
```

### Get All Students
```bash
curl http://localhost:3001/api/v1/students
```

## 🏢 Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in your environment
2. Use proper database credentials
3. Enable SSL for database connections
4. Use migrations instead of synchronization
5. Set up proper logging and monitoring

## 🔒 Security Features

- Input validation using class-validator
- SQL injection protection via TypeORM
- CORS configuration
- Environment-based configuration
- Proper error handling

## 📊 Monitoring

The application includes:
- Health check endpoints
- Database connection monitoring
- Comprehensive logging
- API documentation
- Error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📝 License

This project is licensed under the UNLICENSED license.