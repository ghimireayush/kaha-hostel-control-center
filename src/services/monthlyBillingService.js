// Monthly Billing Service - Handles monthly pricing and prorated calculations
import { invoiceService } from './invoiceService.js';
import { ledgerService } from './ledgerService.js';
import { studentService } from './studentService.js';
import { roomService } from './roomService.js';

export const monthlyBillingService = {
  // Calculate prorated amount for partial month stays
  calculateProratedAmount(monthlyAmount, startDate, endDate = null) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getFullYear(), start.getMonth() + 1, 0);
    
    // Get total days in the month
    const totalDaysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    
    // Calculate days stayed
    const daysStayed = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate prorated amount
    const proratedAmount = Math.round((monthlyAmount * daysStayed) / totalDaysInMonth);
    
    return {
      totalDaysInMonth,
      daysStayed,
      proratedAmount,
      isProrated: daysStayed < totalDaysInMonth,
      dailyRate: Math.round(monthlyAmount / totalDaysInMonth)
    };
  },

  // Generate monthly bill for student
  async generateMonthlyBill(studentId, month, year) {
    try {
      const students = await studentService.getStudents();
      const student = students.find(s => s.id === studentId);
      
      if (!student) {
        throw new Error('Student not found');
      }

      const rooms = await roomService.getRooms();
      const room = rooms.find(r => r.roomNumber === student.roomNumber);
      
      if (!room) {
        throw new Error('Room not found');
      }

      // Calculate monthly charges
      const baseMonthlyFee = room.monthlyRate;
      const laundryFee = student.laundryFee || 1500;
      const foodFee = student.foodFee || 4500;
      const totalMonthlyAmount = baseMonthlyFee + laundryFee + foodFee;

      // Create invoice
      const invoiceData = {
        studentId: student.id,
        month: `${month} ${year}`,
        description: `Monthly charges for ${month} ${year}`,
        baseFee: baseMonthlyFee,
        laundryFee: laundryFee,
        foodFee: foodFee,
        total: totalMonthlyAmount,
        previousDue: student.currentBalance || 0,
        discount: 0,
        dueDate: new Date(year, month - 1, 10).toISOString().split('T')[0] // 10th of the month
      };

      const invoice = await invoiceService.createInvoice(invoiceData);

      // Add ledger entry
      await ledgerService.addLedgerEntry({
        studentId: student.id,
        type: 'Invoice',
        description: `Monthly bill - ${month} ${year}`,
        debit: totalMonthlyAmount,
        credit: 0,
        referenceId: invoice.id
      });

      console.log(`Monthly bill generated for ${student.name}: ₹${totalMonthlyAmount}`);
      return invoice;

    } catch (error) {
      console.error('Error generating monthly bill:', error);
      throw error;
    }
  },

  // Generate prorated bill for new student (mid-month enrollment)
  async generateProratedBill(studentId, enrollmentDate) {
    try {
      const students = await studentService.getStudents();
      const student = students.find(s => s.id === studentId);
      
      if (!student) {
        throw new Error('Student not found');
      }

      const rooms = await roomService.getRooms();
      const room = rooms.find(r => r.roomNumber === student.roomNumber);
      
      if (!room) {
        throw new Error('Room not found');
      }

      const enrollDate = new Date(enrollmentDate);
      const monthEnd = new Date(enrollDate.getFullYear(), enrollDate.getMonth() + 1, 0);

      // Calculate prorated amounts
      const baseFeeProration = this.calculateProratedAmount(room.monthlyRate, enrollmentDate);
      const laundryFeeProration = this.calculateProratedAmount(student.laundryFee || 1500, enrollmentDate);
      const foodFeeProration = this.calculateProratedAmount(student.foodFee || 4500, enrollmentDate);

      const totalProratedAmount = baseFeeProration.proratedAmount + 
                                 laundryFeeProration.proratedAmount + 
                                 foodFeeProration.proratedAmount;

      // Create prorated invoice
      const monthYear = enrollDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const description = `${monthYear} - Prorated (${baseFeeProration.daysStayed}/${baseFeeProration.totalDaysInMonth} days)`;

      const invoiceData = {
        studentId: student.id,
        month: monthYear,
        description: description,
        baseFee: baseFeeProration.proratedAmount,
        laundryFee: laundryFeeProration.proratedAmount,
        foodFee: foodFeeProration.proratedAmount,
        total: totalProratedAmount,
        isProrated: true,
        proratedDays: baseFeeProration.daysStayed,
        totalDays: baseFeeProration.totalDaysInMonth,
        previousDue: 0,
        discount: 0,
        dueDate: new Date(enrollDate.getFullYear(), enrollDate.getMonth() + 1, 10).toISOString().split('T')[0]
      };

      const invoice = await invoiceService.createInvoice(invoiceData);

      // Add ledger entry
      await ledgerService.addLedgerEntry({
        studentId: student.id,
        type: 'Invoice',
        description: `Prorated bill - ${description}`,
        debit: totalProratedAmount,
        credit: 0,
        referenceId: invoice.id
      });

      console.log(`Prorated bill generated for ${student.name}: ₹${totalProratedAmount} (${baseFeeProration.daysStayed} days)`);
      return invoice;

    } catch (error) {
      console.error('Error generating prorated bill:', error);
      throw error;
    }
  },

  // Calculate early checkout refund
  async calculateCheckoutRefund(studentId, checkoutDate) {
    try {
      const students = await studentService.getStudents();
      const student = students.find(s => s.id === studentId);
      
      if (!student) {
        throw new Error('Student not found');
      }

      const rooms = await roomService.getRooms();
      const room = rooms.find(r => r.roomNumber === student.roomNumber);
      
      if (!room) {
        throw new Error('Room not found');
      }

      const checkout = new Date(checkoutDate);
      const monthStart = new Date(checkout.getFullYear(), checkout.getMonth(), 1);
      const monthEnd = new Date(checkout.getFullYear(), checkout.getMonth() + 1, 0);

      // Calculate days used vs days in month
      const totalDaysInMonth = monthEnd.getDate();
      const daysUsed = checkout.getDate();
      const unusedDays = totalDaysInMonth - daysUsed;

      if (unusedDays <= 0) {
        return {
          refundAmount: 0,
          daysUsed: totalDaysInMonth,
          unusedDays: 0,
          message: 'No refund - full month used'
        };
      }

      // Calculate refund amounts
      const totalMonthlyAmount = room.monthlyRate + (student.laundryFee || 1500) + (student.foodFee || 4500);
      const dailyRate = totalMonthlyAmount / totalDaysInMonth;
      const refundAmount = Math.round(dailyRate * unusedDays);

      return {
        refundAmount,
        daysUsed,
        unusedDays,
        totalDaysInMonth,
        dailyRate: Math.round(dailyRate),
        totalMonthlyAmount,
        message: `Refund for ${unusedDays} unused days`
      };

    } catch (error) {
      console.error('Error calculating checkout refund:', error);
      throw error;
    }
  },

  // Generate bulk monthly bills for all active students
  async generateBulkMonthlyBills(month, year) {
    try {
      const students = await studentService.getStudents();
      const activeStudents = students.filter(s => s.status === 'Active');
      
      const results = [];
      
      for (const student of activeStudents) {
        try {
          const invoice = await this.generateMonthlyBill(student.id, month, year);
          results.push({
            studentId: student.id,
            studentName: student.name,
            success: true,
            invoiceId: invoice.id,
            amount: invoice.total
          });
        } catch (error) {
          results.push({
            studentId: student.id,
            studentName: student.name,
            success: false,
            error: error.message
          });
        }
      }

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      const totalAmount = successful.reduce((sum, r) => sum + r.amount, 0);

      console.log(`Bulk billing completed: ${successful.length} successful, ${failed.length} failed, Total: ₹${totalAmount}`);
      
      return {
        successful,
        failed,
        totalAmount,
        summary: {
          total: results.length,
          successful: successful.length,
          failed: failed.length
        }
      };

    } catch (error) {
      console.error('Error in bulk monthly billing:', error);
      throw error;
    }
  }
};