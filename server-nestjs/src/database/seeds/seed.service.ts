import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

// Import all entities
import { Student } from "../../students/entities/student.entity";
import {
  StudentContact,
  ContactType,
} from "../../students/entities/student-contact.entity";
import { StudentAcademicInfo } from "../../students/entities/student-academic-info.entity";
import {
  StudentFinancialInfo,
  FeeType,
} from "../../students/entities/student-financial-info.entity";

import {
  Room,
  RoomStatus,
  MaintenanceStatus,
  Gender,
} from "../../rooms/entities/room.entity";
import { Building, BuildingStatus } from "../../rooms/entities/building.entity";
import { RoomType, PricingModel } from "../../rooms/entities/room-type.entity";
import { Amenity, AmenityCategory } from "../../rooms/entities/amenity.entity";
import { RoomAmenity } from "../../rooms/entities/room-amenity.entity";
import { RoomLayout } from "../../rooms/entities/room-layout.entity";
import { RoomOccupant } from "../../rooms/entities/room-occupant.entity";

import { Invoice, InvoiceStatus } from "../../invoices/entities/invoice.entity";
import {
  InvoiceItem,
  InvoiceItemCategory,
} from "../../invoices/entities/invoice-item.entity";

import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from "../../payments/entities/payment.entity";
import { PaymentInvoiceAllocation } from "../../payments/entities/payment-invoice-allocation.entity";

import {
  LedgerEntry,
  LedgerEntryType,
  BalanceType,
} from "../../ledger/entities/ledger-entry.entity";

import {
  Discount,
  DiscountStatus,
  DiscountApplication,
} from "../../discounts/entities/discount.entity";
import {
  DiscountType,
  DiscountCategory,
} from "../../discounts/entities/discount-type.entity";

import {
  BookingRequest,
  BookingStatus,
} from "../../bookings/entities/booking-request.entity";

import { Report } from "../../reports/entities/report.entity";

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    // Student repositories
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(StudentContact)
    private studentContactRepository: Repository<StudentContact>,
    @InjectRepository(StudentAcademicInfo)
    private studentAcademicRepository: Repository<StudentAcademicInfo>,
    @InjectRepository(StudentFinancialInfo)
    private studentFinancialRepository: Repository<StudentFinancialInfo>,

    // Room repositories
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
    @InjectRepository(RoomType)
    private roomTypeRepository: Repository<RoomType>,
    @InjectRepository(Amenity)
    private amenityRepository: Repository<Amenity>,
    @InjectRepository(RoomAmenity)
    private roomAmenityRepository: Repository<RoomAmenity>,
    @InjectRepository(RoomLayout)
    private roomLayoutRepository: Repository<RoomLayout>,
    @InjectRepository(RoomOccupant)
    private roomOccupantRepository: Repository<RoomOccupant>,

    // Financial repositories
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentInvoiceAllocation)
    private paymentAllocationRepository: Repository<PaymentInvoiceAllocation>,
    @InjectRepository(LedgerEntry)
    private ledgerRepository: Repository<LedgerEntry>,

    // Discount repositories
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
    @InjectRepository(DiscountType)
    private discountTypeRepository: Repository<DiscountType>,

    // Booking repository
    @InjectRepository(BookingRequest)
    private bookingRepository: Repository<BookingRequest>,

    // Report repository
    @InjectRepository(Report)
    private reportRepository: Repository<Report>
  ) {}

  async checkSeedStatus() {
    const status = {
      buildings: await this.buildingRepository.count(),
      roomTypes: await this.roomTypeRepository.count(),
      amenities: await this.amenityRepository.count(),
      rooms: await this.roomRepository.count(),
      roomOccupants: await this.roomOccupantRepository.count(),
      students: await this.studentRepository.count(),
      studentContacts: await this.studentContactRepository.count(),
      studentAcademic: await this.studentAcademicRepository.count(),
      studentFinancial: await this.studentFinancialRepository.count(),
      discountTypes: await this.discountTypeRepository.count(),
      discounts: await this.discountRepository.count(),
      invoices: await this.invoiceRepository.count(),
      invoiceItems: await this.invoiceItemRepository.count(),
      payments: await this.paymentRepository.count(),
      paymentAllocations: await this.paymentAllocationRepository.count(),
      ledgerEntries: await this.ledgerRepository.count(),
      bookings: await this.bookingRepository.count(),
      reports: await this.reportRepository.count(),
      lastSeeded: new Date().toISOString(),
    };

    this.logger.log("Seed status checked", status);
    return status;
  }

  async seedAll(force = false) {
    this.logger.log("Starting complete database seeding...");

    try {
      // If force is true, clear all data first in proper order
      if (force) {
        await this.clearAllData();
      }

      // Seed in proper dependency order (without force to avoid individual deletions)
      const results = {
        // 1. Independent entities first
        buildings: await this.seedBuildings(false),
        roomTypes: await this.seedRoomTypes(false),
        amenities: await this.seedAmenities(false),

        // 2. Rooms depend on buildings, room types, and amenities
        rooms: await this.seedRooms(false),

        // 3. Students depend on rooms
        students: await this.seedStudents(false),

        // 4. Room occupants depend on students and rooms
        roomOccupants: await this.seedRoomOccupants(false),

        // 5. Discount types before discounts
        discountTypes: await this.seedDiscountTypes(false),

        // 6. Financial entities
        invoices: await this.seedInvoices(false),
        payments: await this.seedPayments(false),
        paymentAllocations: await this.seedPaymentAllocations(false),

        // 7. Discounts depend on students and discount types
        discounts: await this.seedDiscounts(false),

        // 8. Ledger entries depend on all financial entities
        ledgerEntries: await this.seedLedgerEntries(false),

        // 9. Bookings are independent
        bookings: await this.seedBookings(false),
      };

      this.logger.log("Complete database seeding finished", results);
      return results;
    } catch (error) {
      this.logger.error("Error during complete seeding:", error);
      throw error;
    }
  }

  async seedBuildings(force = false) {
    if (!force && (await this.buildingRepository.count()) > 0) {
      return {
        message: "Buildings already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    const buildings = [
      {
        id: "BLD001",
        name: "Main Building",
        address: "123 Hostel Street, City",
        totalFloors: 4,
        totalRooms: 50,
        status: BuildingStatus.ACTIVE,
        description: "Main hostel building with modern facilities",
        facilities: ["WiFi", "Elevator", "Security", "Parking"],
        contactInfo: {
          phone: "+1234567890",
          email: "main@hostel.com",
        },
        isActive: true,
      },
      {
        id: "BLD002",
        name: "Annex Building",
        address: "456 Hostel Avenue, City",
        totalFloors: 3,
        totalRooms: 30,
        status: BuildingStatus.ACTIVE,
        description: "Secondary building for additional accommodation",
        facilities: ["WiFi", "Security", "Common Room"],
        contactInfo: {
          phone: "+1234567891",
          email: "annex@hostel.com",
        },
        isActive: true,
      },
    ];

    if (force) {
      await this.buildingRepository.createQueryBuilder().delete().execute();
    }

    const savedBuildings = await this.buildingRepository.save(buildings);
    this.logger.log(`Seeded ${savedBuildings.length} buildings`);

    return { count: savedBuildings.length, data: savedBuildings };
  }

  async seedRoomTypes(force = false) {
    if (!force && (await this.roomTypeRepository.count()) > 0) {
      return {
        message: "Room types already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    const roomTypes = [
      {
        id: "RT001",
        name: "Single AC",
        description: "Single occupancy room with air conditioning",
        defaultBedCount: 1,
        maxOccupancy: 1,
        baseMonthlyRate: 8000,
        baseDailyRate: 267,
        pricingModel: PricingModel.MONTHLY,
        features: ["AC", "WiFi", "Study Table", "Wardrobe"],
        isActive: true,
      },
      {
        id: "RT002",
        name: "Double AC",
        description: "Double occupancy room with air conditioning",
        defaultBedCount: 2,
        maxOccupancy: 2,
        baseMonthlyRate: 6000,
        baseDailyRate: 200,
        pricingModel: PricingModel.MONTHLY,
        features: ["AC", "WiFi", "Study Tables", "Wardrobes"],
        isActive: true,
      },
      {
        id: "RT003",
        name: "Triple Non-AC",
        description: "Triple occupancy room without air conditioning",
        defaultBedCount: 3,
        maxOccupancy: 3,
        baseMonthlyRate: 4000,
        baseDailyRate: 133,
        pricingModel: PricingModel.MONTHLY,
        features: ["WiFi", "Study Tables", "Wardrobes", "Fan"],
        isActive: true,
      },
    ];

    if (force) {
      await this.roomTypeRepository.createQueryBuilder().delete().execute();
    }

    const savedRoomTypes = await this.roomTypeRepository.save(roomTypes);
    this.logger.log(`Seeded ${savedRoomTypes.length} room types`);

    return { count: savedRoomTypes.length, data: savedRoomTypes };
  }

  async seedAmenities(force = false) {
    if (!force && (await this.amenityRepository.count()) > 0) {
      return {
        message: "Amenities already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    const amenities = [
      {
        name: "Air Conditioning",
        category: AmenityCategory.UTILITIES,
        description: "Split AC unit for room cooling",
        maintenanceRequired: true,
        isActive: true,
      },
      {
        name: "WiFi",
        category: AmenityCategory.UTILITIES,
        description: "High-speed internet connection",
        maintenanceRequired: false,
        isActive: true,
      },
      {
        name: "Study Table",
        category: AmenityCategory.FURNITURE,
        description: "Wooden study table with drawers",
        maintenanceRequired: false,
        isActive: true,
      },
      {
        name: "Wardrobe",
        category: AmenityCategory.FURNITURE,
        description: "3-door wooden wardrobe",
        maintenanceRequired: false,
        isActive: true,
      },
      {
        name: "Ceiling Fan",
        category: AmenityCategory.UTILITIES,
        description: "High-speed ceiling fan",
        maintenanceRequired: true,
        isActive: true,
      },
    ];

    if (force) {
      await this.amenityRepository.createQueryBuilder().delete().execute();
    }

    const savedAmenities = await this.amenityRepository.save(amenities);
    this.logger.log(`Seeded ${savedAmenities.length} amenities`);

    return { count: savedAmenities.length, data: savedAmenities };
  }

  async seedRooms(force = false) {
    if (!force && (await this.roomRepository.count()) > 0) {
      return {
        message: "Rooms already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    // Ensure dependencies exist
    await this.seedBuildings(force);
    await this.seedRoomTypes(force);
    await this.seedAmenities(force);

    // Get amenities by name to get their UUIDs
    const acAmenity = await this.amenityRepository.findOne({
      where: { name: "Air Conditioning" },
    });
    const wifiAmenity = await this.amenityRepository.findOne({
      where: { name: "WiFi" },
    });
    const tableAmenity = await this.amenityRepository.findOne({
      where: { name: "Study Table" },
    });
    const wardrobeAmenity = await this.amenityRepository.findOne({
      where: { name: "Wardrobe" },
    });
    const fanAmenity = await this.amenityRepository.findOne({
      where: { name: "Ceiling Fan" },
    });

    const rooms = [];
    const roomAmenities = [];
    const roomLayouts = [];

    // Generate rooms for Main Building
    for (let floor = 1; floor <= 4; floor++) {
      for (let roomNum = 1; roomNum <= 12; roomNum++) {
        const roomNumber = `${floor}${roomNum.toString().padStart(2, "0")}`;
        const roomId = `ROOM${roomNumber}`;

        // Determine room type based on room number
        let roomTypeId, capacity, rent;
        if (roomNum <= 4) {
          roomTypeId = "RT001"; // Single AC
          capacity = 1;
          rent = 8000;
        } else if (roomNum <= 8) {
          roomTypeId = "RT002"; // Double AC
          capacity = 2;
          rent = 6000;
        } else {
          roomTypeId = "RT003"; // Triple Non-AC
          capacity = 3;
          rent = 4000;
        }

        rooms.push({
          id: roomId,
          name: `Room ${roomNumber}`,
          roomNumber: roomNumber,
          buildingId: "BLD001",
          roomTypeId: roomTypeId,
          floor: floor,
          capacity: capacity,
          bedCount: capacity,
          occupancy: 0,
          rent: rent,
          status: RoomStatus.ACTIVE,
          maintenanceStatus: MaintenanceStatus.GOOD,
          gender: floor <= 2 ? Gender.MALE : Gender.FEMALE,
          description: `Room ${roomNumber} on floor ${floor}`,
          notes: `${capacity}-bed room on floor ${floor}`,
        });

        // Add room layout
        roomLayouts.push({
          roomId: roomId,
          name: `Layout for Room ${roomNumber}`,
          layoutData: {
            roomSize: { width: 12, height: 10 },
            bedPositions:
              capacity === 1
                ? [{ x: 2, y: 2 }]
                : capacity === 2
                  ? [
                      { x: 2, y: 2 },
                      { x: 8, y: 2 },
                    ]
                  : [
                      { x: 2, y: 2 },
                      { x: 8, y: 2 },
                      { x: 2, y: 6 },
                    ],
          },
          dimensions: { length: 12, width: 10, height: 9 },
          isActive: true,
          createdBy: "seeder",
        });

        // Add amenities based on room type using actual UUIDs
        if (roomTypeId === "RT001" || roomTypeId === "RT002") {
          // AC rooms
          if (acAmenity)
            roomAmenities.push({
              roomId: roomId,
              amenityId: acAmenity.id,
              isActive: true,
            });
          if (wifiAmenity)
            roomAmenities.push({
              roomId: roomId,
              amenityId: wifiAmenity.id,
              isActive: true,
            });
          if (tableAmenity)
            roomAmenities.push({
              roomId: roomId,
              amenityId: tableAmenity.id,
              isActive: true,
            });
          if (wardrobeAmenity)
            roomAmenities.push({
              roomId: roomId,
              amenityId: wardrobeAmenity.id,
              isActive: true,
            });
        } else {
          // Non-AC rooms
          if (wifiAmenity)
            roomAmenities.push({
              roomId: roomId,
              amenityId: wifiAmenity.id,
              isActive: true,
            });
          if (tableAmenity)
            roomAmenities.push({
              roomId: roomId,
              amenityId: tableAmenity.id,
              isActive: true,
            });
          if (wardrobeAmenity)
            roomAmenities.push({
              roomId: roomId,
              amenityId: wardrobeAmenity.id,
              isActive: true,
            });
          if (fanAmenity)
            roomAmenities.push({
              roomId: roomId,
              amenityId: fanAmenity.id,
              isActive: true,
            });
        }
      }
    }

    if (force) {
      // Delete in proper order to handle foreign key constraints
      await this.roomLayoutRepository.createQueryBuilder().delete().execute();
      await this.roomAmenityRepository.createQueryBuilder().delete().execute();
      await this.roomRepository.createQueryBuilder().delete().execute();
      // Don't delete buildings and room types here as they might be needed by other entities
    }

    const savedRooms = await this.roomRepository.save(rooms);
    const savedAmenities = await this.roomAmenityRepository.save(roomAmenities);
    const savedLayouts = await this.roomLayoutRepository.save(roomLayouts);

    this.logger.log(
      `Seeded ${savedRooms.length} rooms with amenities and layouts`
    );

    return {
      count: savedRooms.length,
      data: {
        rooms: savedRooms.length,
        amenities: savedAmenities.length,
        layouts: savedLayouts.length,
      },
    };
  }

  async seedStudents(force = false) {
    if (!force && (await this.studentRepository.count()) > 0) {
      return {
        message: "Students already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    // Ensure rooms exist (don't force dependencies)
    await this.seedRooms(false);

    const students = [
      {
        id: "STU001",
        name: "John Doe",
        phone: "9876543210",
        email: "john.doe@email.com",
        address: "123 Student Street, City",
        roomId: "ROOM101",
        enrollmentDate: new Date("2024-01-15"),
        status: "Active" as any,
        emergencyContact: "9876543211",
        guardianName: "Robert Doe",
        guardianPhone: "9876543211",
        idProofType: "Aadhar",
        idProofNumber: "123456789012",
        dateOfBirth: new Date("2002-05-15"),
        bloodGroup: "O+",
        isActive: true,
      },
      {
        id: "STU002",
        name: "Jane Smith",
        phone: "9876543220",
        email: "jane.smith@email.com",
        address: "456 Student Avenue, City",
        roomId: "ROOM301",
        enrollmentDate: new Date("2024-01-20"),
        status: "Active" as any,
        emergencyContact: "9876543221",
        guardianName: "Mary Smith",
        guardianPhone: "9876543221",
        idProofType: "Passport",
        idProofNumber: "P1234567",
        dateOfBirth: new Date("2001-08-22"),
        bloodGroup: "A+",
        isActive: true,
      },
      {
        id: "STU003",
        name: "Mike Johnson",
        phone: "9876543230",
        email: "mike.johnson@email.com",
        address: "789 Student Road, City",
        roomId: "ROOM205",
        enrollmentDate: new Date("2024-02-01"),
        status: "Active" as any,
        emergencyContact: "9876543231",
        guardianName: "David Johnson",
        guardianPhone: "9876543231",
        idProofType: "Aadhar",
        idProofNumber: "123456789013",
        dateOfBirth: new Date("2003-03-10"),
        bloodGroup: "B+",
        isActive: true,
      },
    ];

    if (force) {
      await this.studentFinancialRepository
        .createQueryBuilder()
        .delete()
        .execute();
      await this.studentAcademicRepository
        .createQueryBuilder()
        .delete()
        .execute();
      await this.studentContactRepository
        .createQueryBuilder()
        .delete()
        .execute();
      await this.studentRepository.createQueryBuilder().delete().execute();
    }

    const savedStudents = await this.studentRepository.save(students);

    // Add contacts
    const contacts = [];
    savedStudents.forEach((student) => {
      contacts.push(
        {
          studentId: student.id,
          type: ContactType.EMERGENCY,
          name: student.guardianName,
          phone: student.guardianPhone,
          relationship: "Guardian",
          isActive: true,
        },
        {
          studentId: student.id,
          type: ContactType.GUARDIAN,
          name: student.name,
          phone: student.phone,
          email: student.email,
          relationship: "Self",
          isActive: true,
        }
      );
    });
    await this.studentContactRepository.save(contacts);

    // Add academic info
    const academicInfo = [
      {
        studentId: "STU001",
        course: "Computer Science",
        institution: "Tech University",
        academicYear: "2023-2024",
        semester: "4th",
        studentIdNumber: "CS2022001",
        isActive: true,
      },
      {
        studentId: "STU002",
        course: "Business Administration",
        institution: "Business College",
        academicYear: "2021-2024",
        semester: "6th",
        studentIdNumber: "BA2021002",
        isActive: true,
      },
      {
        studentId: "STU003",
        course: "Mechanical Engineering",
        institution: "Engineering College",
        academicYear: "2023-2027",
        semester: "2nd",
        studentIdNumber: "ME2023003",
        isActive: true,
      },
    ];
    await this.studentAcademicRepository.save(academicInfo);

    // Add financial info
    const financialInfo = [
      {
        studentId: "STU001",
        feeType: FeeType.BASE_MONTHLY,
        amount: 8000,
        effectiveFrom: new Date("2024-07-01"),
        isActive: true,
      },
      {
        studentId: "STU002",
        feeType: FeeType.BASE_MONTHLY,
        amount: 6000,
        effectiveFrom: new Date("2024-07-01"),
        isActive: true,
      },
      {
        studentId: "STU003",
        feeType: FeeType.BASE_MONTHLY,
        amount: 6000,
        effectiveFrom: new Date("2024-07-01"),
        isActive: true,
      },
    ];
    await this.studentFinancialRepository.save(financialInfo);

    this.logger.log(
      `Seeded ${savedStudents.length} students with contacts, academic, and financial info`
    );

    return {
      count: savedStudents.length,
      data: {
        students: savedStudents.length,
        contacts: contacts.length,
        academic: academicInfo.length,
        financial: financialInfo.length,
      },
    };
  }

  async seedInvoices(force = false) {
    if (!force && (await this.invoiceRepository.count()) > 0) {
      return {
        message: "Invoices already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    // Ensure students exist
    await this.seedStudents(force);

    const invoices = [
      {
        id: "INV001",
        studentId: "STU001",
        month: "July 2024",
        issueDate: new Date("2024-07-01"),
        dueDate: new Date("2024-07-31"),
        total: 8500,
        paidAmount: 8500,
        status: InvoiceStatus.PAID,
        notes: "Monthly rent and utilities",
        createdBy: "admin",
      },
      {
        id: "INV002",
        studentId: "STU002",
        month: "July 2024",
        issueDate: new Date("2024-07-01"),
        dueDate: new Date("2024-07-31"),
        total: 6200,
        paidAmount: 6200,
        status: InvoiceStatus.PAID,
        notes: "Monthly rent and utilities",
        createdBy: "admin",
      },
      {
        id: "INV003",
        studentId: "STU003",
        month: "July 2024",
        issueDate: new Date("2024-07-01"),
        dueDate: new Date("2024-07-31"),
        total: 6200,
        paidAmount: 3000,
        status: InvoiceStatus.PARTIALLY_PAID,
        notes: "Monthly rent and utilities",
        createdBy: "admin",
      },
    ];

    if (force) {
      await this.invoiceItemRepository.createQueryBuilder().delete().execute();
      await this.invoiceRepository.createQueryBuilder().delete().execute();
    }

    const savedInvoices = await this.invoiceRepository.save(invoices);

    // Add invoice items
    const invoiceItems = [
      // Invoice 1 items
      {
        id: "ITEM001",
        invoiceId: "INV001",
        description: "Room Rent - Single AC",
        quantity: 1,
        unitPrice: 8000,
        amount: 8000,
        category: InvoiceItemCategory.ACCOMMODATION,
      },
      {
        id: "ITEM002",
        invoiceId: "INV001",
        description: "Electricity Charges",
        quantity: 1,
        unitPrice: 500,
        amount: 500,
        category: InvoiceItemCategory.UTILITIES,
      },
      // Invoice 2 items
      {
        id: "ITEM003",
        invoiceId: "INV002",
        description: "Room Rent - Double AC",
        quantity: 1,
        unitPrice: 6000,
        amount: 6000,
        category: InvoiceItemCategory.ACCOMMODATION,
      },
      {
        id: "ITEM004",
        invoiceId: "INV002",
        description: "Maintenance Fee",
        quantity: 1,
        unitPrice: 200,
        amount: 200,
        category: InvoiceItemCategory.SERVICES,
      },
      // Invoice 3 items
      {
        id: "ITEM005",
        invoiceId: "INV003",
        description: "Room Rent - Double AC",
        quantity: 1,
        unitPrice: 6000,
        amount: 6000,
        category: InvoiceItemCategory.ACCOMMODATION,
      },
      {
        id: "ITEM006",
        invoiceId: "INV003",
        description: "Maintenance Fee",
        quantity: 1,
        unitPrice: 200,
        amount: 200,
        category: InvoiceItemCategory.SERVICES,
      },
    ];

    const savedItems = await this.invoiceItemRepository.save(invoiceItems);

    this.logger.log(
      `Seeded ${savedInvoices.length} invoices with ${savedItems.length} items`
    );

    return {
      count: savedInvoices.length,
      data: {
        invoices: savedInvoices.length,
        items: savedItems.length,
      },
    };
  }

  async seedPayments(force = false) {
    if (!force && (await this.paymentRepository.count()) > 0) {
      return {
        message: "Payments already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    // Ensure invoices exist
    await this.seedInvoices(force);

    const payments = [
      {
        id: "PAY001",
        studentId: "STU001",
        amount: 8500,
        paymentDate: new Date("2024-07-05"),
        paymentMethod: PaymentMethod.UPI,
        transactionId: "UPI123456789",
        referenceNumber: "REF001",
        status: PaymentStatus.COMPLETED,
        notes: "Payment for July 2024",
        processedBy: "admin",
      },
      {
        id: "PAY002",
        studentId: "STU002",
        amount: 6200,
        paymentDate: new Date("2024-07-03"),
        paymentMethod: PaymentMethod.CASH,
        transactionId: null,
        referenceNumber: "CASH001",
        status: PaymentStatus.COMPLETED,
        notes: "Cash payment for July 2024",
        processedBy: "admin",
      },
      {
        id: "PAY003",
        studentId: "STU003",
        amount: 3000,
        paymentDate: new Date("2024-07-10"),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        transactionId: "TXN987654321",
        referenceNumber: "NEFT001",
        status: PaymentStatus.COMPLETED,
        notes: "Partial payment for July 2024",
        processedBy: "admin",
        bankName: "State Bank",
      },
    ];

    if (force) {
      await this.paymentRepository.createQueryBuilder().delete().execute();
    }

    const savedPayments = await this.paymentRepository.save(payments);

    this.logger.log(`Seeded ${savedPayments.length} payments`);

    return { count: savedPayments.length, data: savedPayments };
  }

  async seedDiscounts(force = false) {
    if (!force && (await this.discountRepository.count()) > 0) {
      return {
        message: "Discounts already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    // Ensure students and discount types exist
    await this.seedStudents(false);
    await this.seedDiscountTypes(false);

    // Then seed actual discounts
    const discounts = [
      {
        id: "DSC001",
        studentId: "STU001",
        discountTypeId: "DT001",
        amount: 200,
        reason: "Early payment for July 2024",
        notes: "Paid 5 days before due date",
        appliedBy: "admin",
        date: new Date("2024-07-05"),
        status: DiscountStatus.ACTIVE,
        appliedTo: DiscountApplication.LEDGER,
        validFrom: new Date("2024-07-01"),
        validTo: new Date("2024-07-31"),
        isPercentage: false,
        percentageValue: null,
        maxAmount: null,
        referenceId: "INV001",
      },
      {
        id: "DSC002",
        studentId: "STU003",
        discountTypeId: "DT002",
        amount: 600,
        reason: "Financial hardship assistance",
        notes: "Approved by management for financial difficulties",
        appliedBy: "manager",
        date: new Date("2024-07-01"),
        status: DiscountStatus.ACTIVE,
        appliedTo: DiscountApplication.LEDGER,
        validFrom: new Date("2024-07-01"),
        validTo: new Date("2024-12-31"),
        isPercentage: true,
        percentageValue: 10,
        maxAmount: 1000,
        referenceId: "INV003",
      },
    ];

    if (force) {
      await this.discountRepository.createQueryBuilder().delete().execute();
    }

    const savedDiscounts = await this.discountRepository.save(discounts);

    this.logger.log(`Seeded ${savedDiscounts.length} discounts`);

    return {
      count: savedDiscounts.length,
      data: savedDiscounts,
    };
  }

  async seedRoomOccupants(force = false) {
    if (!force && (await this.roomOccupantRepository.count()) > 0) {
      return {
        message: "Room occupants already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    // Ensure students exist
    await this.seedStudents(false);

    const roomOccupants = [
      {
        roomId: "ROOM101",
        studentId: "STU001",
        checkInDate: new Date("2024-01-15"),
        bedNumber: "1",
        status: "Active",
        notes: "Primary occupant",
        assignedBy: "admin",
      },
      {
        roomId: "ROOM301",
        studentId: "STU002",
        checkInDate: new Date("2024-01-20"),
        bedNumber: "1",
        status: "Active",
        notes: "Primary occupant",
        assignedBy: "admin",
      },
      {
        roomId: "ROOM205",
        studentId: "STU003",
        checkInDate: new Date("2024-02-01"),
        bedNumber: "1",
        status: "Active",
        notes: "Primary occupant",
        assignedBy: "admin",
      },
    ];

    if (force) {
      await this.roomOccupantRepository.createQueryBuilder().delete().execute();
    }

    const savedOccupants =
      await this.roomOccupantRepository.save(roomOccupants);

    // Update room occupancy counts
    await this.roomRepository.update("ROOM101", { occupancy: 1 });
    await this.roomRepository.update("ROOM301", { occupancy: 1 });
    await this.roomRepository.update("ROOM205", { occupancy: 1 });

    this.logger.log(`Seeded ${savedOccupants.length} room occupants`);

    return { count: savedOccupants.length, data: savedOccupants };
  }

  async seedDiscountTypes(force = false) {
    if (!force && (await this.discountTypeRepository.count()) > 0) {
      return {
        message: "Discount types already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    const discountTypes = [
      {
        name: "Early Payment Discount",
        category: DiscountCategory.PROMOTIONAL,
        description: "Discount for payments made before due date",
        defaultAmount: 200,
        isPercentage: false,
        percentageValue: null,
        maxAmount: 500,
        requiresApproval: false,
        autoApply: false,
        isActive: true,
      },
      {
        name: "Student Hardship",
        category: DiscountCategory.FINANCIAL_HARDSHIP,
        description: "Financial assistance for students in need",
        defaultAmount: null,
        isPercentage: true,
        percentageValue: 10,
        maxAmount: 1000,
        requiresApproval: true,
        autoApply: false,
        isActive: true,
      },
      {
        name: "Sibling Discount",
        category: DiscountCategory.PROMOTIONAL,
        description: "Discount for students with siblings in the hostel",
        defaultAmount: null,
        isPercentage: true,
        percentageValue: 5,
        maxAmount: 300,
        requiresApproval: false,
        autoApply: true,
        isActive: true,
      },
    ];

    if (force) {
      await this.discountTypeRepository.createQueryBuilder().delete().execute();
    }

    const savedDiscountTypes =
      await this.discountTypeRepository.save(discountTypes);

    this.logger.log(`Seeded ${savedDiscountTypes.length} discount types`);

    return { count: savedDiscountTypes.length, data: savedDiscountTypes };
  }

  async seedPaymentAllocations(force = false) {
    if (!force && (await this.paymentAllocationRepository.count()) > 0) {
      return {
        message: "Payment allocations already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    // Ensure payments and invoices exist
    await this.seedPayments(false);
    await this.seedInvoices(false);

    const paymentAllocations = [
      {
        paymentId: "PAY001",
        invoiceId: "INV001",
        amount: 8500,
        allocationDate: new Date("2024-07-05"),
        notes: "Full payment allocation for July 2024",
        isActive: true,
      },
      {
        paymentId: "PAY002",
        invoiceId: "INV002",
        amount: 6200,
        allocationDate: new Date("2024-07-03"),
        notes: "Full payment allocation for July 2024",
        isActive: true,
      },
      {
        paymentId: "PAY003",
        invoiceId: "INV003",
        amount: 3000,
        allocationDate: new Date("2024-07-10"),
        notes: "Partial payment allocation for July 2024",
        isActive: true,
      },
    ];

    if (force) {
      await this.paymentAllocationRepository
        .createQueryBuilder()
        .delete()
        .execute();
    }

    const savedAllocations =
      await this.paymentAllocationRepository.save(paymentAllocations);

    this.logger.log(`Seeded ${savedAllocations.length} payment allocations`);

    return { count: savedAllocations.length, data: savedAllocations };
  }

  async seedLedgerEntries(force = false) {
    if (!force && (await this.ledgerRepository.count()) > 0) {
      return {
        message: "Ledger entries already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    // Ensure all financial entities exist
    await this.seedInvoices(false);
    await this.seedPayments(false);
    await this.seedDiscounts(false);

    const ledgerEntries = [
      // Student 1 - John Doe ledger entries
      {
        id: "LED001",
        studentId: "STU001",
        type: LedgerEntryType.INVOICE,
        date: new Date("2024-07-01"),
        description: "Monthly rent and utilities - July 2024",
        referenceId: "INV001",
        debit: 8500,
        credit: 0,
        balance: 8500,
        balanceType: BalanceType.DR,
        notes: "Invoice generated for July 2024",
      },
      {
        id: "LED002",
        studentId: "STU001",
        type: LedgerEntryType.PAYMENT,
        date: new Date("2024-07-05"),
        description: "Payment received - July 2024",
        referenceId: "PAY001",
        debit: 0,
        credit: 8500,
        balance: 0,
        balanceType: BalanceType.NIL,
        notes: "Full payment received",
      },
      {
        id: "LED003",
        studentId: "STU001",
        type: LedgerEntryType.DISCOUNT,
        date: new Date("2024-07-05"),
        description: "Early payment discount",
        referenceId: "DSC001",
        debit: 0,
        credit: 200,
        balance: -200,
        balanceType: BalanceType.CR,
        notes: "Early payment discount applied",
      },

      // Student 2 - Jane Smith ledger entries
      {
        id: "LED004",
        studentId: "STU002",
        type: LedgerEntryType.INVOICE,
        date: new Date("2024-07-01"),
        description: "Monthly rent and utilities - July 2024",
        referenceId: "INV002",
        debit: 6200,
        credit: 0,
        balance: 6200,
        balanceType: BalanceType.DR,
        notes: "Invoice generated for July 2024",
      },
      {
        id: "LED005",
        studentId: "STU002",
        type: LedgerEntryType.PAYMENT,
        date: new Date("2024-07-03"),
        description: "Payment received - July 2024",
        referenceId: "PAY002",
        debit: 0,
        credit: 6200,
        balance: 0,
        balanceType: BalanceType.NIL,
        notes: "Full payment received",
      },

      // Student 3 - Mike Johnson ledger entries
      {
        id: "LED006",
        studentId: "STU003",
        type: LedgerEntryType.INVOICE,
        date: new Date("2024-07-01"),
        description: "Monthly rent and utilities - July 2024",
        referenceId: "INV003",
        debit: 6200,
        credit: 0,
        balance: 6200,
        balanceType: BalanceType.DR,
        notes: "Invoice generated for July 2024",
      },
      {
        id: "LED007",
        studentId: "STU003",
        type: LedgerEntryType.PAYMENT,
        date: new Date("2024-07-10"),
        description: "Partial payment received - July 2024",
        referenceId: "PAY003",
        debit: 0,
        credit: 3000,
        balance: 3200,
        balanceType: BalanceType.DR,
        notes: "Partial payment received",
      },
      {
        id: "LED008",
        studentId: "STU003",
        type: LedgerEntryType.DISCOUNT,
        date: new Date("2024-07-01"),
        description: "Financial hardship assistance",
        referenceId: "DSC002",
        debit: 0,
        credit: 600,
        balance: 2600,
        balanceType: BalanceType.DR,
        notes: "Financial hardship discount applied",
      },
    ];

    if (force) {
      await this.ledgerRepository.createQueryBuilder().delete().execute();
    }

    const savedEntries = await this.ledgerRepository.save(ledgerEntries);

    this.logger.log(`Seeded ${savedEntries.length} ledger entries`);

    return { count: savedEntries.length, data: savedEntries };
  }

  async seedBookings(force = false) {
    if (!force && (await this.bookingRepository.count()) > 0) {
      return {
        message: "Booking requests already exist, use ?force=true to reseed",
        count: 0,
      };
    }

    const bookings = [
      {
        id: "BKG001",
        name: "Alice Brown",
        phone: "9876543240",
        email: "alice.brown@email.com",
        guardianName: "Tom Brown",
        guardianPhone: "9876543241",
        preferredRoom: "Single AC",
        course: "Computer Science",
        institution: "Tech University",
        requestDate: new Date("2024-07-15"),
        checkInDate: new Date("2024-08-01"),
        duration: "12 months",
        status: BookingStatus.PENDING,
        notes: "Prefers ground floor room",
        emergencyContact: "9876543241",
        address: "321 Applicant Street, City",
        idProofType: "Aadhar",
        idProofNumber: "123456789014",
        priorityScore: 85,
        source: "website",
      },
      {
        id: "BKG002",
        name: "Bob Wilson",
        phone: "9876543250",
        email: "bob.wilson@email.com",
        guardianName: "Sarah Wilson",
        guardianPhone: "9876543251",
        preferredRoom: "Double AC",
        course: "Mechanical Engineering",
        institution: "Engineering College",
        requestDate: new Date("2024-07-20"),
        checkInDate: new Date("2024-08-15"),
        duration: "10 months",
        status: BookingStatus.APPROVED,
        notes: "Approved for room 102",
        emergencyContact: "9876543251",
        address: "654 Applicant Avenue, City",
        idProofType: "Passport",
        idProofNumber: "P2345678",
        priorityScore: 92,
        source: "referral",
        approvedDate: new Date("2024-07-22"),
        processedBy: "admin",
        assignedRoom: "102",
      },
    ];

    if (force) {
      await this.bookingRepository.createQueryBuilder().delete().execute();
    }

    const savedBookings = await this.bookingRepository.save(bookings);

    this.logger.log(`Seeded ${savedBookings.length} booking requests`);

    return { count: savedBookings.length, data: savedBookings };
  }

  async seedCustomData(seedData: any) {
    this.logger.log("Seeding custom data", seedData);

    const results = {};

    for (const [entityType, data] of Object.entries(seedData)) {
      try {
        switch (entityType) {
          case "students":
            results[entityType] = await this.studentRepository.save(data);
            break;
          case "rooms":
            results[entityType] = await this.roomRepository.save(data);
            break;
          case "invoices":
            results[entityType] = await this.invoiceRepository.save(data);
            break;
          case "payments":
            results[entityType] = await this.paymentRepository.save(data);
            break;
          // Add more cases as needed
          default:
            this.logger.warn(`Unknown entity type: ${entityType}`);
        }
      } catch (error) {
        this.logger.error(`Failed to seed ${entityType}:`, error);
        results[entityType] = { error: error.message };
      }
    }

    return results;
  }

  async clearAllData() {
    this.logger.log("Clearing all seeded data...");

    // Clear in proper order to handle foreign key constraints
    const results: any = {};

    try {
      // Clear child tables first (most dependent entities first)
      results.reports = await this.reportRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.bookings = await this.bookingRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.ledgerEntries = await this.ledgerRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.discounts = await this.discountRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.paymentAllocations = await this.paymentAllocationRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.payments = await this.paymentRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.invoiceItems = await this.invoiceItemRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.invoices = await this.invoiceRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.roomOccupants = await this.roomOccupantRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.studentFinancial = await this.studentFinancialRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.studentAcademic = await this.studentAcademicRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.studentContacts = await this.studentContactRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.students = await this.studentRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.roomLayouts = await this.roomLayoutRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.roomAmenities = await this.roomAmenityRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.rooms = await this.roomRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.discountTypes = await this.discountTypeRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.amenities = await this.amenityRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.roomTypes = await this.roomTypeRepository
        .createQueryBuilder()
        .delete()
        .execute();
      results.buildings = await this.buildingRepository
        .createQueryBuilder()
        .delete()
        .execute();
    } catch (error) {
      this.logger.error("Error clearing data:", error);
      throw error;
    }

    this.logger.log("All data cleared successfully");
    return results;
  }

  async clearEntityData(entityType: string) {
    this.logger.log(`Clearing ${entityType} data...`);

    let result;
    switch (entityType.toLowerCase()) {
      case "students":
        result = await this.studentRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "rooms":
        result = await this.roomRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "room-occupants":
        result = await this.roomOccupantRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "buildings":
        result = await this.buildingRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "room-types":
        result = await this.roomTypeRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "amenities":
        result = await this.amenityRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "invoices":
        result = await this.invoiceRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "payments":
        result = await this.paymentRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "payment-allocations":
        result = await this.paymentAllocationRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "ledger-entries":
        result = await this.ledgerRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "discounts":
        result = await this.discountRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "discount-types":
        result = await this.discountTypeRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "bookings":
        result = await this.bookingRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      case "reports":
        result = await this.reportRepository
          .createQueryBuilder()
          .delete()
          .execute();
        break;
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }

    this.logger.log(`${entityType} data cleared successfully`);
    return result;
  }
}
