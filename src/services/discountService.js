import discountsData from '../data/discounts.json';
import { ledgerService } from './ledgerService.js';
import { studentService } from './studentService.js';
import { notificationService } from './notificationService.js';

export const discountService = {
  // Get all discounts
  async getDiscounts() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(discountsData), 100);
    });
  },

  // Get discount history
  async getDiscountHistory() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(discountsData), 100);
    });
  },

  // Get discount by ID
  async getDiscountById(id) {
    return new Promise((resolve) => {
      const discount = discountsData.find(d => d.id === id);
      setTimeout(() => resolve(discount), 100);
    });
  },

  // Apply discount directly to ledger with proper reason
  async applyDiscount(discountData) {
    return new Promise(async (resolve, reject) => {
      try {
        const { studentId, amount, reason, notes, appliedBy } = discountData;

        // Get student details
        const student = await studentService.getStudentById(studentId);
        if (!student) {
          throw new Error('Student not found');
        }

        // Check if student already has this discount type
        const existingDiscount = discountsData.find(d =>
          d.studentId === studentId &&
          d.reason === reason &&
          d.status === 'active'
        );

        if (existingDiscount) {
          throw new Error('This discount has already been applied to this student');
        }

        // Create new discount record
        const newDiscount = {
          id: `DISC-${Date.now()}`,
          studentId,
          studentName: student.name,
          room: student.roomNumber,
          amount,
          reason,
          notes,
          appliedBy,
          date: new Date().toISOString().split('T')[0],
          status: 'active'
        };

        // Add to discount history
        discountsData.push(newDiscount);

        // Create ledger entry for discount with proper reason
        await ledgerService.addLedgerEntry({
          studentId,
          type: 'Discount',
          description: `Discount Applied: ${reason}`,
          debit: 0,
          credit: amount, // Credit reduces the amount owed
          referenceId: newDiscount.id,
          reason: `Discount given by ${appliedBy} - ${reason}${notes ? ` (${notes})` : ''}`,
          notes,
          appliedBy
        });

        // Update student balance
        const currentBalance = student.currentBalance || 0;
        await studentService.updateStudent(studentId, {
          currentBalance: Math.max(0, currentBalance - amount)
        });

        // Send notification via Kaha App
        await notificationService.notifyDiscountApplied(
          studentId,
          amount,
          reason
        );

        console.log(`💰 Discount Applied & Ledger Updated: NPR ${amount} to ${student.name} - Reason: ${reason}`);

        setTimeout(() => resolve({
          success: true,
          discount: newDiscount,
          studentName: student.name,
          ledgerUpdated: true
        }), 500);
      } catch (error) {
        console.error('Error applying discount:', error);
        setTimeout(() => reject({
          success: false,
          error: error.message
        }), 500);
      }
    });
  },

  // Update discount
  async updateDiscount(id, updateData) {
    return new Promise((resolve) => {
      const index = discountsData.findIndex(d => d.id === id);
      if (index !== -1) {
        discountsData[index] = { ...discountsData[index], ...updateData };
        setTimeout(() => resolve(discountsData[index]), 100);
      } else {
        setTimeout(() => resolve(null), 100);
      }
    });
  },

  // Expire discount
  async expireDiscount(id) {
    return new Promise((resolve) => {
      const index = discountsData.findIndex(d => d.id === id);
      if (index !== -1) {
        discountsData[index].status = 'expired';
        setTimeout(() => resolve(discountsData[index]), 100);
      } else {
        setTimeout(() => resolve(null), 100);
      }
    });
  },

  // Get discount statistics
  async getDiscountStats() {
    return new Promise((resolve) => {
      const activeDiscounts = discountsData.filter(d => d.status === 'active');
      const stats = {
        totalDiscounts: discountsData.length,
        activeDiscounts: activeDiscounts.length,
        totalDiscountAmount: activeDiscounts.reduce((sum, d) => sum + d.amount, 0),
        averageDiscount: activeDiscounts.length > 0 ?
          Math.round(activeDiscounts.reduce((sum, d) => sum + d.amount, 0) / activeDiscounts.length) : 0
      };
      setTimeout(() => resolve(stats), 100);
    });
  }
};