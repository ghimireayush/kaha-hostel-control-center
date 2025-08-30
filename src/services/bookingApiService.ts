import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { 
  BookingRequest, 
  CreateBookingRequest, 
  UpdateBookingRequest, 
  BookingStats,
  ApproveBookingResponse,
  RejectBookingRequest
} from '../types/api';

export class BookingApiService {
  private apiService = apiService;

  /**
   * Get all booking requests
   */
  async getAllBookings(): Promise<BookingRequest[]> {
    console.log('🔍 BookingApiService.getAllBookings called');
    console.log('🔍 API endpoint:', API_ENDPOINTS.BOOKINGS.LIST);

    const result = await this.apiService.get<{ items: BookingRequest[]; pagination: any }>(
      API_ENDPOINTS.BOOKINGS.LIST
    );
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure - the API returns { items: [], pagination: {} }
    if (result && result.items) {
      return result.items;
    }
    
    // Fallback for different response structures
    if (Array.isArray(result)) {
      return result;
    }
    
    return [];
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(): Promise<BookingStats> {
    console.log('🔍 BookingApiService.getBookingStats called');
    console.log('🔍 API endpoint:', API_ENDPOINTS.BOOKINGS.STATS);

    const result = await this.apiService.get<BookingStats>(
      API_ENDPOINTS.BOOKINGS.STATS
    );
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Get pending booking requests
   */
  async getPendingBookings(): Promise<BookingRequest[]> {
    console.log('🔍 BookingApiService.getPendingBookings called');
    console.log('🔍 API endpoint:', API_ENDPOINTS.BOOKINGS.PENDING);

    const result = await this.apiService.get<BookingRequest[]>(
      API_ENDPOINTS.BOOKINGS.PENDING
    );
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure - pending endpoint returns array directly
    if (Array.isArray(result)) {
      return result;
    }
    
    return [];
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id: string): Promise<BookingRequest> {
    console.log('🔍 BookingApiService.getBookingById called with ID:', id);
    
    const endpoint = API_ENDPOINTS.BOOKINGS.BY_ID.replace(':id', id);
    console.log('🔍 API endpoint:', endpoint);

    const result = await this.apiService.get<BookingRequest>(endpoint);
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Create new booking request
   */
  async createBooking(bookingData: CreateBookingRequest): Promise<BookingRequest> {
    console.log('🔍 BookingApiService.createBooking called with data:', bookingData);
    console.log('🔍 API endpoint:', API_ENDPOINTS.BOOKINGS.CREATE);

    const result = await this.apiService.post<BookingRequest>(
      API_ENDPOINTS.BOOKINGS.CREATE,
      bookingData
    );
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Update booking request
   */
  async updateBooking(id: string, bookingData: UpdateBookingRequest): Promise<BookingRequest> {
    console.log('🔍 BookingApiService.updateBooking called with ID:', id, 'data:', bookingData);
    
    const endpoint = API_ENDPOINTS.BOOKINGS.UPDATE.replace(':id', id);
    console.log('🔍 API endpoint:', endpoint);

    const result = await this.apiService.put<BookingRequest>(endpoint, bookingData);
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Approve booking request
   */
  async approveBooking(id: string): Promise<ApproveBookingResponse> {
    console.log('🔍 BookingApiService.approveBooking called with ID:', id);
    
    const endpoint = API_ENDPOINTS.BOOKINGS.APPROVE.replace(':id', id);
    console.log('🔍 API endpoint:', endpoint);

    const result = await this.apiService.post<ApproveBookingResponse>(
      endpoint,
      {} // No body needed for approval
    );
    
    console.log('🔍 Raw API result:', result);
    
    return result;
  }

  /**
   * Reject booking request
   */
  async rejectBooking(id: string, reason: string): Promise<BookingRequest> {
    console.log('🔍 BookingApiService.rejectBooking called with ID:', id, 'reason:', reason);
    
    const endpoint = API_ENDPOINTS.BOOKINGS.REJECT.replace(':id', id);
    console.log('🔍 API endpoint:', endpoint);

    const rejectData: RejectBookingRequest = { reason };

    const result = await this.apiService.post<BookingRequest>(endpoint, rejectData);
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Delete booking request (if needed)
   */
  async deleteBooking(id: string): Promise<void> {
    console.log('🔍 BookingApiService.deleteBooking called with ID:', id);
    
    const endpoint = API_ENDPOINTS.BOOKINGS.BY_ID.replace(':id', id);
    console.log('🔍 API endpoint:', endpoint);

    await this.apiService.delete(endpoint);
    
    console.log('🔍 Booking deleted successfully');
  }
}

// Export singleton instance
export const bookingApiService = new BookingApiService();