
import bookingRequestsData from '../data/bookingRequests.json';

let bookingRequests = [...bookingRequestsData];

export const bookingService = {
  // Get all booking requests
  async getBookingRequests() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...bookingRequests]), 100);
    });
  },

  // Get booking request by ID
  async getBookingRequestById(id) {
    return new Promise((resolve) => {
      const request = bookingRequests.find(r => r.id === id);
      setTimeout(() => resolve(request), 100);
    });
  },

  // Create new booking request
  async createBookingRequest(requestData) {
    return new Promise((resolve) => {
      const newRequest = {
        id: `BR${String(bookingRequests.length + 1).padStart(3, '0')}`,
        ...requestData,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'Pending'
      };
      bookingRequests.push(newRequest);
      setTimeout(() => resolve(newRequest), 100);
    });
  },

  // Update booking status
  async updateBookingStatus(id, status, notes = '') {
    return new Promise((resolve) => {
      const index = bookingRequests.findIndex(r => r.id === id);
      if (index !== -1) {
        bookingRequests[index].status = status;
        if (notes) bookingRequests[index].notes = notes;
        setTimeout(() => resolve(bookingRequests[index]), 100);
      } else {
        setTimeout(() => resolve(null), 100);
      }
    });
  },

  // Get booking statistics
  async getBookingStats() {
    return new Promise((resolve) => {
      const stats = {
        total: bookingRequests.length,
        pending: bookingRequests.filter(r => r.status === 'Pending').length,
        approved: bookingRequests.filter(r => r.status === 'Approved').length,
        rejected: bookingRequests.filter(r => r.status === 'Rejected').length
      };
      setTimeout(() => resolve(stats), 100);
    });
  },

  // Filter requests by status
  async filterRequestsByStatus(status) {
    return new Promise((resolve) => {
      const filtered = status === 'all' 
        ? bookingRequests 
        : bookingRequests.filter(r => r.status.toLowerCase() === status.toLowerCase());
      setTimeout(() => resolve(filtered), 100);
    });
  }
};
