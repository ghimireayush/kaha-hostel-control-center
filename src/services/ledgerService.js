
import { mockData } from '../data/mockData.js';

let ledgerEntries = [...mockData.ledgerEntries];

export const ledgerService = {
  // Get all ledger entries
  async getLedgerEntries() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...ledgerEntries]), 100);
    });
  },

  // Get ledger entries by student ID
  async getLedgerByStudentId(studentId) {
    return new Promise((resolve) => {
      const studentLedger = ledgerEntries
        .filter(entry => entry.studentId === studentId)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setTimeout(() => resolve(studentLedger), 100);
    });
  },

  // Add ledger entry with proper reason tracking
  async addLedgerEntry(entryData) {
    return new Promise((resolve) => {
      const newEntry = {
        id: `LED${String(ledgerEntries.length + 1).padStart(3, '0')}`,
        ...entryData,
        date: entryData.date || new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        reason: entryData.reason || entryData.description || 'No reason provided'
      };
      ledgerEntries.push(newEntry);
      console.log(`📊 Ledger Entry Added: ${newEntry.type} - ${newEntry.reason} - NPR ${(newEntry.debit || 0) - (newEntry.credit || 0)}`);
      setTimeout(() => resolve(newEntry), 100);
    });
  },

  // Book payment with remark for checkout
  async bookCheckoutPayment(studentId, amount, remark) {
    return new Promise((resolve) => {
      const paymentEntry = {
        id: `LED${String(ledgerEntries.length + 1).padStart(3, '0')}`,
        studentId,
        date: new Date().toISOString().split('T')[0],
        type: "Payment",
        description: "Payment booked during checkout",
        referenceId: null,
        debit: 0,
        credit: amount,
        remark
      };
      ledgerEntries.push(paymentEntry);
      setTimeout(() => resolve(paymentEntry), 100);
    });
  },

  // Calculate student balance
  async calculateStudentBalance(studentId) {
    return new Promise((resolve) => {
      const entries = ledgerEntries.filter(entry => entry.studentId === studentId);
      let balance = 0;
      
      entries.forEach(entry => {
        balance += (entry.debit || 0) - (entry.credit || 0);
      });

      const balanceType = balance > 0 ? 'Dr' : balance < 0 ? 'Cr' : 'Nil';
      
      setTimeout(() => resolve({ 
        balance: Math.abs(balance), 
        balanceType,
        rawBalance: balance 
      }), 100);
    });
  },

  // Get ledger summary for all students
  async getLedgerSummary() {
    return new Promise((resolve) => {
      const summary = {};
      
      ledgerEntries.forEach(entry => {
        if (!summary[entry.studentId]) {
          summary[entry.studentId] = {
            totalCharges: 0,
            totalPayments: 0,
            transactionCount: 0
          };
        }
        
        summary[entry.studentId].totalCharges += entry.debit || 0;
        summary[entry.studentId].totalPayments += entry.credit || 0;
        summary[entry.studentId].transactionCount += 1;
      });

      setTimeout(() => resolve(summary), 100);
    });
  }
};
