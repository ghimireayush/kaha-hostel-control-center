// Monthly Billing Service - Automated invoice generation on 1st of every month
import { studentService } from './studentService.js';
import { invoiceService } from './invoiceService.js';
import { ledgerService } from './ledgerService.js';
import { notificationService } from './notificationService.js';
import { billingService } from './billingService.js';

export const monthlyBillingService = {
  // Generate monthly invoices for all active students
  async generateMonthlyInvoices(targetMonth = null) {
    return new Promise(async (resolve) => {
      try {
        const currentDate = new Date();
        const month = targetMonth || currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        console.log(`🗓️ Starting monthly billing for ${month}...`);
        
        // Get all active students with configured charges
        const students = await studentService.getStudents();
        const activeStudents = students.filter(s => 
          s.status === 'Active' && 
          s.billingStatus === 'configured' &&
          s.chargeConfiguration
        );

        const results = {
          month,
          totalStudents: activeStudents.length,
          successful: [],
          failed: [],
          totalAmount: 0
        };

        // Process each student
        for (const student of activeStudents) {
          try {
            const invoice = await this.generateStudentMonthlyInvoice(student, month);
            
            if (invoice) {
              results.successful.push({
                studentId: student.id,
                studentName: student.name,
                invoiceId: invoice.id,
                amount: invoice.total
              });
              results.totalAmount += invoice.total;
            }
          } catch (error) {
            console.error(`Error generating invoice for ${student.name}:`, error);
            results.failed.push({
              studentId: student.id,
              studentName: student.name,
              error: error.message
            });
          }
        }

        console.log(`✅ Monthly billing complete: ${results.successful.length}/${results.totalStudents} invoices generated`);
        console.log(`💰 Total billing amount: NPR ${results.totalAmount.toLocaleString()}`);

        setTimeout(() => resolve(results), 500);
      } catch (error) {
        console.error('Error in monthly billing:', error);
        setTimeout(() => resolve({
          success: false,
          error: error.message
        }), 500);
      }
    });
  },

  // Generate monthly invoice for a specific student
  async generateStudentMonthlyInvoice(student, month) {
    return new Promise(async (resolve) => {
      try {
        if (!student.chargeConfiguration || student.billingStatus !== 'configured') {
          throw new Error('Student charges not configured');
        }

        // Check if invoice already exists for this month
        const existingInvoices = await invoiceService.getInvoicesByStudentId(student.id);
        const existingInvoice = existingInvoices.find(inv => inv.month === month);
        
        if (existingInvoice) {
          console.log(`Invoice already exists for ${student.name} - ${month}`);
          setTimeout(() => resolve(existingInvoice), 100);
          return;
        }

        // Calculate monthly charges
        const monthlyCharges = student.chargeConfiguration.filter(c => 
          c.isActive && c.type === 'monthly'
        );

        let invoiceItems = [];
        let totalAmount = 0;

        // Add monthly charges
        monthlyCharges.forEach(charge => {
          invoiceItems.push({
            description: charge.name,
            amount: charge.amount,
            category: charge.category,
            type: 'monthly'
          });
          totalAmount += charge.amount;
        });

        // Check for any pending one-time charges
        const oneTimeCharges = student.chargeConfiguration.filter(c => 
          c.isActive && c.type === 'one-time' && !c.invoiced
        );

        oneTimeCharges.forEach(charge => {
          invoiceItems.push({
            description: charge.name,
            amount: charge.amount,
            category: charge.category,
            type: 'one-time'
          });
          totalAmount += charge.amount;
          
          // Mark as invoiced
          charge.invoiced = true;
        });

        // Handle prorated billing for mid-month enrollments
        const enrollmentDate = new Date(student.enrollmentDate);
        const currentDate = new Date();
        const isFirstMonth = enrollmentDate.getMonth() === currentDate.getMonth() && 
                            enrollmentDate.getFullYear() === currentDate.getFullYear();

        if (isFirstMonth && enrollmentDate.getDate() > 1) {
          // Apply prorated billing for first month
          const proratedCalculation = billingService.calculateProratedAmount(
            totalAmount, 
            student.enrollmentDate
          );
          
          if (proratedCalculation.isProrated) {
            totalAmount = proratedCalculation.proratedAmount;
            invoiceItems = invoiceItems.map(item => ({
              ...item,
              amount: Math.round((item.amount * proratedCalculation.daysToCalculate) / proratedCalculation.totalDaysInMonth),
              prorated: true,
              proratedDays: proratedCalculation.daysToCalculate
            }));
          }
        }

        // Create invoice
        const invoiceData = {
          studentId: student.id,
          studentName: student.name,
          month: month,
          items: invoiceItems,
          subtotal: totalAmount,
          tax: 0, // Add tax calculation if needed
          total: totalAmount,
          dueDate: this.calculateDueDate(),
          status: 'Pending',
          generatedBy: 'Auto-Billing System',
          generationDate: new Date().toISOString().split('T')[0]
        };

        const invoice = await invoiceService.createInvoice(invoiceData);

        // Create ledger entry
        await ledgerService.addLedgerEntry({
          studentId: student.id,
          type: 'Invoice',
          description: `Monthly invoice - ${month}`,
          debit: totalAmount,
          credit: 0,
          referenceId: invoice.id,
          notes: `Auto-generated monthly invoice`
        });

        // Update student balance
        const currentBalance = student.currentBalance || 0;
        await studentService.updateStudent(student.id, {
          currentBalance: currentBalance + totalAmount,
          lastInvoiceDate: new Date().toISOString().split('T')[0],
          chargeConfiguration: student.chargeConfiguration // Save updated configuration
        });

        // Send invoice notification
        await notificationService.notifyNewInvoice(
          student.id,
          month,
          totalAmount
        );

        console.log(`📋 Invoice generated for ${student.name}: NPR ${totalAmount.toLocaleString()}`);

        setTimeout(() => resolve(invoice), 100);
      } catch (error) {
        console.error(`Error generating invoice for ${student.name}:`, error);
        setTimeout(() => resolve(null), 100);
      }
    });
  },

  // Calculate due date (typically 10 days from generation)
  calculateDueDate() {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 10);
    return dueDate.toISOString().split('T')[0];
  },

  // Check if it's time for monthly billing (1st of month)
  isMonthlyBillingDay() {
    const today = new Date();
    return today.getDate() === 1;
  },

  // Get monthly billing schedule
  async getBillingSchedule() {
    return new Promise((resolve) => {
      const schedule = [];
      const currentDate = new Date();
      
      // Generate next 12 months schedule
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
        schedule.push({
          month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          date: date.toISOString().split('T')[0],
          status: i === 0 ? 'current' : 'upcoming'
        });
      }

      setTimeout(() => resolve(schedule), 100);
    });
  },

  // Get billing statistics
  async getBillingStats() {
    return new Promise(async (resolve) => {
      try {
        const students = await studentService.getStudents();
        const invoices = await invoiceService.getInvoices();
        
        const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const currentMonthInvoices = invoices.filter(inv => inv.month === currentMonth);
        
        const stats = {
          totalStudents: students.filter(s => s.status === 'Active').length,
          configuredStudents: students.filter(s => s.billingStatus === 'configured').length,
          currentMonthInvoices: currentMonthInvoices.length,
          currentMonthAmount: currentMonthInvoices.reduce((sum, inv) => sum + inv.total, 0),
          pendingInvoices: currentMonthInvoices.filter(inv => inv.status === 'Pending').length,
          paidInvoices: currentMonthInvoices.filter(inv => inv.status === 'Paid').length,
          overdueInvoices: currentMonthInvoices.filter(inv => {
            const dueDate = new Date(inv.dueDate);
            return inv.status === 'Pending' && dueDate < new Date();
          }).length
        };

        setTimeout(() => resolve(stats), 100);
      } catch (error) {
        console.error('Error getting billing stats:', error);
        setTimeout(() => resolve({}), 100);
      }
    });
  },

  // Manual trigger for monthly billing (for testing or manual runs)
  async triggerManualBilling(month = null) {
    return new Promise(async (resolve) => {
      try {
        console.log('🔧 Manual billing triggered by admin');
        const results = await this.generateMonthlyInvoices(month);
        
        // Send summary notification to admin
        const summaryMessage = `Monthly billing completed: ${results.successful.length} invoices generated, Total: NPR ${results.totalAmount.toLocaleString()}`;
        console.log(`📊 ${summaryMessage}`);
        
        setTimeout(() => resolve(results), 100);
      } catch (error) {
        console.error('Error in manual billing:', error);
        setTimeout(() => resolve({
          success: false,
          error: error.message
        }), 100);
      }
    });
  },

  // Get students ready for billing
  async getStudentsReadyForBilling() {
    return new Promise(async (resolve) => {
      try {
        const students = await studentService.getStudents();
        const readyStudents = students.filter(s => 
          s.status === 'Active' && 
          s.billingStatus === 'configured' &&
          s.chargeConfiguration &&
          s.chargeConfiguration.some(c => c.isActive)
        );

        const studentsWithCharges = readyStudents.map(student => ({
          ...student,
          monthlyTotal: student.chargeConfiguration
            .filter(c => c.isActive && c.type === 'monthly')
            .reduce((sum, c) => sum + c.amount, 0),
          activeCharges: student.chargeConfiguration.filter(c => c.isActive).length
        }));

        setTimeout(() => resolve(studentsWithCharges), 100);
      } catch (error) {
        console.error('Error getting students ready for billing:', error);
        setTimeout(() => resolve([]), 100);
      }
    });
  },

  // Preview next month's billing
  async previewNextMonthBilling() {
    return new Promise(async (resolve) => {
      try {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const monthName = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        const readyStudents = await this.getStudentsReadyForBilling();
        
        const preview = {
          month: monthName,
          totalStudents: readyStudents.length,
          totalAmount: readyStudents.reduce((sum, s) => sum + s.monthlyTotal, 0),
          students: readyStudents.map(s => ({
            id: s.id,
            name: s.name,
            roomNumber: s.roomNumber,
            monthlyAmount: s.monthlyTotal,
            activeCharges: s.activeCharges
          }))
        };

        setTimeout(() => resolve(preview), 100);
      } catch (error) {
        console.error('Error previewing next month billing:', error);
        setTimeout(() => resolve(null), 100);
      }
    });
  }
};