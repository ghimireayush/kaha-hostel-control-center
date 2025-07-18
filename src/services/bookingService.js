
import bookingRequestsData from '../data/bookingRequests.json';
import { studentService } from './studentService.js';
import { ledgerService } from './ledgerService.js';
import { invoiceService } from './invoiceService.js';
import { billingService } from './billingService.js';

let bookingRequests = [...bookingRequestsData];

export const bookingService = {
  // Get all booking requests
  async getBookingRequests() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...bookingRequests]), 100);
    });
  },

  // Get booking request by ID
  async getBookingRequestById(id) {
    return new Promise((resolve) => {
      const request = bookingRequests.find(r => r.id === id);
      setTimeout(() => resolve(request), 100);
    });
  },

  // Create new booking request
  async createBookingRequest(requestData) {
    return new Promise((resolve) => {
      const newRequest = {
        id: `BR${String(bookingRequests.length + 1).padStart(3, '0')}`,
        ...requestData,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'Pending'
      };
      bookingRequests.push(newRequest);
      setTimeout(() => resolve(newRequest), 100);
    });
  },

  // Approve booking and trigger student profile creation
  async approveBookingRequest(bookingId, roomAssignment) {
    return new Promise(async (resolve) => {
      const requestIndex = bookingRequests.findIndex(r => r.id === bookingId);
      if (requestIndex === -1) {
        setTimeout(() => resolve(null), 100);
        return;
      }

      const request = bookingRequests[requestIndex];
      
      // Update booking status
      bookingRequests[requestIndex] = {
        ...request,
        status: 'Approved',
        approvedDate: new Date().toISOString().split('T')[0],
        assignedRoom: roomAssignment
      };

      // Create student profile
      const studentData = {
        name: request.name,
        phone: request.phone,
        email: request.email,
        roomNumber: roomAssignment,
        guardianName: request.guardianName,
        guardianPhone: request.guardianPhone,
        address: request.address,
        emergencyContact: request.emergencyContact,
        idProofType: request.idProofType,
        idProofNumber: request.idProofNumber,
        course: request.course,
        institution: request.institution,
        baseMonthlyFee: this.calculateBaseFee(request.preferredRoom),
        laundryFee: 500,
        foodFee: 0,
        bookingRequestId: bookingId
      };

      try {
        // Create student profile
        const newStudent = await studentService.createStudent(studentData);
        
        // Create initial ledger entry for enrollment
        await ledgerService.addLedgerEntry({
          studentId: newStudent.id,
          type: 'Enrollment',
          description: 'Student enrollment - Welcome to hostel',
          debit: 0,
          credit: 0,
          referenceId: bookingId
        });

        // Generate prorated initial invoice using billing service
        const initialInvoice = await billingService.generateInitialInvoice(newStudent);
        
        // Update student balance with initial invoice amount
        await studentService.updateStudent(newStudent.id, {
          currentBalance: initialInvoice.total
        });

        console.log(`✅ Student approved and enrolled: ${newStudent.name}`);
        console.log(`📋 Initial invoice generated: ₨${initialInvoice.total.toLocaleString()} ${initialInvoice.isProrated ? '(Prorated)' : '(Full Month)'}`);
        console.log(`🏠 Room assigned: ${roomAssignment}`);

        setTimeout(() => resolve({
          booking: bookingRequests[requestIndex],
          student: newStudent
        }), 100);
      } catch (error) {
        console.error('Error in approval workflow:', error);
        setTimeout(() => resolve(null), 100);
      }
    });
  },

  // Update booking status
  async updateBookingStatus(id, status, notes = '') {
    return new Promise((resolve) => {
      const index = bookingRequests.findIndex(r => r.id === id);
      if (index !== -1) {
        bookingRequests[index].status = status;
        if (notes) bookingRequests[index].notes = notes;
        setTimeout(() => resolve(bookingRequests[index]), 100);
      } else {
        setTimeout(() => resolve(null), 100);
      }
    });
  },

  // Calculate base fee based on room type
  calculateBaseFee(roomType) {
    const feeMap = {
      'Single Room': 15000,
      'Shared Room': 12000,
      'Dormitory': 8000
    };
    return feeMap[roomType] || 10000;
  },

  // Get booking statistics
  async getBookingStats() {
    return new Promise((resolve) => {
      const stats = {
        total: bookingRequests.length,
        pending: bookingRequests.filter(r => r.status === 'Pending').length,
        approved: bookingRequests.filter(r => r.status === 'Approved').length,
        rejected: bookingRequests.filter(r => r.status === 'Rejected').length
      };
      setTimeout(() => resolve(stats), 100);
    });
  },

  // Filter requests by status
  async filterRequestsByStatus(status) {
    return new Promise((resolve) => {
      const filtered = status === 'all' 
        ? bookingRequests 
        : bookingRequests.filter(r => r.status.toLowerCase() === status.toLowerCase());
      setTimeout(() => resolve(filtered), 100);
    });
  }
};
