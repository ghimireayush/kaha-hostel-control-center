// Payment Service - Handle payment booking and processing
import { ledgerService } from './ledgerService.js';
import { studentService } from './studentService.js';

export const paymentService = {
  
  // Book payment for outstanding dues
  async bookOutstandingDuesPayment(studentId, amount, paymentMethod = 'Cash', notes = '') {
    try {
      console.log(`💰 Booking payment for student ${studentId}: NPR ${amount}`);
      
      // Get student details
      const student = await studentService.getStudentById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Generate payment reference ID
      const paymentRef = `PAY-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-6)}`;
      
      // Add payment entry to ledger
      await ledgerService.addLedgerEntry({
        studentId: studentId,
        studentName: student.name,
        type: 'Payment',
        description: `Outstanding dues payment - ${paymentMethod}`,
        debit: 0,
        credit: amount,
        referenceId: paymentRef,
        reason: `Outstanding dues payment received via ${paymentMethod}${notes ? ' - ' + notes : ''}`,
        paymentMethod: paymentMethod,
        notes: notes,
        date: new Date().toISOString().split('T')[0]
      });

      // Update student payment records
      await studentService.updateStudent(studentId, {
        totalPaid: (student.totalPaid || 0) + amount,
        lastPaymentDate: new Date().toISOString().split('T')[0],
        currentBalance: Math.max(0, (student.currentBalance || 0) - amount)
      });

      // Remove from checked out with dues list if payment clears all dues
      const checkedOutWithDues = JSON.parse(localStorage.getItem('checkedOutWithDues') || '[]');
      const studentDuesIndex = checkedOutWithDues.findIndex(s => s.studentId === studentId);
      
      if (studentDuesIndex >= 0) {
        const studentDues = checkedOutWithDues[studentDuesIndex];
        const remainingDues = studentDues.outstandingDues - amount;
        
        if (remainingDues <= 0) {
          // Remove student from outstanding dues list
          checkedOutWithDues.splice(studentDuesIndex, 1);
          console.log(`✅ Student ${student.name} removed from outstanding dues list - all dues cleared`);
        } else {
          // Update remaining dues
          checkedOutWithDues[studentDuesIndex].outstandingDues = remainingDues;
          checkedOutWithDues[studentDuesIndex].lastUpdated = new Date().toISOString();
          console.log(`📝 Updated outstanding dues for ${student.name}: NPR ${remainingDues} remaining`);
        }
        
        localStorage.setItem('checkedOutWithDues', JSON.stringify(checkedOutWithDues));
      }

      const paymentRecord = {
        id: paymentRef,
        studentId: studentId,
        studentName: student.name,
        amount: amount,
        paymentMethod: paymentMethod,
        notes: notes,
        date: new Date().toISOString(),
        processedBy: 'Admin',
        type: 'outstanding_dues_payment'
      };

      console.log(`✅ Payment booked successfully:`, paymentRecord);
      
      return {
        success: true,
        payment: paymentRecord,
        message: `Payment of NPR ${amount.toLocaleString()} booked successfully for ${student.name}`
      };

    } catch (error) {
      console.error('❌ Payment booking error:', error);
      throw error;
    }
  },

  // Book regular payment (for active students)
  async bookRegularPayment(studentId, amount, paymentMethod = 'Cash', invoiceId = null, notes = '') {
    try {
      console.log(`💰 Booking regular payment for student ${studentId}: NPR ${amount}`);
      
      // Get student details
      const student = await studentService.getStudentById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Generate payment reference ID
      const paymentRef = `PAY-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-6)}`;
      
      // Add payment entry to ledger
      await ledgerService.addLedgerEntry({
        studentId: studentId,
        studentName: student.name,
        type: 'Payment',
        description: `Payment received - ${paymentMethod}${invoiceId ? ` (Invoice: ${invoiceId})` : ''}`,
        debit: 0,
        credit: amount,
        referenceId: paymentRef,
        reason: `Payment received via ${paymentMethod}${invoiceId ? ` for invoice ${invoiceId}` : ''}${notes ? ' - ' + notes : ''}`,
        paymentMethod: paymentMethod,
        invoiceId: invoiceId,
        notes: notes,
        date: new Date().toISOString().split('T')[0]
      });

      // Update student payment records
      await studentService.updateStudent(studentId, {
        totalPaid: (student.totalPaid || 0) + amount,
        lastPaymentDate: new Date().toISOString().split('T')[0],
        currentBalance: Math.max(0, (student.currentBalance || 0) - amount)
      });

      const paymentRecord = {
        id: paymentRef,
        studentId: studentId,
        studentName: student.name,
        amount: amount,
        paymentMethod: paymentMethod,
        invoiceId: invoiceId,
        notes: notes,
        date: new Date().toISOString(),
        processedBy: 'Admin',
        type: 'regular_payment'
      };

      console.log(`✅ Regular payment booked successfully:`, paymentRecord);
      
      return {
        success: true,
        payment: paymentRecord,
        message: `Payment of NPR ${amount.toLocaleString()} booked successfully for ${student.name}`
      };

    } catch (error) {
      console.error('❌ Regular payment booking error:', error);
      throw error;
    }
  },

  // Get payment history for a student
  async getPaymentHistory(studentId) {
    try {
      const ledgerEntries = await ledgerService.getLedgerByStudentId(studentId);
      const payments = ledgerEntries.filter(entry => entry.type === 'Payment');
      
      return payments.map(payment => ({
        id: payment.referenceId,
        date: payment.date,
        amount: payment.credit,
        method: payment.paymentMethod || 'Not specified',
        description: payment.description,
        notes: payment.notes || '',
        processedBy: 'Admin'
      }));
      
    } catch (error) {
      console.error('❌ Error getting payment history:', error);
      return [];
    }
  },

  // Get payment statistics
  async getPaymentStats() {
    try {
      const ledgerEntries = await ledgerService.getLedgerEntries();
      const payments = ledgerEntries.filter(entry => entry.type === 'Payment');
      
      const today = new Date();
      const thisMonth = payments.filter(p => {
        const paymentDate = new Date(p.date);
        return paymentDate.getMonth() === today.getMonth() && 
               paymentDate.getFullYear() === today.getFullYear();
      });
      
      return {
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + (p.credit || 0), 0),
        thisMonthPayments: thisMonth.length,
        thisMonthAmount: thisMonth.reduce((sum, p) => sum + (p.credit || 0), 0),
        averagePayment: payments.length > 0 ? 
          Math.round(payments.reduce((sum, p) => sum + (p.credit || 0), 0) / payments.length) : 0
      };
      
    } catch (error) {
      console.error('❌ Error getting payment stats:', error);
      return {
        totalPayments: 0,
        totalAmount: 0,
        thisMonthPayments: 0,
        thisMonthAmount: 0,
        averagePayment: 0
      };
    }
  }
};