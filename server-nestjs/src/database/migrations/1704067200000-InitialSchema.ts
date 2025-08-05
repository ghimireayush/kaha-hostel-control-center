import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1704067200000 implements MigrationInterface {
  name = 'InitialSchema1704067200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM types
    await queryRunner.query(`
      CREATE TYPE "student_status_enum" AS ENUM('Active', 'Inactive', 'Suspended', 'Graduated')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "contact_type_enum" AS ENUM('GUARDIAN', 'EMERGENCY', 'PERSONAL')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "fee_type_enum" AS ENUM('BASE_MONTHLY', 'LAUNDRY', 'FOOD', 'UTILITIES', 'SECURITY_DEPOSIT', 'OTHER')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "room_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RESERVED')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "amenity_category_enum" AS ENUM('FURNITURE', 'UTILITIES', 'ELECTRONICS', 'SAFETY', 'COMFORT', 'OTHER')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "invoice_status_enum" AS ENUM('DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "payment_method_enum" AS ENUM('CASH', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE', 'UPI', 'CARD')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "payment_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "ledger_entry_type_enum" AS ENUM('INVOICE', 'PAYMENT', 'DISCOUNT', 'ADJUSTMENT', 'REFUND')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "balance_type_enum" AS ENUM('Dr', 'Cr', 'Nil')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "discount_status_enum" AS ENUM('ACTIVE', 'EXPIRED', 'CANCELLED')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "booking_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "report_type_enum" AS ENUM('OCCUPANCY', 'FINANCIAL', 'STUDENT', 'PAYMENT', 'LEDGER')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "report_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED')
    `);

    // Create Buildings table
    await queryRunner.query(`
      CREATE TABLE "buildings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "address" text,
        "floors" integer DEFAULT 1,
        "totalRooms" integer DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_buildings" PRIMARY KEY ("id")
      )
    `);

    // Create Room Types table
    await queryRunner.query(`
      CREATE TABLE "room_types" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "baseMonthlyRate" decimal(10,2) DEFAULT 0,
        "baseDailyRate" decimal(10,2) DEFAULT 0,
        "defaultBedCount" integer DEFAULT 1,
        "maxOccupancy" integer DEFAULT 1,
        "pricingModel" character varying DEFAULT 'monthly',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_room_types" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_room_types_name" UNIQUE ("name")
      )
    `);

    // Create Amenities table
    await queryRunner.query(`
      CREATE TABLE "amenities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "category" "amenity_category_enum" NOT NULL DEFAULT 'OTHER',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_amenities" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_amenities_name" UNIQUE ("name")
      )
    `);

    // Create Rooms table
    await queryRunner.query(`
      CREATE TABLE "rooms" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "roomNumber" character varying NOT NULL,
        "bedCount" integer NOT NULL DEFAULT 1,
        "occupancy" integer NOT NULL DEFAULT 0,
        "gender" character varying DEFAULT 'Any',
        "status" "room_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "maintenanceStatus" character varying DEFAULT 'Good',
        "lastCleaned" TIMESTAMP,
        "lastMaintenance" TIMESTAMP,
        "description" text,
        "buildingId" uuid,
        "roomTypeId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_rooms" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_rooms_roomNumber" UNIQUE ("roomNumber")
      )
    `);

    // Add computed column for available beds
    await queryRunner.query(`
      ALTER TABLE "rooms" ADD COLUMN "availableBeds" integer GENERATED ALWAYS AS ("bedCount" - "occupancy") STORED
    `);

    // Create Room Amenities junction table
    await queryRunner.query(`
      CREATE TABLE "room_amenities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "roomId" uuid NOT NULL,
        "amenityId" uuid NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "installedDate" TIMESTAMP DEFAULT now(),
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_room_amenities" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_room_amenities_room_amenity" UNIQUE ("roomId", "amenityId")
      )
    `);

    // Create Room Layouts table
    await queryRunner.query(`
      CREATE TABLE "room_layouts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "roomId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "layoutData" jsonb,
        "dimensions" jsonb,
        "theme" character varying,
        "version" integer DEFAULT 1,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_room_layouts" PRIMARY KEY ("id")
      )
    `);

    // Create Students table
    await queryRunner.query(`
      CREATE TABLE "students" (
        "id" character varying NOT NULL,
        "name" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "email" character varying NOT NULL,
        "address" text,
        "enrollmentDate" TIMESTAMP DEFAULT now(),
        "checkoutDate" TIMESTAMP,
        "status" "student_status_enum" NOT NULL DEFAULT 'Active',
        "roomId" uuid,
        "bookingRequestId" character varying,
        "deletedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_students" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_students_email" UNIQUE ("email"),
        CONSTRAINT "UQ_students_phone" UNIQUE ("phone")
      )
    `);

    // Create Student Contacts table
    await queryRunner.query(`
      CREATE TABLE "student_contacts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "studentId" character varying NOT NULL,
        "type" "contact_type_enum" NOT NULL,
        "name" character varying,
        "phone" character varying,
        "email" character varying,
        "relationship" character varying,
        "isPrimary" boolean DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_contacts" PRIMARY KEY ("id")
      )
    `);

    // Create Student Academic Info table
    await queryRunner.query(`
      CREATE TABLE "student_academic_info" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "studentId" character varying NOT NULL,
        "course" character varying,
        "institution" character varying,
        "year" integer,
        "semester" integer,
        "startDate" TIMESTAMP,
        "expectedEndDate" TIMESTAMP,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_academic_info" PRIMARY KEY ("id")
      )
    `);

    // Create Student Financial Info table
    await queryRunner.query(`
      CREATE TABLE "student_financial_info" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "studentId" character varying NOT NULL,
        "feeType" "fee_type_enum" NOT NULL,
        "amount" decimal(10,2) NOT NULL DEFAULT 0,
        "effectiveFrom" TIMESTAMP NOT NULL DEFAULT now(),
        "effectiveTo" TIMESTAMP,
        "isActive" boolean NOT NULL DEFAULT true,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_financial_info" PRIMARY KEY ("id")
      )
    `);

    // Create Invoices table
    await queryRunner.query(`
      CREATE TABLE "invoices" (
        "id" character varying NOT NULL,
        "studentId" character varying NOT NULL,
        "month" character varying NOT NULL,
        "issueDate" TIMESTAMP NOT NULL DEFAULT now(),
        "dueDate" TIMESTAMP,
        "total" decimal(10,2) NOT NULL DEFAULT 0,
        "paidAmount" decimal(10,2) NOT NULL DEFAULT 0,
        "status" "invoice_status_enum" NOT NULL DEFAULT 'PENDING',
        "notes" text,
        "createdBy" character varying DEFAULT 'system',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_invoices" PRIMARY KEY ("id")
      )
    `);

    // Add computed column for balance due
    await queryRunner.query(`
      ALTER TABLE "invoices" ADD COLUMN "balanceDue" decimal(10,2) GENERATED ALWAYS AS ("total" - "paidAmount") STORED
    `);

    // Create Invoice Items table
    await queryRunner.query(`
      CREATE TABLE "invoice_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "invoiceId" character varying NOT NULL,
        "description" character varying NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "quantity" integer DEFAULT 1,
        "category" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_invoice_items" PRIMARY KEY ("id")
      )
    `);

    // Create Payments table
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" character varying NOT NULL,
        "studentId" character varying NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "paymentMethod" "payment_method_enum" NOT NULL,
        "paymentDate" TIMESTAMP NOT NULL DEFAULT now(),
        "reference" character varying,
        "notes" text,
        "status" "payment_status_enum" NOT NULL DEFAULT 'COMPLETED',
        "transactionId" character varying,
        "receiptNumber" character varying,
        "processedBy" character varying DEFAULT 'admin',
        "bankName" character varying,
        "chequeNumber" character varying,
        "chequeDate" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id")
      )
    `);

    // Create Payment Invoice Allocations table
    await queryRunner.query(`
      CREATE TABLE "payment_invoice_allocations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "paymentId" character varying NOT NULL,
        "invoiceId" character varying NOT NULL,
        "allocatedAmount" decimal(10,2) NOT NULL,
        "allocationDate" TIMESTAMP NOT NULL DEFAULT now(),
        "allocatedBy" character varying DEFAULT 'system',
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_invoice_allocations" PRIMARY KEY ("id")
      )
    `);

    // Create Ledger Entries table
    await queryRunner.query(`
      CREATE TABLE "ledger_entries" (
        "id" character varying NOT NULL,
        "studentId" character varying NOT NULL,
        "date" TIMESTAMP NOT NULL DEFAULT now(),
        "type" "ledger_entry_type_enum" NOT NULL,
        "description" text NOT NULL,
        "referenceId" character varying,
        "debit" decimal(10,2) NOT NULL DEFAULT 0,
        "credit" decimal(10,2) NOT NULL DEFAULT 0,
        "balance" decimal(10,2) NOT NULL DEFAULT 0,
        "balanceType" "balance_type_enum" NOT NULL DEFAULT 'Nil',
        "entryNumber" integer NOT NULL,
        "notes" text,
        "createdBy" character varying DEFAULT 'system',
        "isReversed" boolean NOT NULL DEFAULT false,
        "reversedBy" character varying,
        "reversalDate" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ledger_entries" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_ledger_entries_entryNumber" UNIQUE ("entryNumber")
      )
    `);

    // Create Discount Types table
    await queryRunner.query(`
      CREATE TABLE "discount_types" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "category" character varying DEFAULT 'PROMOTIONAL',
        "defaultAmount" decimal(10,2) DEFAULT 0,
        "isPercentage" boolean DEFAULT false,
        "percentageValue" decimal(5,2),
        "maxAmount" decimal(10,2),
        "requiresApproval" boolean DEFAULT false,
        "autoApply" boolean DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_discount_types" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_discount_types_name" UNIQUE ("name")
      )
    `);

    // Create Discounts table
    await queryRunner.query(`
      CREATE TABLE "discounts" (
        "id" character varying NOT NULL,
        "studentId" character varying NOT NULL,
        "discountTypeId" uuid,
        "amount" decimal(10,2) NOT NULL,
        "reason" character varying NOT NULL,
        "notes" text,
        "appliedBy" character varying DEFAULT 'Admin',
        "date" TIMESTAMP NOT NULL DEFAULT now(),
        "status" "discount_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "appliedTo" character varying DEFAULT 'ledger',
        "validFrom" TIMESTAMP,
        "validTo" TIMESTAMP,
        "isPercentage" boolean DEFAULT false,
        "percentageValue" decimal(5,2),
        "maxAmount" decimal(10,2),
        "referenceId" character varying,
        "updatedBy" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_discounts" PRIMARY KEY ("id")
      )
    `);

    // Create Booking Requests table
    await queryRunner.query(`
      CREATE TABLE "booking_requests" (
        "id" character varying NOT NULL,
        "name" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "email" character varying NOT NULL,
        "guardianName" character varying,
        "guardianPhone" character varying,
        "preferredRoom" character varying,
        "course" character varying,
        "institution" character varying,
        "requestDate" TIMESTAMP NOT NULL DEFAULT now(),
        "checkInDate" TIMESTAMP,
        "duration" integer,
        "status" "booking_status_enum" NOT NULL DEFAULT 'PENDING',
        "notes" text,
        "emergencyContact" character varying,
        "address" text,
        "idProofType" character varying,
        "idProofNumber" character varying,
        "source" character varying DEFAULT 'website',
        "priorityScore" integer DEFAULT 0,
        "approvedDate" TIMESTAMP,
        "processedBy" character varying,
        "assignedRoom" character varying,
        "rejectionReason" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_booking_requests" PRIMARY KEY ("id")
      )
    `);

    // Create Reports table
    await queryRunner.query(`
      CREATE TABLE "reports" (
        "id" character varying NOT NULL,
        "name" character varying NOT NULL,
        "type" "report_type_enum" NOT NULL,
        "description" text,
        "parameters" jsonb,
        "status" "report_status_enum" NOT NULL DEFAULT 'COMPLETED',
        "dataSize" integer DEFAULT 0,
        "generatedBy" character varying DEFAULT 'system',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reports" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order to handle foreign key constraints
    await queryRunner.query(`DROP TABLE "reports"`);
    await queryRunner.query(`DROP TABLE "booking_requests"`);
    await queryRunner.query(`DROP TABLE "discounts"`);
    await queryRunner.query(`DROP TABLE "discount_types"`);
    await queryRunner.query(`DROP TABLE "ledger_entries"`);
    await queryRunner.query(`DROP TABLE "payment_invoice_allocations"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "invoice_items"`);
    await queryRunner.query(`DROP TABLE "invoices"`);
    await queryRunner.query(`DROP TABLE "student_financial_info"`);
    await queryRunner.query(`DROP TABLE "student_academic_info"`);
    await queryRunner.query(`DROP TABLE "student_contacts"`);
    await queryRunner.query(`DROP TABLE "students"`);
    await queryRunner.query(`DROP TABLE "room_layouts"`);
    await queryRunner.query(`DROP TABLE "room_amenities"`);
    await queryRunner.query(`DROP TABLE "rooms"`);
    await queryRunner.query(`DROP TABLE "amenities"`);
    await queryRunner.query(`DROP TABLE "room_types"`);
    await queryRunner.query(`DROP TABLE "buildings"`);

    // Drop ENUM types
    await queryRunner.query(`DROP TYPE "report_status_enum"`);
    await queryRunner.query(`DROP TYPE "report_type_enum"`);
    await queryRunner.query(`DROP TYPE "booking_status_enum"`);
    await queryRunner.query(`DROP TYPE "discount_status_enum"`);
    await queryRunner.query(`DROP TYPE "balance_type_enum"`);
    await queryRunner.query(`DROP TYPE "ledger_entry_type_enum"`);
    await queryRunner.query(`DROP TYPE "payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "payment_method_enum"`);
    await queryRunner.query(`DROP TYPE "invoice_status_enum"`);
    await queryRunner.query(`DROP TYPE "amenity_category_enum"`);
    await queryRunner.query(`DROP TYPE "room_status_enum"`);
    await queryRunner.query(`DROP TYPE "fee_type_enum"`);
    await queryRunner.query(`DROP TYPE "contact_type_enum"`);
    await queryRunner.query(`DROP TYPE "student_status_enum"`);
  }
}