import { invoiceService } from './invoiceService.js';
import { ledgerService } from './ledgerService.js';
import { studentService } from './studentService.js';
import { notificationService } from './notificationService.js';

export const billingService = {
  // Calculate prorated amount for partial month (enrollment or checkout)
  calculateProratedAmount(monthlyAmount, startDate, endDate = null) {
    const start = new Date(startDate);
    const year = start.getFullYear();
    const month = start.getMonth();
    
    // Get total days in the month
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    
    let daysToCalculate;
    let calculationType;
    
    if (endDate) {
      // Checkout scenario - calculate days used
      const end = new Date(endDate);
      const startDay = start.getDate();
      const endDay = end.getDate();
      
      if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
        // Same month checkout
        daysToCalculate = endDay - startDay + 1;
        calculationType = 'checkout_same_month';
      } else {
        // Different month - calculate remaining days in start month
        daysToCalculate = totalDaysInMonth - startDay + 1;
        calculationType = 'checkout_different_month';
      }
    } else {
      // Enrollment scenario - calculate remaining days in month
      daysToCalculate = totalDaysInMonth - start.getDate() + 1;
      calculationType = 'enrollment';
    }
    
    // Calculate prorated amount
    const proratedAmount = Math.round((monthlyAmount * daysToCalculate) / totalDaysInMonth);
    
    return {
      totalDaysInMonth,
      daysToCalculate,
      proratedAmount,
      isProrated: daysToCalculate < totalDaysInMonth,
      calculationType,
      dailyRate: Math.round(monthlyAmount / totalDaysInMonth)
    };
  },

  // Calculate checkout refund for unused days in current month
  calculateCheckoutRefund(student, checkoutDate) {
    const checkout = new Date(checkoutDate);
    const currentMonth = checkout.getMonth();
    const currentYear = checkout.getFullYear();
    
    // Get student's monthly charges
    const monthlyCharges = student.chargeConfiguration?.filter(c => 
      c.isActive && c.type === 'monthly'
    ) || [];
    
    const totalMonthlyAmount = monthlyCharges.reduce((sum, charge) => sum + charge.amount, 0);
    
    // Calculate days remaining in month after checkout
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const checkoutDay = checkout.getDate();
    const remainingDays = totalDaysInMonth - checkoutDay;
    
    // Calculate refund amount for unused days
    const refundAmount = remainingDays > 0 ? 
      Math.round((totalMonthlyAmount * remainingDays) / totalDaysInMonth) : 0;
    
    return {
      totalDaysInMonth,
      checkoutDay,
      remainingDays,
      refundAmount,
      dailyRate: Math.round(totalMonthlyAmount / totalDaysInMonth),
      hasRefund: refundAmount > 0
    };
  },

  // Generate initial invoice for new student (prorated if mid-month)
  async generateInitialInvoice(student) {
    try {
      const enrollmentDate = student.enrollmentDate;
      const enrollDate = new Date(enrollmentDate);
      
      // Calculate total monthly fee
      const totalMonthlyFee = student.baseMonthlyFee + student.laundryFee + student.foodFee;
      
      // Calculate prorated amounts
      const baseFeeProration = this.calculateProratedAmount(student.baseMonthlyFee, enrollmentDate);
      const laundryFeeProration = this.calculateProratedAmount(student.laundryFee, enrollmentDate);
      const foodFeeProration = this.calculateProratedAmount(student.foodFee, enrollmentDate);
      
      const totalProratedAmount = baseFeeProration.proratedAmount + 
                                 laundryFeeProration.proratedAmount + 
                                 foodFeeProration.proratedAmount;
      
      // Create invoice description
      const monthYear = enrollDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const description = baseFeeProration.isProrated 
        ? `${monthYear} - Prorated (${baseFeeProration.remainingDays}/${baseFeeProration.totalDaysInMonth} days)`
        : `${monthYear} - Full Month`;
      
      // Generate invoice
      const invoiceData = {
        studentId: student.id,
        month: monthYear,
        description: description,
        baseFee: baseFeeProration.proratedAmount,
        laundryFee: laundryFeeProration.proratedAmount,
        foodFee: foodFeeProration.proratedAmount,
        total: totalProratedAmount,
        isProrated: baseFeeProration.isProrated,
        proratedDays: baseFeeProration.remainingDays,
        totalDays: baseFeeProration.totalDaysInMonth,
        previousDue: 0,
        discount: 0,
        dueDate: new Date(enrollDate.getFullYear(), enrollDate.getMonth() + 1, 10).toISOString().split('T')[0] // 10th of next month
      };
      
      const invoice = await invoiceService.createInvoice(invoiceData);
      
      // Add ledger entry
      await ledgerService.addLedgerEntry({
        studentId: student.id,
        type: 'Invoice',
        description: `Initial invoice - ${description}`,
        debit: totalProratedAmount,
        credit: 0,
        referenceId: invoice.id
      });

      // Send invoice notification via Kaha App
      await notificationService.notifyNewInvoice(
        student.id,
        description,
        totalProratedAmount
      );
      
      console.log(`Initial invoice generated for ${student.name}:`, {
        amount: totalProratedAmount,
        isProrated: baseFeeProration.isProrated,
        days: `${baseFeeProration.remainingDays}/${baseFeeProration.totalDaysInMonth}`
      });
      
      return invoice;
    } catch (error) {
      console.error('Error generating initial invoice:', error);
      throw error;
    }
  },

  // Generate monthly invoices for all active students (called on 1st of every month)
  async generateMonthlyInvoices(targetDate = new Date()) {
    try {
      const students = await studentService.getStudents();
      const activeStudents = students.filter(s => s.status === 'Active');
      
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const monthYear = targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      const generatedInvoices = [];
      
      for (const student of activeStudents) {
        // Check if invoice already exists for this month
        const existingInvoices = await invoiceService.getInvoicesByStudentId(student.id);
        const monthlyInvoiceExists = existingInvoices.some(inv => 
          inv.month === monthYear && !inv.isProrated
        );
        
        if (monthlyInvoiceExists) {
          console.log(`Invoice already exists for ${student.name} for ${monthYear}`);
          continue;
        }
        
        // Calculate total monthly fee
        const totalMonthlyFee = student.baseMonthlyFee + student.laundryFee + student.foodFee;
        
        // Get previous outstanding balance
        const previousDue = student.currentBalance || 0;
        
        // Create invoice
        const invoiceData = {
          studentId: student.id,
          month: monthYear,
          description: `${monthYear} - Monthly Charges`,
          baseFee: student.baseMonthlyFee,
          laundryFee: student.laundryFee,
          foodFee: student.foodFee,
          total: totalMonthlyFee + previousDue,
          previousDue: previousDue,
          discount: 0,
          isProrated: false,
          dueDate: new Date(year, month, 10).toISOString().split('T')[0] // 10th of current month
        };
        
        const invoice = await invoiceService.createInvoice(invoiceData);
        
        // Add ledger entry
        await ledgerService.addLedgerEntry({
          studentId: student.id,
          type: 'Invoice',
          description: `Monthly invoice - ${monthYear}`,
          debit: totalMonthlyFee,
          credit: 0,
          referenceId: invoice.id
        });
        
        // Update student balance
        await studentService.updateStudent(student.id, {
          currentBalance: (student.currentBalance || 0) + totalMonthlyFee
        });
        
        generatedInvoices.push(invoice);
        console.log(`Monthly invoice generated for ${student.name}: ₨${totalMonthlyFee.toLocaleString()}`);
      }
      
      console.log(`Generated ${generatedInvoices.length} monthly invoices for ${monthYear}`);
      return generatedInvoices;
    } catch (error) {
      console.error('Error generating monthly invoices:', error);
      throw error;
    }
  },

  // Simulate automatic monthly billing (in real app, this would be a cron job)
  async scheduleMonthlyBilling() {
    const today = new Date();
    const isFirstOfMonth = today.getDate() === 1;
    
    if (isFirstOfMonth) {
      console.log('🗓️ First of the month - Generating monthly invoices...');
      return await this.generateMonthlyInvoices(today);
    } else {
      console.log(`Today is ${today.getDate()}th - Monthly billing runs on 1st of every month`);
      return [];
    }
  },

  // Manual trigger for monthly billing (for testing)
  async triggerMonthlyBilling(targetMonth, targetYear) {
    const targetDate = new Date(targetYear, targetMonth - 1, 1); // Month is 0-indexed
    console.log(`🔧 Manually triggering monthly billing for ${targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
    return await this.generateMonthlyInvoices(targetDate);
  },

  // Get billing summary for a student
  async getStudentBillingSummary(studentId) {
    try {
      const student = await studentService.getStudentById(studentId);
      const invoices = await invoiceService.getInvoicesByStudentId(studentId);
      const ledgerEntries = await ledgerService.getLedgerByStudentId(studentId);
      
      const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
      const totalPaid = ledgerEntries
        .filter(entry => entry.type === 'Payment')
        .reduce((sum, entry) => sum + (entry.credit || 0), 0);
      
      return {
        student: student,
        totalInvoiced: totalInvoiced,
        totalPaid: totalPaid,
        currentBalance: student.currentBalance || 0,
        advanceBalance: student.advanceBalance || 0,
        invoiceCount: invoices.length,
        lastInvoiceDate: invoices.length > 0 ? invoices[invoices.length - 1].issueDate : null
      };
    } catch (error) {
      console.error('Error getting billing summary:', error);
      throw error;
    }
  }
};