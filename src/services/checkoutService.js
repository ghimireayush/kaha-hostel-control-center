import { studentService } from './studentService.js';
import { ledgerService } from './ledgerService.js';
import { roomService } from './roomService.js';

export const checkoutService = {
  // Process student checkout
  async processCheckout(checkoutData) {
    return new Promise(async (resolve, reject) => {
      try {
        const { studentId, checkoutDate, reason, notes, duesCleared, hadOutstandingDues, outstandingAmount, hitLedger } = checkoutData;
        
        // Get student details
        const student = await studentService.getStudentById(studentId);
        if (!student) {
          throw new Error('Student not found');
        }

        // Update student status to 'Checked Out'
        await studentService.updateStudent(studentId, {
          status: 'Checked Out',
          checkoutDate: checkoutDate,
          checkoutReason: reason,
          checkoutNotes: notes,
          finalBalance: hadOutstandingDues ? outstandingAmount : 0
        });

        // Add ledger entry only if dues are cleared
        if (hitLedger && duesCleared) {
          await ledgerService.addLedgerEntry({
            studentId: studentId,
            type: 'Checkout',
            description: `Student checkout - ${reason}`,
            debit: hadOutstandingDues ? outstandingAmount : 0,
            credit: hadOutstandingDues ? outstandingAmount : 0,
            referenceId: `CHECKOUT-${studentId}-${Date.now()}`,
            notes: notes
          });
        }

        // Mark room as empty
        await roomService.vacateRoom(student.roomNumber, studentId);

        // Create checkout record
        const checkoutRecord = {
          id: `CO-${Date.now()}`,
          studentId: studentId,
          studentName: student.name,
          roomNumber: student.roomNumber,
          checkoutDate: checkoutDate,
          reason: reason,
          notes: notes,
          hadOutstandingDues: hadOutstandingDues,
          outstandingAmount: outstandingAmount,
          duesCleared: duesCleared,
          ledgerUpdated: hitLedger,
          processedBy: checkoutData.processedBy || 'Admin',
          processedAt: new Date().toISOString()
        };

        console.log('Checkout processed successfully:', checkoutRecord);
        
        setTimeout(() => resolve(checkoutRecord), 500);
      } catch (error) {
        console.error('Checkout processing error:', error);
        setTimeout(() => reject(error), 500);
      }
    });
  },

  // Get checkout history
  async getCheckoutHistory() {
    return new Promise((resolve) => {
      // In a real app, this would fetch from database
      const mockHistory = [
        {
          id: 'CO-1',
          studentName: 'John Doe',
          roomNumber: 'A-102',
          checkoutDate: '2024-01-10',
          reason: 'Course Completed',
          duesCleared: true
        }
      ];
      setTimeout(() => resolve(mockHistory), 100);
    });
  },

  // Get checkout statistics
  async getCheckoutStats() {
    return new Promise((resolve) => {
      const stats = {
        totalCheckouts: 5,
        thisMonth: 2,
        withDues: 1,
        cleared: 4
      };
      setTimeout(() => resolve(stats), 100);
    });
  }
};