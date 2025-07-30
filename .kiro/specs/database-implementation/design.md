# Database Implementation Design Document

## Overview

This design document outlines the complete implementation plan for migrating the Kaha Hostel Management System from JSON file-based data storage to a normalized PostgreSQL database. The design ensures 100% API compatibility while providing improved performance, data integrity, and scalability.

## Architecture

### Database Technology Stack

- **Primary Database**: PostgreSQL 14+
- **Backend Framework**: NestJS with TypeScript
- **ORM**: TypeORM with decorators and repositories
- **Connection Pool**: TypeORM connection pooling with PostgreSQL driver
- **Migration Tool**: TypeORM migrations with CLI support
- **Validation**: class-validator and class-transformer
- **Backup Strategy**: Automated daily backups with point-in-time recovery

### System Architecture

```
Frontend (React)
    ↓ (unchanged API calls)
NestJS API Layer (Controllers)
    ↓ (service layer with business logic)
TypeORM Service Layer (Repositories)
    ↓ (ORM queries and migrations)
PostgreSQL Database
```

## Components and Interfaces

### 1. Database Schema Components

#### 1.1 Core Entity Tables

```sql
-- Students table with all profile information
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
    status VARCHAR(20) CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active',
    current_balance DECIMAL(10,2) DEFAULT 0,
    advance_balance DECIMAL(10,2) DEFAULT 0,
    emergency_contact VARCHAR(20),
    course VARCHAR(255),
    institution VARCHAR(255),
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    booking_request_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for students table
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_room_number ON students(room_number);
CREATE INDEX idx_students_phone ON students(phone);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_enrollment_date ON students(enrollment_date);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Rooms table with occupancy management
CREATE TABLE rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('Dormitory', 'Suite', 'Private')) NOT NULL,
    bed_count INTEGER NOT NULL DEFAULT 1,
    occupancy INTEGER DEFAULT 0,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Mixed', 'Any')) DEFAULT 'Any',
    monthly_rate DECIMAL(10,2) NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Active', 'Maintenance', 'Inactive')) DEFAULT 'Active',
    floor VARCHAR(50),
    room_number VARCHAR(20) UNIQUE NOT NULL,
    available_beds INTEGER GENERATED ALWAYS AS (bed_count - occupancy) STORED,
    last_cleaned DATE,
    maintenance_status VARCHAR(20) CHECK (maintenance_status IN ('Good', 'Fair', 'Under Repair', 'Excellent')) DEFAULT 'Good',
    pricing_model VARCHAR(20) CHECK (pricing_model IN ('monthly', 'daily')) DEFAULT 'monthly',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for rooms table
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_gender ON rooms(gender);
CREATE INDEX idx_rooms_room_number ON rooms(room_number);
CREATE INDEX idx_rooms_available_beds ON rooms(available_beds);

-- Create trigger for rooms updated_at
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 1.2 Relationship Tables

```sql
-- Room amenities (normalized from JSON array)
CREATE TABLE room_amenities (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    amenity VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    UNIQUE(room_id, amenity)
);

CREATE INDEX idx_room_amenities_room_id ON room_amenities(room_id);

-- Room occupants (normalized from JSON array)
CREATE TABLE room_occupants (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    assigned_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    UNIQUE(room_id, student_id, status)
);

CREATE INDEX idx_room_occupants_room_id ON room_occupants(room_id);
CREATE INDEX idx_room_occupants_student_id ON room_occupants(student_id);
CREATE INDEX idx_room_occupants_status ON room_occupants(status);

-- Room layouts (JSON storage for complex data)
CREATE TABLE room_layouts (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    layout_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    UNIQUE(room_id)
);

CREATE INDEX idx_room_layouts_room_id ON room_layouts(room_id);
-- Create GIN index for JSONB queries
CREATE INDEX idx_room_layouts_data ON room_layouts USING GIN (layout_data);
```

#### 1.3 Booking Management Tables

```sql
-- Booking requests table
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
    status VARCHAR(20) CHECK (status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
    notes TEXT,
    emergency_contact VARCHAR(20),
    address TEXT,
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    approved_date DATE,
    processed_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for booking_requests
CREATE INDEX idx_booking_requests_status ON booking_requests(status);
CREATE INDEX idx_booking_requests_request_date ON booking_requests(request_date);
CREATE INDEX idx_booking_requests_check_in_date ON booking_requests(check_in_date);
CREATE INDEX idx_booking_requests_phone ON booking_requests(phone);
CREATE INDEX idx_booking_requests_email ON booking_requests(email);

CREATE TRIGGER update_booking_requests_updated_at BEFORE UPDATE ON booking_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 1.4 Financial Tables

```sql
-- Invoices with computed balance
CREATE TABLE invoices (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    room_number VARCHAR(20),
    month VARCHAR(7) NOT NULL, -- YYYY-MM format
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('Paid', 'Unpaid', 'Partially Paid', 'Overdue')) DEFAULT 'Unpaid',
    due_date DATE NOT NULL,
    subtotal DECIMAL(10,2) DEFAULT 0,
    discount_total DECIMAL(10,2) DEFAULT 0,
    payment_total DECIMAL(10,2) DEFAULT 0,
    balance_due DECIMAL(10,2) GENERATED ALWAYS AS (total - payment_total) STORED,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create indexes for invoices
CREATE INDEX idx_invoices_student_id ON invoices(student_id);
CREATE INDEX idx_invoices_month ON invoices(month);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_balance_due ON invoices(balance_due);

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Invoice items (normalized from JSON array)
CREATE TABLE invoice_items (
    id VARCHAR(50) PRIMARY KEY,
    invoice_id VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(20) CHECK (category IN ('Accommodation', 'Services', 'Food', 'Utilities', 'Other')) DEFAULT 'Other',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_category ON invoice_items(category);

-- Payments table
CREATE TABLE payments (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) CHECK (payment_method IN ('Cash', 'Bank Transfer', 'Card', 'Online', 'Cheque')) NOT NULL,
    payment_date DATE NOT NULL,
    reference VARCHAR(255),
    notes TEXT,
    status VARCHAR(20) CHECK (status IN ('Completed', 'Pending', 'Failed', 'Cancelled')) DEFAULT 'Completed',
    created_by VARCHAR(100) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create indexes for payments
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_payment_method ON payments(payment_method);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_amount ON payments(amount);

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Payment invoice allocations table
CREATE TABLE payment_invoice_allocations (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(50) NOT NULL,
    invoice_id VARCHAR(50) NOT NULL,
    allocated_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    UNIQUE(payment_id, invoice_id)
);

CREATE INDEX idx_payment_allocations_payment_id ON payment_invoice_allocations(payment_id);
CREATE INDEX idx_payment_allocations_invoice_id ON payment_invoice_allocations(invoice_id);

-- Ledger entries table
CREATE TABLE ledger_entries (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(255),
    date DATE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('Invoice', 'Payment', 'Discount', 'Adjustment', 'Refund')) NOT NULL,
    description TEXT NOT NULL,
    reference_id VARCHAR(50),
    debit DECIMAL(10,2) DEFAULT 0,
    credit DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) DEFAULT 0,
    balance_type VARCHAR(10) CHECK (balance_type IN ('Dr', 'Cr', 'Nil')) DEFAULT 'Nil',
    notes TEXT,
    created_by VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create indexes for ledger_entries
CREATE INDEX idx_ledger_entries_student_id ON ledger_entries(student_id);
CREATE INDEX idx_ledger_entries_date ON ledger_entries(date);
CREATE INDEX idx_ledger_entries_type ON ledger_entries(type);
CREATE INDEX idx_ledger_entries_reference_id ON ledger_entries(reference_id);
CREATE INDEX idx_ledger_entries_balance_type ON ledger_entries(balance_type);

CREATE TRIGGER update_ledger_entries_updated_at BEFORE UPDATE ON ledger_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Discounts table
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
    status VARCHAR(20) CHECK (status IN ('active', 'expired')) DEFAULT 'active',
    applied_to VARCHAR(50) DEFAULT 'ledger',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create indexes for discounts
CREATE INDEX idx_discounts_student_id ON discounts(student_id);
CREATE INDEX idx_discounts_status ON discounts(status);
CREATE INDEX idx_discounts_date ON discounts(date);
CREATE INDEX idx_discounts_reason ON discounts(reason);

CREATE TRIGGER update_discounts_updated_at BEFORE UPDATE ON discounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 1.5 Reporting Tables

```sql
-- Reports table
CREATE TABLE reports (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('financial', 'ledger', 'payment', 'invoice', 'student', 'room', 'booking')) NOT NULL,
    description TEXT,
    generated_by VARCHAR(100) NOT NULL,
    generated_at TIMESTAMP NOT NULL,
    parameters JSONB,
    data JSONB,
    format VARCHAR(20) CHECK (format IN ('pdf', 'excel', 'csv', 'json')) DEFAULT 'pdf',
    file_path VARCHAR(500),
    file_size VARCHAR(20),
    status VARCHAR(20) CHECK (status IN ('completed', 'processing', 'failed')) DEFAULT 'completed',
    is_scheduled BOOLEAN DEFAULT FALSE,
    schedule_config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for reports
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_generated_by ON reports(generated_by);
CREATE INDEX idx_reports_generated_at ON reports(generated_at);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_is_scheduled ON reports(is_scheduled);

-- Create GIN indexes for JSONB columns
CREATE INDEX idx_reports_parameters ON reports USING GIN (parameters);
CREATE INDEX idx_reports_data ON reports USING GIN (data);
CREATE INDEX idx_reports_schedule_config ON reports USING GIN (schedule_config);

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. TypeORM Entity Components

#### 2.1 Student Entity

```typescript
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Invoice } from "./invoice.entity";
import { Payment } from "./payment.entity";
import { LedgerEntry } from "./ledger-entry.entity";
import { Discount } from "./discount.entity";

@Entity("students")
export class Student {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 255 })
  email: string;

  @Column({ name: "room_number", length: 20, nullable: true })
  roomNumber: string;

  @Column({ name: "guardian_name", length: 255, nullable: true })
  guardianName: string;

  @Column({ name: "guardian_phone", length: 20, nullable: true })
  guardianPhone: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column({
    name: "base_monthly_fee",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  baseMonthlyFee: number;

  @Column({
    name: "laundry_fee",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  laundryFee: number;

  @Column({
    name: "food_fee",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  foodFee: number;

  @Column({ name: "enrollment_date", type: "date", nullable: true })
  enrollmentDate: Date;

  @Column({ length: 20, default: "Active" })
  status: "Active" | "Inactive";

  @Column({
    name: "current_balance",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  currentBalance: number;

  @Column({
    name: "advance_balance",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  advanceBalance: number;

  @Column({ name: "emergency_contact", length: 20, nullable: true })
  emergencyContact: string;

  @Column({ length: 255, nullable: true })
  course: string;

  @Column({ length: 255, nullable: true })
  institution: string;

  @Column({ name: "id_proof_type", length: 50, nullable: true })
  idProofType: string;

  @Column({ name: "id_proof_number", length: 100, nullable: true })
  idProofNumber: string;

  @Column({ name: "booking_request_id", length: 50, nullable: true })
  bookingRequestId: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Invoice, (invoice) => invoice.student)
  invoices: Invoice[];

  @OneToMany(() => Payment, (payment) => payment.student)
  payments: Payment[];

  @OneToMany(() => LedgerEntry, (ledgerEntry) => ledgerEntry.student)
  ledgerEntries: LedgerEntry[];

  @OneToMany(() => Discount, (discount) => discount.student)
  discounts: Discount[];
}
```

#### 2.2 Room Entity with Relations

```typescript
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Generated,
} from "typeorm";
import { RoomAmenity } from "./room-amenity.entity";
import { RoomOccupant } from "./room-occupant.entity";
import { RoomLayout } from "./room-layout.entity";

@Entity("rooms")
export class Room {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 20 })
  type: "Dormitory" | "Suite" | "Private";

  @Column({ name: "bed_count", type: "int", default: 1 })
  bedCount: number;

  @Column({ type: "int", default: 0 })
  occupancy: number;

  @Column({ length: 20, default: "Any" })
  gender: "Male" | "Female" | "Mixed" | "Any";

  @Column({ name: "monthly_rate", type: "decimal", precision: 10, scale: 2 })
  monthlyRate: number;

  @Column({ name: "daily_rate", type: "decimal", precision: 10, scale: 2 })
  dailyRate: number;

  @Column({ length: 20, default: "Active" })
  status: "Active" | "Maintenance" | "Inactive";

  @Column({ length: 50, nullable: true })
  floor: string;

  @Column({ name: "room_number", length: 20, unique: true })
  roomNumber: string;

  @Generated("stored")
  @Column({ name: "available_beds", type: "int" })
  availableBeds: number;

  @Column({ name: "last_cleaned", type: "date", nullable: true })
  lastCleaned: Date;

  @Column({ name: "maintenance_status", length: 20, default: "Good" })
  maintenanceStatus: "Good" | "Fair" | "Under Repair" | "Excellent";

  @Column({ name: "pricing_model", length: 20, default: "monthly" })
  pricingModel: "monthly" | "daily";

  @Column({ type: "text", nullable: true })
  description: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Relations
  @OneToMany(() => RoomAmenity, (amenity) => amenity.room, { cascade: true })
  amenities: RoomAmenity[];

  @OneToMany(() => RoomOccupant, (occupant) => occupant.room, { cascade: true })
  occupants: RoomOccupant[];

  @OneToMany(() => RoomLayout, (layout) => layout.room, { cascade: true })
  layouts: RoomLayout[];
}
```

#### 2.3 Invoice Entity with Items

```typescript
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Generated,
} from "typeorm";
import { Student } from "./student.entity";
import { InvoiceItem } from "./invoice-item.entity";
import { PaymentInvoiceAllocation } from "./payment-invoice-allocation.entity";

@Entity("invoices")
export class Invoice {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ name: "student_id", length: 50 })
  studentId: string;

  @Column({ name: "student_name", length: 255 })
  studentName: string;

  @Column({ name: "room_number", length: 20, nullable: true })
  roomNumber: string;

  @Column({ length: 7 }) // YYYY-MM format
  month: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ length: 20, default: "Unpaid" })
  status: "Paid" | "Unpaid" | "Partially Paid" | "Overdue";

  @Column({ name: "due_date", type: "date" })
  dueDate: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({
    name: "discount_total",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  discountTotal: number;

  @Column({
    name: "payment_total",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  paymentTotal: number;

  @Generated("stored")
  @Column({ name: "balance_due", type: "decimal", precision: 10, scale: 2 })
  balanceDue: number;

  @Column({ type: "text", nullable: true })
  notes: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Student, (student) => student.invoices, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "student_id" })
  student: Student;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @OneToMany(() => PaymentInvoiceAllocation, (allocation) => allocation.invoice)
  paymentAllocations: PaymentInvoiceAllocation[];
}
```

### 3. NestJS Service Layer Components

#### 3.1 Student Service with TypeORM Repository

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Student } from "./entities/student.entity";
import { CreateStudentDto, UpdateStudentDto } from "./dto/student.dto";

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>
  ) {}

  async findAll(filters: any = {}) {
    const { status = "all", search = "", page = 1, limit = 50 } = filters;

    const queryBuilder = this.studentRepository.createQueryBuilder("student");

    // Apply status filter
    if (status !== "all") {
      queryBuilder.andWhere("student.status = :status", { status });
    }

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        "(student.name ILIKE :search OR student.phone ILIKE :search OR student.email ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Order by creation date
    queryBuilder.orderBy("student.createdAt", "DESC");

    const [items, total] = await queryBuilder.getManyAndCount();

    // Transform to API response format
    const transformedItems = items.map((student) =>
      this.transformToApiResponse(student)
    );

    return {
      items: transformedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException("Student not found");
    }
    return this.transformToApiResponse(student);
  }

  async create(createStudentDto: CreateStudentDto) {
    const student = this.studentRepository.create(createStudentDto);
    const savedStudent = await this.studentRepository.save(student);
    return this.transformToApiResponse(savedStudent);
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const student = await this.findOne(id);
    await this.studentRepository.update(id, updateStudentDto);
    const updatedStudent = await this.studentRepository.findOne({
      where: { id },
    });
    return this.transformToApiResponse(updatedStudent);
  }

  async getStats() {
    const totalStudents = await this.studentRepository.count();
    const activeStudents = await this.studentRepository.count({
      where: { status: "Active" },
    });
    const inactiveStudents = await this.studentRepository.count({
      where: { status: "Inactive" },
    });

    const balanceResult = await this.studentRepository
      .createQueryBuilder("student")
      .select("SUM(student.currentBalance)", "totalBalance")
      .addSelect("SUM(student.advanceBalance)", "totalAdvance")
      .getRawOne();

    return {
      totalStudents,
      activeStudents,
      inactiveStudents,
      totalBalance: parseFloat(balanceResult.totalBalance) || 0,
      totalAdvance: parseFloat(balanceResult.totalAdvance) || 0,
    };
  }

  private transformToApiResponse(student: Student) {
    return {
      id: student.id,
      name: student.name,
      phone: student.phone,
      email: student.email,
      roomNumber: student.roomNumber,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      address: student.address,
      baseMonthlyFee: student.baseMonthlyFee,
      laundryFee: student.laundryFee,
      foodFee: student.foodFee,
      enrollmentDate: student.enrollmentDate,
      status: student.status,
      currentBalance: student.currentBalance,
      advanceBalance: student.advanceBalance,
      emergencyContact: student.emergencyContact,
      course: student.course,
      institution: student.institution,
      idProofType: student.idProofType,
      idProofNumber: student.idProofNumber,
      bookingRequestId: student.bookingRequestId,
      updatedAt: student.updatedAt,
    };
  }
}
```

#### 3.2 Room Service with Complex Relations

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Room } from "./entities/room.entity";
import { RoomAmenity } from "./entities/room-amenity.entity";
import { RoomOccupant } from "./entities/room-occupant.entity";
import { RoomLayout } from "./entities/room-layout.entity";

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(RoomAmenity)
    private amenityRepository: Repository<RoomAmenity>,
    @InjectRepository(RoomOccupant)
    private occupantRepository: Repository<RoomOccupant>,
    @InjectRepository(RoomLayout)
    private layoutRepository: Repository<RoomLayout>
  ) {}

  async findAll(filters: any = {}) {
    const {
      status = "all",
      type = "all",
      search = "",
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.roomRepository.createQueryBuilder("room");

    // Apply filters
    if (status !== "all") {
      queryBuilder.andWhere("room.status = :status", { status });
    }

    if (type !== "all") {
      queryBuilder.andWhere("room.type = :type", { type });
    }

    if (search) {
      queryBuilder.andWhere(
        "(room.name ILIKE :search OR room.roomNumber ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [rooms, total] = await queryBuilder.getManyAndCount();

    // Load related data for each room
    const roomsWithRelations = await Promise.all(
      rooms.map(async (room) => {
        const amenities = await this.amenityRepository.find({
          where: { roomId: room.id },
        });
        const occupants = await this.occupantRepository.find({
          where: { roomId: room.id, status: "Active" },
        });
        const layout = await this.layoutRepository.findOne({
          where: { roomId: room.id },
        });

        return this.transformToApiResponse(room, amenities, occupants, layout);
      })
    );

    return {
      items: roomsWithRelations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) {
      throw new NotFoundException("Room not found");
    }

    const amenities = await this.amenityRepository.find({
      where: { roomId: id },
    });
    const occupants = await this.occupantRepository.find({
      where: { roomId: id, status: "Active" },
    });
    const layout = await this.layoutRepository.findOne({
      where: { roomId: id },
    });

    return this.transformToApiResponse(room, amenities, occupants, layout);
  }

  private transformToApiResponse(
    room: Room,
    amenities: RoomAmenity[] = [],
    occupants: RoomOccupant[] = [],
    layout: RoomLayout = null
  ) {
    return {
      id: room.id,
      name: room.name,
      type: room.type,
      bedCount: room.bedCount,
      occupancy: room.occupancy,
      gender: room.gender,
      monthlyRate: room.monthlyRate,
      dailyRate: room.dailyRate,
      amenities: amenities.map((a) => a.amenity),
      status: room.status,
      layout: layout ? layout.layoutData : null,
      floor: room.floor,
      roomNumber: room.roomNumber,
      occupants: occupants.map((o) => ({
        id: o.studentId,
        name: o.studentName,
        phone: o.phone,
        email: o.email,
      })),
      availableBeds: room.availableBeds,
      lastCleaned: room.lastCleaned,
      maintenanceStatus: room.maintenanceStatus,
      pricingModel: room.pricingModel,
      description: room.description,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }
}
```

#### 3.3 NestJS Controllers

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
} from "@nestjs/common";
import { StudentService } from "./student.service";
import { CreateStudentDto, UpdateStudentDto } from "./dto/student.dto";

@Controller("api/v1/students")
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  async getAllStudents(@Query() query: any) {
    const result = await this.studentService.findAll(query);
    return {
      status: HttpStatus.OK,
      data: result,
    };
  }

  @Get("stats")
  async getStudentStats() {
    const stats = await this.studentService.getStats();
    return {
      status: HttpStatus.OK,
      data: stats,
    };
  }

  @Get(":id")
  async getStudentById(@Param("id") id: string) {
    const student = await this.studentService.findOne(id);
    return {
      status: HttpStatus.OK,
      data: student,
    };
  }

  @Post()
  async createStudent(@Body() createStudentDto: CreateStudentDto) {
    const student = await this.studentService.create(createStudentDto);
    return {
      status: HttpStatus.CREATED,
      data: student,
    };
  }

  @Put(":id")
  async updateStudent(
    @Param("id") id: string,
    @Body() updateStudentDto: UpdateStudentDto
  ) {
    const student = await this.studentService.update(id, updateStudentDto);
    return {
      status: HttpStatus.OK,
      data: student,
    };
  }
}
```

#### 3.4 DTOs with Validation

```typescript
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsEnum,
} from "class-validator";
import { Transform } from "class-transformer";

export class CreateStudentDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  roomNumber?: string;

  @IsOptional()
  @IsString()
  guardianName?: string;

  @IsOptional()
  @IsString()
  guardianPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  baseMonthlyFee?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  laundryFee?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  foodFee?: number;

  @IsOptional()
  @IsString()
  enrollmentDate?: string;

  @IsOptional()
  @IsEnum(["Active", "Inactive"])
  status?: "Active" | "Inactive";

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  currentBalance?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  advanceBalance?: number;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsString()
  idProofType?: string;

  @IsOptional()
  @IsString()
  idProofNumber?: string;

  @IsOptional()
  @IsString()
  bookingRequestId?: string;
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  roomNumber?: string;

  @IsOptional()
  @IsString()
  guardianName?: string;

  @IsOptional()
  @IsString()
  guardianPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  baseMonthlyFee?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  laundryFee?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  foodFee?: number;

  @IsOptional()
  @IsString()
  enrollmentDate?: string;

  @IsOptional()
  @IsEnum(["Active", "Inactive"])
  status?: "Active" | "Inactive";

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  currentBalance?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  advanceBalance?: number;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsString()
  idProofType?: string;

  @IsOptional()
  @IsString()
  idProofNumber?: string;

  @IsOptional()
  @IsString()
  bookingRequestId?: string;
}
```

### 3. Migration Components

#### 3.1 Data Migration Scripts

```javascript
const fs = require("fs");
const db = require("./database");

class DataMigrator {
  async migrateStudents() {
    console.log("Migrating students data...");
    const studentsData = JSON.parse(
      fs.readFileSync("server/src/data/students.json", "utf8")
    );

    for (const student of studentsData) {
      try {
        await db.query(
          `
                    INSERT INTO students (
                        id, name, phone, email, room_number, guardian_name, guardian_phone,
                        address, base_monthly_fee, laundry_fee, food_fee, enrollment_date,
                        status, current_balance, advance_balance, emergency_contact,
                        course, institution, id_proof_type, id_proof_number, booking_request_id,
                        updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        phone = EXCLUDED.phone,
                        email = EXCLUDED.email,
                        updated_at = EXCLUDED.updated_at
                `,
          [
            student.id,
            student.name,
            student.phone,
            student.email,
            student.roomNumber,
            student.guardianName,
            student.guardianPhone,
            student.address,
            student.baseMonthlyFee,
            student.laundryFee,
            student.foodFee,
            student.enrollmentDate,
            student.status,
            student.currentBalance,
            student.advanceBalance,
            student.emergencyContact,
            student.course,
            student.institution,
            student.idProofType,
            student.idProofNumber,
            student.bookingRequestId,
            student.updatedAt ? new Date(student.updatedAt) : new Date(),
          ]
        );

        console.log(`✓ Migrated student: ${student.name}`);
      } catch (error) {
        console.error(
          `✗ Failed to migrate student ${student.name}:`,
          error.message
        );
      }
    }
  }

  async migrateRooms() {
    console.log("Migrating rooms data...");
    const roomsData = JSON.parse(
      fs.readFileSync("server/src/data/rooms.json", "utf8")
    );

    for (const room of roomsData) {
      try {
        // Insert room
        await db.query(
          `
                    INSERT INTO rooms (
                        id, name, type, bed_count, occupancy, gender, monthly_rate, daily_rate,
                        status, floor, room_number, last_cleaned, maintenance_status,
                        pricing_model, description, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        updated_at = EXCLUDED.updated_at
                `,
          [
            room.id,
            room.name,
            room.type,
            room.bedCount,
            room.occupancy,
            room.gender,
            room.monthlyRate,
            room.dailyRate,
            room.status,
            room.floor,
            room.roomNumber,
            room.lastCleaned,
            room.maintenanceStatus,
            room.pricingModel,
            room.description,
            new Date(room.createdAt),
            new Date(room.updatedAt),
          ]
        );

        // Insert amenities
        if (room.amenities && room.amenities.length > 0) {
          for (const amenity of room.amenities) {
            await db.query(
              `
                            INSERT INTO room_amenities (room_id, amenity)
                            VALUES ($1, $2)
                            ON CONFLICT (room_id, amenity) DO NOTHING
                        `,
              [room.id, amenity]
            );
          }
        }

        // Insert occupants
        if (room.occupants && room.occupants.length > 0) {
          for (const occupant of room.occupants) {
            await db.query(
              `
                            INSERT INTO room_occupants (room_id, student_id, student_name, phone, email, status)
                            VALUES ($1, $2, $3, $4, $5, 'Active')
                            ON CONFLICT (room_id, student_id, status) DO NOTHING
                        `,
              [
                room.id,
                occupant.id,
                occupant.name,
                occupant.phone,
                occupant.email,
              ]
            );
          }
        }

        // Insert layout if exists
        if (room.layout) {
          await db.query(
            `
                        INSERT INTO room_layouts (room_id, layout_data)
                        VALUES ($1, $2)
                        ON CONFLICT (room_id) DO UPDATE SET
                            layout_data = EXCLUDED.layout_data,
                            updated_at = CURRENT_TIMESTAMP
                    `,
            [room.id, JSON.stringify(room.layout)]
          );
        }

        console.log(`✓ Migrated room: ${room.name}`);
      } catch (error) {
        console.error(`✗ Failed to migrate room ${room.name}:`, error.message);
      }
    }
  }

  async runFullMigration() {
    try {
      console.log("Starting full database migration...");

      await this.migrateStudents();
      await this.migrateRooms();
      await this.migrateBookingRequests();
      await this.migrateInvoices();
      await this.migratePayments();
      await this.migrateLedger();
      await this.migrateDiscounts();
      await this.migrateReports();

      console.log("✓ Migration completed successfully!");
    } catch (error) {
      console.error("✗ Migration failed:", error);
      throw error;
    }
  }
}

module.exports = DataMigrator;
```

## Error Handling

### 1. PostgreSQL-Specific Error Handling

```javascript
class DatabaseErrorHandler {
  static handle(error, operation) {
    console.error(`Database error during ${operation}:`, error);

    // PostgreSQL specific error codes
    if (error.code === "23505") {
      // unique_violation
      throw new Error("Duplicate entry detected");
    }

    if (error.code === "23503") {
      // foreign_key_violation
      throw new Error("Referenced record not found");
    }

    if (error.code === "23502") {
      // not_null_violation
      throw new Error("Required field is missing");
    }

    if (error.code === "23514") {
      // check_violation
      throw new Error("Invalid value provided");
    }

    if (error.code === "ECONNREFUSED") {
      throw new Error("Database connection failed");
    }

    throw new Error(`Database operation failed: ${error.message}`);
  }
}
```

## Testing Strategy

### 1. PostgreSQL-Specific Tests

```javascript
const { Pool } = require("pg");

describe("PostgreSQL Database Operations", () => {
  let testDb;

  beforeAll(async () => {
    testDb = new Pool({
      host: process.env.TEST_DB_HOST,
      port: process.env.TEST_DB_PORT,
      user: process.env.TEST_DB_USER,
      password: process.env.TEST_DB_PASSWORD,
      database: process.env.TEST_DB_NAME,
    });
  });

  afterAll(async () => {
    await testDb.end();
  });

  beforeEach(async () => {
    // Clean up test data
    await testDb.query("TRUNCATE TABLE students CASCADE");
    await testDb.query("TRUNCATE TABLE rooms CASCADE");
  });

  test("should create student with JSONB data", async () => {
    const studentData = {
      id: "S001",
      name: "Test Student",
      phone: "+977-9861234567",
      email: "test@example.com",
      room_number: "A-101",
    };

    const result = await testDb.query(
      `
            INSERT INTO students (id, name, phone, email, room_number)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `,
      [
        studentData.id,
        studentData.name,
        studentData.phone,
        studentData.email,
        studentData.room_number,
      ]
    );

    expect(result.rows[0].id).toBe("S001");
    expect(result.rows[0].name).toBe("Test Student");
  });

  test("should handle JSONB queries for room layouts", async () => {
    const layoutData = {
      dimensions: { length: 10, width: 8, height: 3 },
      elements: [{ id: "1", type: "bed", x: 1, y: 1 }],
    };

    await testDb.query(
      `
            INSERT INTO room_layouts (room_id, layout_data)
            VALUES ($1, $2)
        `,
      ["room-1", JSON.stringify(layoutData)]
    );

    const result = await testDb.query(
      `
            SELECT layout_data->'dimensions'->>'length' as length
            FROM room_layouts 
            WHERE room_id = $1
        `,
      ["room-1"]
    );

    expect(result.rows[0].length).toBe("10");
  });
});
```

## Deployment Strategy

### 1. PostgreSQL Environment Setup

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE kaha_hostel_db;
CREATE USER kaha_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE kaha_hostel_db TO kaha_user;
GRANT ALL ON SCHEMA public TO kaha_user;

# Environment variables
DB_HOST=localhost
DB_PORT=5432
DB_USER=kaha_user
DB_PASSWORD=secure_password
DB_NAME=kaha_hostel_db
```

### 2. Migration Execution

```javascript
const DataMigrator = require("./DataMigrator");

async function runMigration() {
  const migrator = new DataMigrator();

  try {
    console.log("🚀 Starting PostgreSQL migration...");

    // Create backup of JSON files
    await migrator.createBackup();
    console.log("✓ Backup created");

    // Run migration
    await migrator.runFullMigration();
    console.log("✓ Migration completed");

    // Verify data integrity
    await migrator.verifyMigration();
    console.log("✓ Data verified");

    console.log("🎉 Migration successful!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    await migrator.rollback();
    process.exit(1);
  }
}

runMigration();
```

This PostgreSQL-specific design provides all the benefits of a modern relational database while maintaining 100% API compatibility with your existing frontend application.
