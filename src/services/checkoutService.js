import { studentService } from './studentService.js';
import { ledgerService } from './ledgerService.js';
import { monthlyInvoiceService } from './monthlyInvoiceService.js';

export const checkoutService = {
  // Get active students for checkout
  async getActiveStudentsForCheckout() {
    return new Promise(async (resolve, reject) => {
      try {
        const students = await studentService.getStudents();
        const activeStudents = students.filter(student => 
          student.status === 'active' && !student.isCheckedOut
        );
        setTimeout(() => resolve(activeStudents), 100);
      } catch (error) {
        setTimeout(() => reject(error), 100);
      }
    });
  },

  // Book payment during checkout
  async bookCheckoutPayment(studentId, amount, remark = "Paid on Checkout") {
    return new Promise(async (resolve, reject) => {
      try {
        // Add payment to ledger with proper reason
        await ledgerService.addLedgerEntry({
          studentId,
          type: 'Payment',
          description: `Payment received during checkout`,
          debit: 0,
          credit: amount,
          referenceId: `CHECKOUT-PAY-${studentId}-${Date.now()}`,
          reason: `Payment received during checkout process - ${remark}`,
          notes: remark,
          paymentContext: 'checkout'
        });
        
        // Update student payment records
        const student = await studentService.getStudentById(studentId);
        if (student) {
          await studentService.updateStudent(studentId, {
            totalPaid: student.totalPaid + amount,
            currentBalance: Math.max(0, student.currentBalance - amount),
            lastPaymentDate: new Date().toISOString().split('T')[0]
          });
        }
        
        console.log(`💰 Checkout Payment Booked: NPR ${amount} for ${student?.name} - ${remark}`);
        
        setTimeout(() => resolve({ success: true, amount, remark }), 100);
      } catch (error) {
        setTimeout(() => reject(error), 100);
      }
    });
  },

  // Calculate prorated amount for checkout month
  calculateCheckoutProration(student, checkoutDate) {
    const checkoutDateObj = new Date(checkoutDate);
    const year = checkoutDateObj.getFullYear();
    const month = checkoutDateObj.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Days stayed in the month (up to checkout date)
    const daysStayed = checkoutDateObj.getDate();
    const monthlyFee = (student.baseMonthlyFee || 0) + (student.laundryFee || 0) + (student.foodFee || 0);
    const dailyRate = monthlyFee / daysInMonth;
    const proratedAmount = Math.round(dailyRate * daysStayed * 100) / 100;
    
    return {
      amount: proratedAmount,
      dailyRate: Math.round(dailyRate * 100) / 100,
      daysStayed: daysStayed,
      daysInMonth: daysInMonth,
      monthlyFee: monthlyFee,
      period: `${new Date(year, month, 1).toLocaleDateString()} to ${checkoutDateObj.toLocaleDateString()}`
    };
  },

  // Process student checkout with proper invoice and ledger integration
  async processCheckout(checkoutData) {
    return new Promise(async (resolve, reject) => {
      try {
        const { studentId, checkoutDate, reason, notes, duesCleared, hadOutstandingDues, outstandingAmount, hitLedger } = checkoutData;
        
        // Get student details
        const student = await studentService.getStudentById(studentId);
        if (!student) {
          throw new Error('Student not found');
        }

        // Calculate prorated amount for checkout month
        const proratedCalc = this.calculateCheckoutProration(student, checkoutDate);
        
        // Generate checkout invoice using the monthly invoice service
        const checkoutInvoice = await monthlyInvoiceService.generateCheckoutInvoice(
          studentId,
          checkoutDate,
          proratedCalc.monthlyFee,
          [
            {
              description: 'Final month prorated charges',
              amount: proratedCalc.amount,
              type: 'prorated_checkout'
            }
          ]
        );

        // Stop future invoices by updating student status
        const statusUpdate = hadOutstandingDues && !duesCleared ? 'Checked out with dues' : 'Checked Out';
        await studentService.updateStudent(studentId, {
          status: statusUpdate,
          isCheckedOut: true,
          checkoutDate: checkoutDate,
          checkoutReason: reason,
          checkoutNotes: notes,
          finalBalance: hadOutstandingDues ? outstandingAmount : 0,
          invoicesStopped: true, // Stop future invoice generation
          lastInvoiceDate: checkoutDate
        });

        // Add checkout invoice to ledger (this creates the prorated charge)
        await ledgerService.addLedgerEntry({
          studentId: studentId,
          studentName: student.name,
          type: 'Checkout Invoice',
          description: `Final prorated invoice - ${proratedCalc.period}`,
          debit: proratedCalc.amount,
          credit: 0,
          referenceId: checkoutInvoice.referenceId,
          reason: `Final prorated billing for checkout on ${new Date(checkoutDate).toLocaleDateString()} - ${proratedCalc.daysStayed} days at NPR ${proratedCalc.dailyRate}/day`,
          invoiceData: checkoutInvoice,
          date: checkoutDate
        });

        // Add checkout completion entry to ledger
        if (hitLedger) {
          await ledgerService.addLedgerEntry({
            studentId: studentId,
            studentName: student.name,
            type: 'Checkout',
            description: `Student checkout completed - ${reason}`,
            debit: 0,
            credit: 0,
            referenceId: `CHECKOUT-${studentId}-${Date.now()}`,
            reason: `Student checkout processed - ${reason}. Invoice generation stopped from ${checkoutDate}`,
            notes: notes,
            checkoutData: {
              checkoutDate,
              reason,
              hadOutstandingDues,
              outstandingAmount,
              duesCleared,
              proratedAmount: proratedCalc.amount,
              invoiceId: checkoutInvoice.referenceId
            }
          });
        }

        // If student has outstanding dues, add them to the outstanding dues list
        if (hadOutstandingDues && !duesCleared) {
          const totalOutstanding = outstandingAmount + proratedCalc.amount;
          
          // Add to checked out with dues list
          const checkedOutWithDues = JSON.parse(localStorage.getItem('checkedOutWithDues') || '[]');
          const existingIndex = checkedOutWithDues.findIndex(s => s.studentId === studentId);
          
          const duesRecord = {
            studentId: studentId,
            studentName: student.name,
            roomNumber: student.roomNumber,
            checkoutDate: checkoutDate,
            outstandingDues: totalOutstanding,
            phone: student.phone,
            email: student.email,
            checkoutReason: reason,
            lastUpdated: new Date().toISOString(),
            status: 'pending_payment',
            proratedAmount: proratedCalc.amount,
            previousDues: outstandingAmount
          };
          
          if (existingIndex >= 0) {
            checkedOutWithDues[existingIndex] = duesRecord;
          } else {
            checkedOutWithDues.push(duesRecord);
          }
          
          localStorage.setItem('checkedOutWithDues', JSON.stringify(checkedOutWithDues));
        }

        // Mark room as empty
        if (typeof roomService !== 'undefined' && roomService.vacateRoom) {
          await roomService.vacateRoom(student.roomNumber, studentId);
        }

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
          proratedAmount: proratedCalc.amount,
          totalDues: hadOutstandingDues ? outstandingAmount + proratedCalc.amount : proratedCalc.amount,
          duesCleared: duesCleared,
          ledgerUpdated: hitLedger,
          invoiceGenerated: true,
          invoiceId: checkoutInvoice.referenceId,
          invoicesStopped: true,
          processedBy: checkoutData.processedBy || 'Admin',
          processedAt: new Date().toISOString()
        };

        console.log('✅ Checkout processed successfully:', {
          student: student.name,
          checkoutDate: checkoutDate,
          proratedAmount: proratedCalc.amount,
          invoiceId: checkoutInvoice.referenceId,
          invoicesStopped: true
        });
        
        setTimeout(() => resolve(checkoutRecord), 500);
      } catch (error) {
        console.error('❌ Checkout processing error:', error);
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