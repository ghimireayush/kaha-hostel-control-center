
const API_BASE_URL = 'http://localhost:3001/api/v1';

// Helper function to handle API requests
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    // Handle the specific API response format: { status, result: { items, pagination } }
    if (data.result && data.result.items) {
      return data.result.items;
    }
    // For single item responses, return the result directly
    if (data.result && !data.result.items) {
      return data.result;
    }
    // Fallback for other formats
    return data.data || data;
  } catch (error) {
    console.error('Invoice API Request Error:', error);
    throw error;
  }
}

export const invoiceService = {
  // Get all invoices
  async getInvoices() {
    try {
      const result = await apiRequest('/invoices');
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  // Get invoice by ID
  async getInvoiceById(id) {
    try {
      return await apiRequest(`/invoices/${id}`);
    } catch (error) {
      console.error('Error fetching invoice by ID:', error);
      throw error;
    }
  },

  // Get invoices by student ID
  async getInvoicesByStudentId(studentId) {
    try {
      const result = await apiRequest(`/invoices?studentId=${studentId}`);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching invoices by student ID:', error);
      throw error;
    }
  },

  // Create new invoice
  async createInvoice(invoiceData) {
    try {
      return await apiRequest('/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  // Update invoice
  async updateInvoice(id, updates) {
    try {
      return await apiRequest(`/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  },

  // Get invoice statistics
  async getInvoiceStats() {
    try {
      // Get all invoices and calculate stats
      const invoices = await this.getInvoices();
      const stats = {
        totalPaid: invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0),
        totalUnpaid: invoices.filter(i => i.status === 'Unpaid').reduce((sum, i) => sum + i.total, 0),
        totalPartiallyPaid: invoices.filter(i => i.status === 'Partially Paid').reduce((sum, i) => sum + i.amountPaid, 0),
        overdueCount: invoices.filter(i => 
          i.status !== 'Paid' && new Date(i.dueDate) < new Date()
        ).length
      };
      return stats;
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
      throw error;
    }
  },

  // Filter invoices by status
  async filterInvoicesByStatus(status) {
    try {
      if (status === 'all') {
        return await this.getInvoices();
      }
      const result = await apiRequest(`/invoices?status=${status}`);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error filtering invoices by status:', error);
      throw error;
    }
  }
};
