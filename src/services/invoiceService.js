
import invoicesData from '../data/invoices.json';

let invoices = [...invoicesData];

export const invoiceService = {
  // Get all invoices
  async getInvoices() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...invoices]), 100);
    });
  },

  // Get invoice by ID
  async getInvoiceById(id) {
    return new Promise((resolve) => {
      const invoice = invoices.find(i => i.id === id);
      setTimeout(() => resolve(invoice), 100);
    });
  },

  // Get invoices by student ID
  async getInvoicesByStudentId(studentId) {
    return new Promise((resolve) => {
      const studentInvoices = invoices.filter(i => i.studentId === studentId);
      setTimeout(() => resolve(studentInvoices), 100);
    });
  },

  // Create new invoice
  async createInvoice(invoiceData) {
    return new Promise((resolve) => {
      const newInvoice = {
        id: `INV${String(invoices.length + 1).padStart(3, '0')}`,
        ...invoiceData,
        issueDate: new Date().toISOString().split('T')[0],
        status: 'Unpaid',
        amountPaid: 0,
        paidDate: null,
        paymentMode: null
      };
      invoices.push(newInvoice);
      setTimeout(() => resolve(newInvoice), 100);
    });
  },

  // Update invoice
  async updateInvoice(id, updates) {
    return new Promise((resolve) => {
      const index = invoices.findIndex(i => i.id === id);
      if (index !== -1) {
        invoices[index] = { ...invoices[index], ...updates };
        setTimeout(() => resolve(invoices[index]), 100);
      } else {
        setTimeout(() => resolve(null), 100);
      }
    });
  },

  // Get invoice statistics
  async getInvoiceStats() {
    return new Promise((resolve) => {
      const stats = {
        totalPaid: invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0),
        totalUnpaid: invoices.filter(i => i.status === 'Unpaid').reduce((sum, i) => sum + i.total, 0),
        totalPartiallyPaid: invoices.filter(i => i.status === 'Partially Paid').reduce((sum, i) => sum + i.amountPaid, 0),
        overdueCount: invoices.filter(i => 
          i.status !== 'Paid' && new Date(i.dueDate) < new Date()
        ).length
      };
      setTimeout(() => resolve(stats), 100);
    });
  },

  // Filter invoices by status
  async filterInvoicesByStatus(status) {
    return new Promise((resolve) => {
      const filtered = status === 'all' 
        ? invoices 
        : invoices.filter(i => i.status.toLowerCase() === status.toLowerCase());
      setTimeout(() => resolve(filtered), 100);
    });
  }
};
