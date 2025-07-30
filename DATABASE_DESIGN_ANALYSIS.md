# Database Design Analysis for Kaha Hostel Management System

## Executive Summary

This document provides a comprehensive database design analysis for transitioning from static JSON files to a normalized, optimized relational database while maintaining **100% API compatibility**. The current system uses 8 JSON files as data sources, and we need to design a database that supports the exact same API requests and responses.

## Current System Analysis

### Current Data Files Structure
1. **students.json** - Student profiles and enrollment data
2. **rooms.json** - Room information and occupancy
3. **bookingRequests.json** - Admission requests and approvals
4. **invoices.json** - Monthly billing and invoice data
5. **payments.json** - Payment records and transactions
6. **ledger.json** - Financial ledger entries
7. **discounts.json** - Discount applications and tracking
8. **reports.json** - Generated reports metadata

### Current API Endpoints (Must Remain Unchanged)
```
/api/v1/students/*
/api/v1/rooms/*
/api/v1/booking-requests/*
/api/v1/invoices/*
/api/v1/payments/*
/api/v1/ledgers/*
/api/v1/discounts/*
/api/v1/reports/*
/api/v1/analytics/*
```

## Proposed Database Schema

### 1. Core Entities

#### 1.1 Students Table
```sql
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    room_number VARCHAR(20),
    guardian_name VARCHAR(255),
    guardian_phone VARCHAR(20),
    address TEXT,
    base_monthly_fee DECIMAL(10,2) DEFAULT 0,
    laundry_fee DECIMAL(10,2) DEFAULT 0,
    food_fee DECIMAL(10,2) DEFAULT 0,
    enrollment_date DATE,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    current_balance DECIMAL(10,2) DEFAULT 0,
    advance_balance DECIMAL(10,2) DEFAULT 0,
    emergency_contact VARCHAR(20),
    course VARCHAR(255),
    institution VARCHAR(255),
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    booking_request_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_room_number (room_number),
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_enrollment_date (enrollment_date)
);
```

#### 1.2 Rooms Table
```sql
CREATE TABLE rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Dormitory', 'Suite', 'Private') NOT NULL,
    bed_count INT NOT NULL DEFAULT 1,
    occupancy INT DEFAULT 0,
    gender ENUM('Male', 'Female', 'Mixed', 'Any') DEFAULT 'Any',
    monthly_rate DECIMAL(10,2) NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    status ENUM('Active', 'Maintenance', 'Inactive') DEFAULT 'Active',
    floor VARCHAR(50),
    room_number VARCHAR(20) UNIQUE NOT NULL,
    available_beds INT GENERATED ALWAYS AS (bed_count - occupancy) STORED,
    last_cleaned DATE,
    maintenance_status ENUM('Good', 'Fair', 'Under Repair', 'Excellent') DEFAULT 'Good',
    pricing_model ENUM('monthly', 'daily') DEFAULT 'monthly',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_gender (gender),
    INDEX idx_room_number (room_number),
    INDEX idx_available_beds (available_beds)
);
```

#### 1.3 Room Amenities Table (Normalized)
```sql
CREATE TABLE room_amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    amenity VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_room_amenity (room_id, amenity),
    INDEX idx_room_id (room_id)
);
```

#### 1.4 Room Occupants Table (Normalized)
```sql
CREATE TABLE room_occupants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    assigned_date DATE DEFAULT (CURRENT_DATE),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_active_occupant (room_id, student_id, status),
    INDEX idx_room_id (room_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
);
```

#### 1.5 Room Layouts Table (JSON Storage for Complex Data)
```sql
CREATE TABLE room_layouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    layout_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_room_layout (room_id)
);
```

### 2. Booking and Admission Management

#### 2.1 Booking Requests Table
```sql
CREATE TABLE booking_requests (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    guardian_name VARCHAR(255),
    guardian_phone VARCHAR(20),
    preferred_room VARCHAR(255),
    course VARCHAR(255),
    institution VARCHAR(255),
    request_date DATE NOT NULL,
    check_in_date DATE,
    duration VARCHAR(50),
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    notes TEXT,
    emergency_contact VARCHAR(20),
    address TEXT,
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    approved_date DATE,
    processed_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_request_date (request_date),
    INDEX idx_check_in_date (check_in_date),
    INDEX idx_phone (phone),
    INDEX idx_email (email)
);
```

### 3. Financial Management

#### 3.1 Invoices Table
```sql
CREATE TABLE invoices (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    room_number VARCHAR(20),
    month VARCHAR(7) NOT NULL, -- YYYY-MM format
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('Paid', 'Unpaid', 'Partially Paid', 'Overdue') DEFAULT 'Unpaid',
    due_date DATE NOT NULL,
    subtotal DECIMAL(10,2) DEFAULT 0,
    discount_total DECIMAL(10,2) DEFAULT 0,
    payment_total DECIMAL(10,2) DEFAULT 0,
    balance_due DECIMAL(10,2) GENERATED ALWAYS AS (total - payment_total) STORED,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_month (month),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_balance_due (balance_due)
);
```

#### 3.2 Invoice Items Table
```sql
CREATE TABLE invoice_items (
    id VARCHAR(50) PRIMARY KEY,
    invoice_id VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category ENUM('Accommodation', 'Services', 'Food', 'Utilities', 'Other') DEFAULT 'Other',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_category (category)
);
```

#### 3.3 Payments Table
```sql
CREATE TABLE payments (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Cash', 'Bank Transfer', 'Card', 'Online', 'Cheque') NOT NULL,
    payment_date DATE NOT NULL,
    reference VARCHAR(255),
    notes TEXT,
    status ENUM('Completed', 'Pending', 'Failed', 'Cancelled') DEFAULT 'Completed',
    created_by VARCHAR(100) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_payment_method (payment_method),
    INDEX idx_status (status),
    INDEX idx_amount (amount)
);
```

#### 3.4 Payment Invoice Allocations Table
```sql
CREATE TABLE payment_invoice_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(50) NOT NULL,
    invoice_id VARCHAR(50) NOT NULL,
    allocated_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    UNIQUE KEY unique_payment_invoice (payment_id, invoice_id),
    INDEX idx_payment_id (payment_id),
    INDEX idx_invoice_id (invoice_id)
);
```

#### 3.5 Ledger Entries Table
```sql
CREATE TABLE ledger_entries (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(255),
    date DATE NOT NULL,
    type ENUM('Invoice', 'Payment', 'Discount', 'Adjustment', 'Refund') NOT NULL,
    description TEXT NOT NULL,
    reference_id VARCHAR(50),
    debit DECIMAL(10,2) DEFAULT 0,
    credit DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) DEFAULT 0,
    balance_type ENUM('Dr', 'Cr', 'Nil') DEFAULT 'Nil',
    notes TEXT,
    created_by VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_date (date),
    INDEX idx_type (type),
    INDEX idx_reference_id (reference_id),
    INDEX idx_balance_type (balance_type)
);
```

#### 3.6 Discounts Table
```sql
CREATE TABLE discounts (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    room VARCHAR(20),
    amount DECIMAL(10,2) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    notes TEXT,
    applied_by VARCHAR(100) DEFAULT 'Admin',
    date DATE NOT NULL,
    status ENUM('active', 'expired') DEFAULT 'active',
    applied_to VARCHAR(50) DEFAULT 'ledger',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    INDEX idx_date (date),
    INDEX idx_reason (reason)
);
```

### 4. Reporting and Analytics

#### 4.1 Reports Table
```sql
CREATE TABLE reports (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('financial', 'ledger', 'payment', 'invoice', 'student', 'room', 'booking') NOT NULL,
    description TEXT,
    generated_by VARCHAR(100) NOT NULL,
    generated_at TIMESTAMP NOT NULL,
    parameters JSON,
    data JSON,
    format ENUM('pdf', 'excel', 'csv', 'json') DEFAULT 'pdf',
    file_path VARCHAR(500),
    file_size VARCHAR(20),
    status ENUM('completed', 'processing', 'failed') DEFAULT 'completed',
    is_scheduled BOOLEAN DEFAULT FALSE,
    schedule_config JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_generated_by (generated_by),
    INDEX idx_generated_at (generated_at),
    INDEX idx_status (status),
    INDEX idx_is_scheduled (is_scheduled)
);
```

## Database Relationships and Constraints

### Primary Relationships
1. **Students ↔ Rooms**: Many-to-One (via room_number)
2. **Students ↔ Booking Requests**: One-to-One (via booking_request_id)
3. **Students ↔ Invoices**: One-to-Many
4. **Students ↔ Payments**: One-to-Many
5. **Students ↔ Ledger Entries**: One-to-Many
6. **Students ↔ Discounts**: One-to-Many
7. **Invoices ↔ Invoice Items**: One-to-Many
8. **Payments ↔ Invoice Allocations**: One-to-Many
9. **Rooms ↔ Room Amenities**: One-to-Many
10. **Rooms ↔ Room Occupants**: One-to-Many

### Data Integrity Rules
1. **Referential Integrity**: All foreign keys properly constrained
2. **Balance Calculations**: Computed columns for real-time balance updates
3. **Status Consistency**: Enum constraints for consistent status values
4. **Unique Constraints**: Prevent duplicate entries where needed
5. **Index Optimization**: Strategic indexing for query performance

## API Compatibility Strategy

### 1. Response Format Preservation
All API responses will maintain the exact same JSON structure by:
- Using database views that match current JSON structure
- Implementing service layer transformations
- Maintaining computed fields and aggregations

### 2. Query Parameter Compatibility
All existing query parameters will work identically:
- Pagination (page, limit)
- Filtering (status, search, dateFrom, dateTo)
- Sorting and ordering
- Search functionality

### 3. Data Migration Strategy
```sql
-- Example migration for students
INSERT INTO students (
    id, name, phone, email, room_number, guardian_name, guardian_phone,
    address, base_monthly_fee, laundry_fee, food_fee, enrollment_date,
    status, current_balance, advance_balance, emergency_contact,
    course, institution, id_proof_type, id_proof_number, booking_request_id,
    updated_at
) 
SELECT 
    id, name, phone, email, roomNumber, guardianName, guardianPhone,
    address, baseMonthlyFee, laundryFee, foodFee, enrollmentDate,
    status, currentBalance, advanceBalance, emergencyContact,
    course, institution, idProofType, idProofNumber, bookingRequestId,
    STR_TO_DATE(updatedAt, '%Y-%m-%dT%H:%i:%s.%fZ')
FROM json_students_temp;
```

## Performance Optimizations

### 1. Indexing Strategy
- **Primary Keys**: All tables have optimized primary keys
- **Foreign Keys**: Indexed for join performance
- **Search Fields**: Full-text indexes on searchable columns
- **Date Ranges**: Indexed for financial reporting
- **Status Fields**: Indexed for filtering

### 2. Query Optimization
- **Computed Columns**: Real-time balance calculations
- **Materialized Views**: For complex aggregations
- **Partitioning**: By date for large tables (ledger, payments)
- **Connection Pooling**: For concurrent access

### 3. Caching Strategy
- **Application Level**: Cache frequently accessed data
- **Database Level**: Query result caching
- **Redis Integration**: For session and temporary data

## Security Considerations

### 1. Data Protection
- **Encryption**: Sensitive fields encrypted at rest
- **Access Control**: Role-based permissions
- **Audit Trail**: All modifications logged
- **Backup Strategy**: Regular automated backups

### 2. API Security
- **Input Validation**: All inputs sanitized
- **SQL Injection Prevention**: Parameterized queries
- **Rate Limiting**: API endpoint protection
- **Authentication**: Secure token-based auth

## Implementation Phases

### Phase 1: Core Tables Setup
1. Create students, rooms, booking_requests tables
2. Migrate existing data
3. Test basic CRUD operations
4. Verify API compatibility

### Phase 2: Financial System
1. Create invoices, payments, ledger tables
2. Implement financial calculations
3. Test billing workflows
4. Verify financial reporting

### Phase 3: Advanced Features
1. Create discounts, reports tables
2. Implement analytics queries
3. Add performance optimizations
4. Complete testing and validation

### Phase 4: Production Deployment
1. Final data migration
2. Performance tuning
3. Monitoring setup
4. Go-live with rollback plan

## Conclusion

This database design provides:
- **100% API Compatibility**: No frontend changes required
- **Normalized Structure**: Eliminates data redundancy
- **Performance Optimization**: Strategic indexing and caching
- **Scalability**: Designed for growth and concurrent users
- **Data Integrity**: Proper constraints and relationships
- **Security**: Built-in protection mechanisms

The transition from JSON files to this database structure will provide significant improvements in performance, data integrity, and scalability while maintaining complete backward compatibility with the existing frontend application.