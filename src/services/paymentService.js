
import { studentService } from './studentService.js';
import { ledgerService } from './ledgerService.js';
import { notificationService } from './notificationService.js';

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
    console.error('Payment API Request Error:', error);
    throw error;
  }
}

export const paymentService = {
  // Get all payments
  async getPayments() {
    try {
      const result = await apiRequest('/payments');
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  // Get payment by ID
  async getPaymentById(id) {
    try {
      return await apiRequest(`/payments/${id}`);
    } catch (error) {
      console.error('Error fetching payment by ID:', error);
      throw error;
    }
  },

  // Get payments by student ID
  async getPaymentsByStudentId(studentId) {
    try {
      const result = await apiRequest(`/payments?studentId=${studentId}`);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching payments by student ID:', error);
      throw error;
    }
  },

  // Record new payment
  async recordPayment(paymentData) {
    try {
      // Create payment via API
      const newPayment = await apiRequest('/payments', {
        method: 'POST',
        body: JSON.stringify({
          ...paymentData,
          paymentDate: new Date().toISOString().split('T')[0],
          receivedBy: 'Admin'
        }),
      });

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

      return newPayment;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  },

  // Get payment statistics
  async getPaymentStats() {
    try {
      const payments = await this.getPayments();
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
        paymentModes: await this.getPaymentModeStats()
      };
      return stats;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  },

  // Get payment mode statistics
  async getPaymentModeStats() {
    try {
      const payments = await this.getPayments();
      const modes = {};
      payments.forEach(p => {
        modes[p.paymentMode] = (modes[p.paymentMode] || 0) + 1;
      });
      return modes;
    } catch (error) {
      console.error('Error fetching payment mode stats:', error);
      throw error;
    }
  },

  // Get recent payments
  async getRecentPayments(limit = 10) {
    try {
      const payments = await this.getPayments();
      const recent = payments
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
        .slice(0, limit);
      return recent;
    } catch (error) {
      console.error('Error fetching recent payments:', error);
      throw error;
    }
  }
};
