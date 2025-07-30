import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConstraintsAndIndexes1704067300000 implements MigrationInterface {
  name = 'AddConstraintsAndIndexes1704067300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add foreign key constraints
    
    // Room foreign keys
    await queryRunner.query(`
      ALTER TABLE "rooms" 
      ADD CONSTRAINT "FK_rooms_building" 
      FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE SET NULL
    `);
    
    await queryRunner.query(`
      ALTER TABLE "rooms" 
      ADD CONSTRAINT "FK_rooms_roomType" 
      FOREIGN KEY ("roomTypeId") REFERENCES "room_types"("id") ON DELETE SET NULL
    `);
    
    // Room amenities foreign keys
    await queryRunner.query(`
      ALTER TABLE "room_amenities" 
      ADD CONSTRAINT "FK_room_amenities_room" 
      FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE
    `);
    
    await queryRunner.query(`
      ALTER TABLE "room_amenities" 
      ADD CONSTRAINT "FK_room_amenities_amenity" 
      FOREIGN KEY ("amenityId") REFERENCES "amenities"("id") ON DELETE CASCADE
    `);
    
    // Room layouts foreign key
    await queryRunner.query(`
      ALTER TABLE "room_layouts" 
      ADD CONSTRAINT "FK_room_layouts_room" 
      FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE
    `);
    
    // Student foreign keys
    await queryRunner.query(`
      ALTER TABLE "students" 
      ADD CONSTRAINT "FK_students_room" 
      FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL
    `);
    
    // Student contacts foreign key
    await queryRunner.query(`
      ALTER TABLE "student_contacts" 
      ADD CONSTRAINT "FK_student_contacts_student" 
      FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE
    `);
    
    // Student academic info foreign key
    await queryRunner.query(`
      ALTER TABLE "student_academic_info" 
      ADD CONSTRAINT "FK_student_academic_info_student" 
      FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE
    `);
    
    // Student financial info foreign key
    await queryRunner.query(`
      ALTER TABLE "student_financial_info" 
      ADD CONSTRAINT "FK_student_financial_info_student" 
      FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE
    `);
    
    // Invoice foreign key
    await queryRunner.query(`
      ALTER TABLE "invoices" 
      ADD CONSTRAINT "FK_invoices_student" 
      FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE
    `);
    
    // Invoice items foreign key
    await queryRunner.query(`
      ALTER TABLE "invoice_items" 
      ADD CONSTRAINT "FK_invoice_items_invoice" 
      FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE
    `);
    
    // Payment foreign key
    await queryRunner.query(`
      ALTER TABLE "payments" 
      ADD CONSTRAINT "FK_payments_student" 
      FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE
    `);
    
    // Payment invoice allocations foreign keys
    await queryRunner.query(`
      ALTER TABLE "payment_invoice_allocations" 
      ADD CONSTRAINT "FK_payment_allocations_payment" 
      FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE
    `);
    
    await queryRunner.query(`
      ALTER TABLE "payment_invoice_allocations" 
      ADD CONSTRAINT "FK_payment_allocations_invoice" 
      FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE
    `);
    
    // Ledger entries foreign key
    await queryRunner.query(`
      ALTER TABLE "ledger_entries" 
      ADD CONSTRAINT "FK_ledger_entries_student" 
      FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE
    `);
    
    // Discounts foreign keys
    await queryRunner.query(`
      ALTER TABLE "discounts" 
      ADD CONSTRAINT "FK_discounts_student" 
      FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE
    `);
    
    await queryRunner.query(`
      ALTER TABLE "discounts" 
      ADD CONSTRAINT "FK_discounts_discount_type" 
      FOREIGN KEY ("discountTypeId") REFERENCES "discount_types"("id") ON DELETE SET NULL
    `);

    // Create performance indexes
    
    // Student indexes
    await queryRunner.query(`CREATE INDEX "IDX_students_status" ON "students" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_students_roomId" ON "students" ("roomId")`);
    await queryRunner.query(`CREATE INDEX "IDX_students_enrollmentDate" ON "students" ("enrollmentDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_students_name" ON "students" ("name")`);
    await queryRunner.query(`CREATE INDEX "IDX_students_phone" ON "students" ("phone")`);
    
    // Room indexes
    await queryRunner.query(`CREATE INDEX "IDX_rooms_status" ON "rooms" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_rooms_buildingId" ON "rooms" ("buildingId")`);
    await queryRunner.query(`CREATE INDEX "IDX_rooms_roomTypeId" ON "rooms" ("roomTypeId")`);
    await queryRunner.query(`CREATE INDEX "IDX_rooms_occupancy" ON "rooms" ("occupancy")`);
    await queryRunner.query(`CREATE INDEX "IDX_rooms_availableBeds" ON "rooms" ("availableBeds")`);
    await queryRunner.query(`CREATE INDEX "IDX_rooms_gender" ON "rooms" ("gender")`);
    
    // Room amenities indexes
    await queryRunner.query(`CREATE INDEX "IDX_room_amenities_roomId" ON "room_amenities" ("roomId")`);
    await queryRunner.query(`CREATE INDEX "IDX_room_amenities_amenityId" ON "room_amenities" ("amenityId")`);
    await queryRunner.query(`CREATE INDEX "IDX_room_amenities_isActive" ON "room_amenities" ("isActive")`);
    
    // Room layouts indexes
    await queryRunner.query(`CREATE INDEX "IDX_room_layouts_roomId" ON "room_layouts" ("roomId")`);
    await queryRunner.query(`CREATE INDEX "IDX_room_layouts_isActive" ON "room_layouts" ("isActive")`);
    
    // Student contacts indexes
    await queryRunner.query(`CREATE INDEX "IDX_student_contacts_studentId" ON "student_contacts" ("studentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_student_contacts_type" ON "student_contacts" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_student_contacts_isPrimary" ON "student_contacts" ("isPrimary")`);
    
    // Student academic info indexes
    await queryRunner.query(`CREATE INDEX "IDX_student_academic_info_studentId" ON "student_academic_info" ("studentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_student_academic_info_course" ON "student_academic_info" ("course")`);
    await queryRunner.query(`CREATE INDEX "IDX_student_academic_info_institution" ON "student_academic_info" ("institution")`);
    
    // Student financial info indexes
    await queryRunner.query(`CREATE INDEX "IDX_student_financial_info_studentId" ON "student_financial_info" ("studentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_student_financial_info_feeType" ON "student_financial_info" ("feeType")`);
    await queryRunner.query(`CREATE INDEX "IDX_student_financial_info_effectiveFrom" ON "student_financial_info" ("effectiveFrom")`);
    
    // Invoice indexes
    await queryRunner.query(`CREATE INDEX "IDX_invoices_studentId" ON "invoices" ("studentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_invoices_month" ON "invoices" ("month")`);
    await queryRunner.query(`CREATE INDEX "IDX_invoices_status" ON "invoices" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_invoices_dueDate" ON "invoices" ("dueDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_invoices_issueDate" ON "invoices" ("issueDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_invoices_balanceDue" ON "invoices" ("balanceDue")`);
    
    // Invoice items indexes
    await queryRunner.query(`CREATE INDEX "IDX_invoice_items_invoiceId" ON "invoice_items" ("invoiceId")`);
    await queryRunner.query(`CREATE INDEX "IDX_invoice_items_category" ON "invoice_items" ("category")`);
    
    // Payment indexes
    await queryRunner.query(`CREATE INDEX "IDX_payments_studentId" ON "payments" ("studentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_paymentDate" ON "payments" ("paymentDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_paymentMethod" ON "payments" ("paymentMethod")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_status" ON "payments" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_amount" ON "payments" ("amount")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_reference" ON "payments" ("reference")`);
    
    // Payment allocations indexes
    await queryRunner.query(`CREATE INDEX "IDX_payment_allocations_paymentId" ON "payment_invoice_allocations" ("paymentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_allocations_invoiceId" ON "payment_invoice_allocations" ("invoiceId")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_allocations_allocationDate" ON "payment_invoice_allocations" ("allocationDate")`);
    
    // Ledger entries indexes
    await queryRunner.query(`CREATE INDEX "IDX_ledger_entries_studentId" ON "ledger_entries" ("studentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_ledger_entries_date" ON "ledger_entries" ("date")`);
    await queryRunner.query(`CREATE INDEX "IDX_ledger_entries_type" ON "ledger_entries" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_ledger_entries_referenceId" ON "ledger_entries" ("referenceId")`);
    await queryRunner.query(`CREATE INDEX "IDX_ledger_entries_balanceType" ON "ledger_entries" ("balanceType")`);
    await queryRunner.query(`CREATE INDEX "IDX_ledger_entries_entryNumber" ON "ledger_entries" ("entryNumber")`);
    await queryRunner.query(`CREATE INDEX "IDX_ledger_entries_isReversed" ON "ledger_entries" ("isReversed")`);
    
    // Discount types indexes
    await queryRunner.query(`CREATE INDEX "IDX_discount_types_category" ON "discount_types" ("category")`);
    await queryRunner.query(`CREATE INDEX "IDX_discount_types_isActive" ON "discount_types" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_discount_types_requiresApproval" ON "discount_types" ("requiresApproval")`);
    
    // Discounts indexes
    await queryRunner.query(`CREATE INDEX "IDX_discounts_studentId" ON "discounts" ("studentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_discounts_discountTypeId" ON "discounts" ("discountTypeId")`);
    await queryRunner.query(`CREATE INDEX "IDX_discounts_status" ON "discounts" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_discounts_date" ON "discounts" ("date")`);
    await queryRunner.query(`CREATE INDEX "IDX_discounts_validFrom" ON "discounts" ("validFrom")`);
    await queryRunner.query(`CREATE INDEX "IDX_discounts_validTo" ON "discounts" ("validTo")`);
    await queryRunner.query(`CREATE INDEX "IDX_discounts_referenceId" ON "discounts" ("referenceId")`);
    
    // Booking requests indexes
    await queryRunner.query(`CREATE INDEX "IDX_booking_requests_status" ON "booking_requests" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_booking_requests_requestDate" ON "booking_requests" ("requestDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_booking_requests_checkInDate" ON "booking_requests" ("checkInDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_booking_requests_phone" ON "booking_requests" ("phone")`);
    await queryRunner.query(`CREATE INDEX "IDX_booking_requests_email" ON "booking_requests" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_booking_requests_priorityScore" ON "booking_requests" ("priorityScore")`);
    await queryRunner.query(`CREATE INDEX "IDX_booking_requests_source" ON "booking_requests" ("source")`);
    
    // Reports indexes
    await queryRunner.query(`CREATE INDEX "IDX_reports_type" ON "reports" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_reports_status" ON "reports" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_reports_generatedBy" ON "reports" ("generatedBy")`);
    await queryRunner.query(`CREATE INDEX "IDX_reports_createdAt" ON "reports" ("createdAt")`);
    
    // Building indexes
    await queryRunner.query(`CREATE INDEX "IDX_buildings_isActive" ON "buildings" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_buildings_name" ON "buildings" ("name")`);
    
    // Room types indexes
    await queryRunner.query(`CREATE INDEX "IDX_room_types_isActive" ON "room_types" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_room_types_pricingModel" ON "room_types" ("pricingModel")`);
    
    // Amenities indexes
    await queryRunner.query(`CREATE INDEX "IDX_amenities_category" ON "amenities" ("category")`);
    await queryRunner.query(`CREATE INDEX "IDX_amenities_isActive" ON "amenities" ("isActive")`);

    // Create JSONB indexes for better performance on JSON queries
    await queryRunner.query(`CREATE INDEX "IDX_room_layouts_layoutData" ON "room_layouts" USING GIN ("layoutData")`);
    await queryRunner.query(`CREATE INDEX "IDX_room_layouts_dimensions" ON "room_layouts" USING GIN ("dimensions")`);
    await queryRunner.query(`CREATE INDEX "IDX_reports_parameters" ON "reports" USING GIN ("parameters")`);

    // Create composite indexes for common query patterns
    await queryRunner.query(`CREATE INDEX "IDX_students_status_roomId" ON "students" ("status", "roomId")`);
    await queryRunner.query(`CREATE INDEX "IDX_rooms_status_occupancy" ON "rooms" ("status", "occupancy")`);
    await queryRunner.query(`CREATE INDEX "IDX_invoices_studentId_month" ON "invoices" ("studentId", "month")`);
    await queryRunner.query(`CREATE INDEX "IDX_invoices_status_dueDate" ON "invoices" ("status", "dueDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_studentId_paymentDate" ON "payments" ("studentId", "paymentDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_ledger_entries_studentId_date" ON "ledger_entries" ("studentId", "date")`);
    await queryRunner.query(`CREATE INDEX "IDX_discounts_studentId_status" ON "discounts" ("studentId", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_booking_requests_status_requestDate" ON "booking_requests" ("status", "requestDate")`);

    // Create unique constraints for business rules
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_invoices_studentId_month_unique" ON "invoices" ("studentId", "month")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_student_academic_info_studentId_active" ON "student_academic_info" ("studentId") WHERE "isActive" = true`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_room_layouts_roomId_active" ON "room_layouts" ("roomId") WHERE "isActive" = true`);

    // Add check constraints for data integrity
    await queryRunner.query(`ALTER TABLE "rooms" ADD CONSTRAINT "CHK_rooms_occupancy_valid" CHECK ("occupancy" >= 0 AND "occupancy" <= "bedCount")`);
    await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "CHK_invoices_amounts_valid" CHECK ("total" >= 0 AND "paidAmount" >= 0 AND "paidAmount" <= "total")`);
    await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "CHK_payments_amount_positive" CHECK ("amount" > 0)`);
    await queryRunner.query(`ALTER TABLE "payment_invoice_allocations" ADD CONSTRAINT "CHK_allocations_amount_positive" CHECK ("allocatedAmount" > 0)`);
    await queryRunner.query(`ALTER TABLE "ledger_entries" ADD CONSTRAINT "CHK_ledger_entries_amounts_valid" CHECK ("debit" >= 0 AND "credit" >= 0 AND NOT ("debit" > 0 AND "credit" > 0))`);
    await queryRunner.query(`ALTER TABLE "discounts" ADD CONSTRAINT "CHK_discounts_amount_positive" CHECK ("amount" > 0)`);
    await queryRunner.query(`ALTER TABLE "discount_types" ADD CONSTRAINT "CHK_discount_types_percentage_valid" CHECK (("isPercentage" = false) OR ("percentageValue" > 0 AND "percentageValue" <= 100))`);
    await queryRunner.query(`ALTER TABLE "student_financial_info" ADD CONSTRAINT "CHK_student_financial_info_amount_valid" CHECK ("amount" >= 0)`);
    await queryRunner.query(`ALTER TABLE "booking_requests" ADD CONSTRAINT "CHK_booking_requests_duration_valid" CHECK ("duration" IS NULL OR "duration" > 0)`);

    // Create triggers for automatic timestamp updates
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Apply update triggers to all tables with updatedAt columns
    const tablesWithUpdatedAt = [
      'buildings', 'room_types', 'amenities', 'rooms', 'room_amenities', 'room_layouts',
      'students', 'student_contacts', 'student_academic_info', 'student_financial_info',
      'invoices', 'invoice_items', 'payments', 'payment_invoice_allocations',
      'ledger_entries', 'discount_types', 'discounts', 'booking_requests', 'reports'
    ];

    for (const table of tablesWithUpdatedAt) {
      await queryRunner.query(`
        CREATE TRIGGER "update_${table}_updated_at" 
        BEFORE UPDATE ON "${table}" 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    // Create sequence for ledger entry numbers
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "ledger_entry_number_seq" START 1`);
    
    // Create trigger for auto-incrementing ledger entry numbers
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_ledger_entry_number()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW."entryNumber" IS NULL THEN
          NEW."entryNumber" = nextval('ledger_entry_number_seq');
        END IF;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER "set_ledger_entry_number_trigger" 
      BEFORE INSERT ON "ledger_entries" 
      FOR EACH ROW EXECUTE FUNCTION set_ledger_entry_number();
    `);

    // Create function for updating room occupancy
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_room_occupancy()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE "rooms" SET "occupancy" = "occupancy" + 1 WHERE "id" = NEW."roomId";
          RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE "rooms" SET "occupancy" = "occupancy" - 1 WHERE "id" = OLD."roomId";
          RETURN OLD;
        ELSIF TG_OP = 'UPDATE' THEN
          IF OLD."roomId" != NEW."roomId" THEN
            UPDATE "rooms" SET "occupancy" = "occupancy" - 1 WHERE "id" = OLD."roomId";
            UPDATE "rooms" SET "occupancy" = "occupancy" + 1 WHERE "id" = NEW."roomId";
          END IF;
          RETURN NEW;
        END IF;
        RETURN NULL;
      END;
      $$ language 'plpgsql';
    `);

    // Note: Room occupancy will be managed through the RoomOccupant entity when it's created
    // For now, we'll manage occupancy manually through the service layer
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers first
    const tablesWithUpdatedAt = [
      'buildings', 'room_types', 'amenities', 'rooms', 'room_amenities', 'room_layouts',
      'students', 'student_contacts', 'student_academic_info', 'student_financial_info',
      'invoices', 'invoice_items', 'payments', 'payment_invoice_allocations',
      'ledger_entries', 'discount_types', 'discounts', 'booking_requests', 'reports'
    ];

    for (const table of tablesWithUpdatedAt) {
      await queryRunner.query(`DROP TRIGGER IF EXISTS "update_${table}_updated_at" ON "${table}"`);
    }

    await queryRunner.query(`DROP TRIGGER IF EXISTS "set_ledger_entry_number_trigger" ON "ledger_entries"`);
    
    // Drop functions
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS set_ledger_entry_number()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_room_occupancy()`);
    
    // Drop sequence
    await queryRunner.query(`DROP SEQUENCE IF EXISTS "ledger_entry_number_seq"`);

    // Drop check constraints
    await queryRunner.query(`ALTER TABLE "booking_requests" DROP CONSTRAINT IF EXISTS "CHK_booking_requests_duration_valid"`);
    await queryRunner.query(`ALTER TABLE "student_financial_info" DROP CONSTRAINT IF EXISTS "CHK_student_financial_info_amount_valid"`);
    await queryRunner.query(`ALTER TABLE "discount_types" DROP CONSTRAINT IF EXISTS "CHK_discount_types_percentage_valid"`);
    await queryRunner.query(`ALTER TABLE "discounts" DROP CONSTRAINT IF EXISTS "CHK_discounts_amount_positive"`);
    await queryRunner.query(`ALTER TABLE "ledger_entries" DROP CONSTRAINT IF EXISTS "CHK_ledger_entries_amounts_valid"`);
    await queryRunner.query(`ALTER TABLE "payment_invoice_allocations" DROP CONSTRAINT IF EXISTS "CHK_allocations_amount_positive"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "CHK_payments_amount_positive"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "CHK_invoices_amounts_valid"`);
    await queryRunner.query(`ALTER TABLE "rooms" DROP CONSTRAINT IF EXISTS "CHK_rooms_occupancy_valid"`);

    // Drop unique indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_room_layouts_roomId_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_student_academic_info_studentId_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoices_studentId_month_unique"`);

    // Drop composite indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_booking_requests_status_requestDate"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_discounts_studentId_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ledger_entries_studentId_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_studentId_paymentDate"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoices_status_dueDate"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoices_studentId_month"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rooms_status_occupancy"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_students_status_roomId"`);

    // Drop JSONB indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reports_parameters"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_room_layouts_dimensions"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_room_layouts_layoutData"`);

    // Drop all other indexes (in reverse order)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_amenities_isActive"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_amenities_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_room_types_pricingModel"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_room_types_isActive"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_buildings_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_buildings_isActive"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reports_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reports_generatedBy"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reports_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reports_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_booking_requests_source"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_booking_requests_priorityScore"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_booking_requests_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_booking_requests_phone"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_booking_requests_checkInDate"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_booking_requests_requestDate"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_booking_requests_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_discounts_referenceId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_discounts_validTo"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_discounts_validFrom"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_discounts_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_discounts_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_discounts_discountTypeId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_discounts_studentId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_discount_types_requiresApproval"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_discount_types_isActive"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_discount_types_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ledger_entries_isReversed"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ledger_entries_entryNumber"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ledger_entries_balanceType"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ledger_entries_referenceId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ledger_entries_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ledger_entries_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ledger_entries_studentId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payment_allocations_allocationDate"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payment_allocations_invoiceId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payment_allocations_paymentId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_reference"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_amount"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_paymentMethod"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_paymentDate"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_studentId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoice_items_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoice_items_invoiceId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoices_balanceDue"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoices_issueDate"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoices_dueDate"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoices_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoices_month"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoices_studentId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_student_financial_info_effectiveFrom"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_student_financial_info_feeType"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_student_financial_info_studentId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_student_academic_info_institution"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_student_academic_info_course"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_student_academic_info_studentId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_student_contacts_isPrimary"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_student_contacts_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_student_contacts_studentId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_room_layouts_isActive"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_room_layouts_roomId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_room_amenities_isActive"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_room_amenities_amenityId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_room_amenities_roomId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rooms_gender"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rooms_availableBeds"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rooms_occupancy"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rooms_roomTypeId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rooms_buildingId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rooms_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_students_phone"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_students_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_students_enrollmentDate"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_students_roomId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_students_status"`);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "discounts" DROP CONSTRAINT IF EXISTS "FK_discounts_discount_type"`);
    await queryRunner.query(`ALTER TABLE "discounts" DROP CONSTRAINT IF EXISTS "FK_discounts_student"`);
    await queryRunner.query(`ALTER TABLE "ledger_entries" DROP CONSTRAINT IF EXISTS "FK_ledger_entries_student"`);
    await queryRunner.query(`ALTER TABLE "payment_invoice_allocations" DROP CONSTRAINT IF EXISTS "FK_payment_allocations_invoice"`);
    await queryRunner.query(`ALTER TABLE "payment_invoice_allocations" DROP CONSTRAINT IF EXISTS "FK_payment_allocations_payment"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "FK_payments_student"`);
    await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT IF EXISTS "FK_invoice_items_invoice"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "FK_invoices_student"`);
    await queryRunner.query(`ALTER TABLE "student_financial_info" DROP CONSTRAINT IF EXISTS "FK_student_financial_info_student"`);
    await queryRunner.query(`ALTER TABLE "student_academic_info" DROP CONSTRAINT IF EXISTS "FK_student_academic_info_student"`);
    await queryRunner.query(`ALTER TABLE "student_contacts" DROP CONSTRAINT IF EXISTS "FK_student_contacts_student"`);
    await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT IF EXISTS "FK_students_room"`);
    await queryRunner.query(`ALTER TABLE "room_layouts" DROP CONSTRAINT IF EXISTS "FK_room_layouts_room"`);
    await queryRunner.query(`ALTER TABLE "room_amenities" DROP CONSTRAINT IF EXISTS "FK_room_amenities_amenity"`);
    await queryRunner.query(`ALTER TABLE "room_amenities" DROP CONSTRAINT IF EXISTS "FK_room_amenities_room"`);
    await queryRunner.query(`ALTER TABLE "rooms" DROP CONSTRAINT IF EXISTS "FK_rooms_roomType"`);
    await queryRunner.query(`ALTER TABLE "rooms" DROP CONSTRAINT IF EXISTS "FK_rooms_building"`);
  }
}