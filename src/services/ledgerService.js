
import ledgerData from '../data/ledger.json' with { type: 'json' };

let ledgerEntries = [...ledgerData];

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

  // Add ledger entry
  async addLedgerEntry(entryData) {
    return new Promise((resolve) => {
      const newEntry = {
        id: `LED${String(ledgerEntries.length + 1).padStart(3, '0')}`,
        ...entryData,
        date: new Date().toISOString().split('T')[0]
      };
      ledgerEntries.push(newEntry);
      setTimeout(() => resolve(newEntry), 100);
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
