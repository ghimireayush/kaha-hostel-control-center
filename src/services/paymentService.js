
import paymentsData from '../data/payments.json';
import { studentService } from './studentService.js';
import { ledgerService } from './ledgerService.js';
import { notificationService } from './notificationService.js';

let payments = [...paymentsData];

export const paymentService = {
  // Get all payments
  async getPayments() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...payments]), 100);
    });
  },

  // Get payment by ID
  async getPaymentById(id) {
    return new Promise((resolve) => {
      const payment = payments.find(p => p.id === id);
      setTimeout(() => resolve(payment), 100);
    });
  },

  // Get payments by student ID
  async getPaymentsByStudentId(studentId) {
    return new Promise((resolve) => {
      const studentPayments = payments.filter(p => p.studentId === studentId);
      setTimeout(() => resolve(studentPayments), 100);
    });
  },

  // Record new payment
  async recordPayment(paymentData) {
    return new Promise(async (resolve) => {
      try {
        const newPayment = {
          id: `PAY${String(payments.length + 1).padStart(3, '0')}`,
          ...paymentData,
          paymentDate: new Date().toISOString().split('T')[0],
          receivedBy: 'Admin'
        };
        
        payments.push(newPayment);

        // Get student details for notification
        const student = await studentService.getStudentById(paymentData.studentId);
        if (student) {
          // Calculate remaining balance after payment
          const remainingBalance = Math.max(0, (student.currentBalance || 0) - paymentData.amount);
          
          // Send payment confirmation via Kaha App
          await notificationService.notifyPaymentReceived(
            paymentData.studentId,
            paymentData.amount,
            remainingBalance
          );

          // Create ledger entry for payment
          await ledgerService.addLedgerEntry({
            studentId: paymentData.studentId,
            type: 'Payment',
            description: `Payment received - ${paymentData.paymentMode}`,
            debit: 0,
            credit: paymentData.amount,
            referenceId: newPayment.id,
            notes: paymentData.notes || ''
          });

          // Update student balance
          await studentService.updateStudent(paymentData.studentId, {
            currentBalance: remainingBalance
          });
        }

        setTimeout(() => resolve(newPayment), 100);
      } catch (error) {
        console.error('Error recording payment:', error);
        setTimeout(() => resolve(newPayment), 100);
      }
    });
  },

  // Get payment statistics
  async getPaymentStats() {
    return new Promise((resolve) => {
      const today = new Date();
      const thisMonth = payments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate.getMonth() === today.getMonth() && 
               paymentDate.getFullYear() === today.getFullYear();
      });

      const stats = {
        totalCollected: payments.reduce((sum, p) => sum + p.amount, 0),
        monthlyCollection: thisMonth.reduce((sum, p) => sum + p.amount, 0),
        paymentCount: payments.length,
        monthlyPaymentCount: thisMonth.length,
        paymentModes: this.getPaymentModeStats()
      };
      setTimeout(() => resolve(stats), 100);
    });
  },

  // Get payment mode statistics
  getPaymentModeStats() {
    const modes = {};
    payments.forEach(p => {
      modes[p.paymentMode] = (modes[p.paymentMode] || 0) + 1;
    });
    return modes;
  },

  // Get recent payments
  async getRecentPayments(limit = 10) {
    return new Promise((resolve) => {
      const recent = payments
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
        .slice(0, limit);
      setTimeout(() => resolve(recent), 100);
    });
  }
};
