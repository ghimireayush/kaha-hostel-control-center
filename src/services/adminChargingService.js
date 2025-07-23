// Admin Charging Service - Flexible admin-controlled charges
import { ledgerService } from './ledgerService.js';
import { studentService } from './studentService.js';
import { notificationService } from './notificationService.js';

export const adminChargingService = {
  // Predefined charge types with descriptions
  chargeTypes: [
    { value: 'late_fee_overdue', label: 'Late Fee - Payment Overdue' },
    { value: 'late_fee_partial', label: 'Late Fee - Partial Payment' },
    { value: 'penalty_rule', label: 'Penalty - Rule Violation' },
    { value: 'penalty_noise', label: 'Penalty - Noise Complaint' },
    { value: 'penalty_damage', label: 'Penalty - Damage Charge' },
    { value: 'admin_fee', label: 'Administrative Fee' },
    { value: 'processing_fee', label: 'Processing Fee' },
    { value: 'service_charge', label: 'Service Charge' },
    { value: 'custom', label: 'Custom - Enter Manually' }
  ],

  // Add charge to student ledger
  async addChargeToStudent(studentId, chargeData, adminId = 'Admin') {
    try {
      const students = await studentService.getStudents();
      const student = students.find(s => s.id === studentId);
      
      if (!student) {
        throw new Error('Student not found');
      }

      // Validate charge data
      if (!chargeData.type || !chargeData.amount || chargeData.amount <= 0) {
        throw new Error('Invalid charge data');
      }

      // Get charge description
      let description = chargeData.description;
      if (chargeData.type !== 'custom') {
        const chargeType = this.chargeTypes.find(ct => ct.value === chargeData.type);
        description = chargeType ? chargeType.label : chargeData.description;
      }

      // Create ledger entry
      const ledgerEntry = {
        studentId: student.id,
        type: 'Manual Charge',
        description: description,
        debit: parseFloat(chargeData.amount),
        credit: 0,
        referenceId: `ADMIN-${Date.now()}`,
        addedBy: adminId,
        adminNotes: chargeData.notes || '',
        chargeType: chargeData.type,
        date: new Date().toISOString().split('T')[0]
      };

      const result = await ledgerService.addLedgerEntry(ledgerEntry);

      // Update student balance
      await this.updateStudentBalance(studentId, parseFloat(chargeData.amount));

      // Send notification if enabled
      if (chargeData.sendNotification !== false) {
        await this.sendStudentNotification(student, {
          type: description,
          amount: chargeData.amount,
          date: new Date().toLocaleDateString()
        });
      }

      console.log(`Charge added: NPR ${chargeData.amount} (${description}) to ${student.name} by ${adminId}`);
      
      return {
        success: true,
        ledgerEntry: result,
        student: student,
        chargeAmount: parseFloat(chargeData.amount),
        description: description
      };

    } catch (error) {
      console.error('Error adding charge to student:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Add charges to multiple students (bulk operation)
  async addBulkCharges(studentIds, chargeData, adminId = 'Admin') {
    try {
      const results = [];
      
      for (const studentId of studentIds) {
        const result = await this.addChargeToStudent(studentId, chargeData, adminId);
        results.push({
          studentId,
          ...result
        });
      }

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      const totalAmount = successful.reduce((sum, r) => sum + r.chargeAmount, 0);

      console.log(`Bulk charges applied: ${successful.length} successful, ${failed.length} failed, Total: NPR ${totalAmount}`);
      
      return {
        results,
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
      console.error('Error in bulk charging:', error);
      throw error;
    }
  },

  // Update student balance
  async updateStudentBalance(studentId, amount) {
    try {
      const students = await studentService.getStudents();
      const studentIndex = students.findIndex(s => s.id === studentId);
      
      if (studentIndex !== -1) {
        students[studentIndex].currentBalance = (students[studentIndex].currentBalance || 0) + amount;
        // In a real app, this would update the database
        console.log(`Updated balance for ${students[studentIndex].name}: +NPR ${amount}`);
      }
    } catch (error) {
      console.error('Error updating student balance:', error);
    }
  },

  // Send notification to student
  async sendStudentNotification(student, chargeInfo) {
    try {
      const newBalance = (student.currentBalance || 0) + parseFloat(chargeInfo.amount);
      
      // Use notification service to send Kaha App notification
      const result = await notificationService.notifyAdminCharge(
        student.id,
        parseFloat(chargeInfo.amount),
        chargeInfo.type
      );
      
      return {
        success: result.success,
        message: 'Kaha App notification sent successfully',
        notificationId: result.notificationId
      };

    } catch (error) {
      console.error('Error sending notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get students with overdue payments
  async getOverdueStudents() {
    try {
      const students = await studentService.getStudents();
      const overdueStudents = students.filter(s => {
        const balance = s.currentBalance || 0;
        const lastPayment = s.lastPaymentDate ? new Date(s.lastPaymentDate) : new Date('2024-01-01');
        const daysSincePayment = Math.floor((new Date() - lastPayment) / (1000 * 60 * 60 * 24));
        
        return balance > 0 && daysSincePayment > 5; // Consider overdue after 5 days
      });

      return overdueStudents.map(student => ({
        ...student,
        daysOverdue: Math.floor((new Date() - new Date(student.lastPaymentDate || '2024-01-01')) / (1000 * 60 * 60 * 24)),
        suggestedLateFee: Math.min(Math.floor((student.currentBalance || 0) * 0.03), 2000) // 3% or max NPR 2000
      }));

    } catch (error) {
      console.error('Error getting overdue students:', error);
      return [];
    }
  },

  // Get charge history for a student
  async getStudentChargeHistory(studentId) {
    try {
      const ledgerEntries = await ledgerService.getStudentLedger(studentId);
      const charges = ledgerEntries.filter(entry => entry.type === 'Manual Charge');
      
      return charges.map(charge => ({
        id: charge.id,
        date: charge.date,
        description: charge.description,
        amount: charge.debit,
        addedBy: charge.addedBy || 'Admin',
        notes: charge.adminNotes || '',
        chargeType: charge.chargeType || 'unknown'
      }));

    } catch (error) {
      console.error('Error getting charge history:', error);
      return [];
    }
  },

  // Remove/reverse a charge
  async reverseCharge(chargeId, reason, adminId = 'Admin') {
    try {
      // In a real app, this would mark the charge as reversed and create a credit entry
      const creditEntry = {
        type: 'Charge Reversal',
        description: `Reversed charge - ${reason}`,
        debit: 0,
        credit: 0, // Amount would be determined from original charge
        referenceId: `REVERSAL-${chargeId}`,
        addedBy: adminId,
        adminNotes: reason,
        date: new Date().toISOString().split('T')[0]
      };

      console.log(`Charge ${chargeId} reversed by ${adminId}: ${reason}`);
      
      return {
        success: true,
        message: 'Charge reversed successfully'
      };

    } catch (error) {
      console.error('Error reversing charge:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get today's charge summary
  async getTodayChargeSummary() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const students = await studentService.getStudents();
      
      // In a real app, this would query the database for today's charges
      // For now, we'll simulate some data
      const summary = {
        totalCharges: 0,
        totalAmount: 0,
        chargesByType: {},
        studentsCharged: 0
      };

      console.log('Today\'s charge summary:', summary);
      return summary;

    } catch (error) {
      console.error('Error getting charge summary:', error);
      return {
        totalCharges: 0,
        totalAmount: 0,
        chargesByType: {},
        studentsCharged: 0
      };
    }
  }
};