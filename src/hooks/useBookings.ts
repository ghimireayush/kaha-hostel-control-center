import { useState, useEffect, useCallback } from 'react';
import { bookingApiService } from '../services/bookingApiService';
import { 
  BookingRequest, 
  CreateBookingRequest, 
  UpdateBookingRequest, 
  BookingStats,
  BookingStatus,
  ApproveBookingResponse
} from '../types/api';

export const useBookings = () => {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [pendingBookings, setPendingBookings] = useState<BookingRequest[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
    todayBookings: 0,
    weeklyBookings: 0,
    monthlyBookings: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 useBookings: Loading bookings data...');

      // Load all bookings data in parallel
      const [
        allBookingsResult,
        pendingBookingsResult,
        statsResult
      ] = await Promise.all([
        bookingApiService.getAllBookings().catch(err => {
          console.warn('All bookings failed:', err);
          return [];
        }),
        bookingApiService.getPendingBookings().catch(err => {
          console.warn('Pending bookings failed:', err);
          return [];
        }),
        bookingApiService.getBookingStats().catch(err => {
          console.warn('Booking stats failed:', err);
          return {
            totalBookings: 0,
            pendingBookings: 0,
            approvedBookings: 0,
            rejectedBookings: 0,
            todayBookings: 0,
            weeklyBookings: 0,
            monthlyBookings: 0,
          };
        })
      ]);

      console.log('🔍 useBookings: Data loaded successfully');

      setBookings(allBookingsResult);
      setPendingBookings(pendingBookingsResult);
      setBookingStats(statsResult);

    } catch (err) {
      console.error('Error loading bookings data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings data');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (bookingData: CreateBookingRequest): Promise<BookingRequest> => {
    try {
      setActionLoading('create');
      setError(null);

      console.log('🔍 useBookings: Creating booking...', bookingData);

      const newBooking = await bookingApiService.createBooking(bookingData);
      
      // Refresh bookings list
      await loadBookings();
      
      console.log('🔍 useBookings: Booking created successfully');
      return newBooking;
    } catch (err) {
      console.error('Error creating booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  }, [loadBookings]);

  const updateBooking = useCallback(async (id: string, bookingData: UpdateBookingRequest): Promise<BookingRequest> => {
    try {
      setActionLoading(`update-${id}`);
      setError(null);

      console.log('🔍 useBookings: Updating booking...', id, bookingData);

      const updatedBooking = await bookingApiService.updateBooking(id, bookingData);
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === id ? updatedBooking : booking
      ));
      setPendingBookings(prev => prev.map(booking => 
        booking.id === id ? updatedBooking : booking
      ));
      
      console.log('🔍 useBookings: Booking updated successfully');
      return updatedBooking;
    } catch (err) {
      console.error('Error updating booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  }, []);

  const approveBooking = useCallback(async (id: string): Promise<ApproveBookingResponse> => {
    try {
      setActionLoading(`approve-${id}`);
      setError(null);

      console.log('🔍 useBookings: Approving booking...', id);

      const result = await bookingApiService.approveBooking(id);
      
      // Refresh data to get updated booking status
      await loadBookings();
      
      console.log('🔍 useBookings: Booking approved successfully');
      return result;
    } catch (err) {
      console.error('Error approving booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  }, [loadBookings]);

  const rejectBooking = useCallback(async (id: string, reason: string): Promise<BookingRequest> => {
    try {
      setActionLoading(`reject-${id}`);
      setError(null);

      console.log('🔍 useBookings: Rejecting booking...', id, reason);

      const rejectedBooking = await bookingApiService.rejectBooking(id, reason);
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === id ? rejectedBooking : booking
      ));
      setPendingBookings(prev => prev.filter(booking => booking.id !== id));
      
      // Update stats
      setBookingStats(prev => ({
        ...prev,
        pendingBookings: prev.pendingBookings - 1,
        rejectedBookings: prev.rejectedBookings + 1,
      }));
      
      console.log('🔍 useBookings: Booking rejected successfully');
      return rejectedBooking;
    } catch (err) {
      console.error('Error rejecting booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  }, []);

  const deleteBooking = useCallback(async (id: string): Promise<void> => {
    try {
      setActionLoading(`delete-${id}`);
      setError(null);

      console.log('🔍 useBookings: Deleting booking...', id);

      await bookingApiService.deleteBooking(id);
      
      // Update local state
      setBookings(prev => prev.filter(booking => booking.id !== id));
      setPendingBookings(prev => prev.filter(booking => booking.id !== id));
      
      console.log('🔍 useBookings: Booking deleted successfully');
    } catch (err) {
      console.error('Error deleting booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  }, []);

  const refreshData = useCallback(() => {
    loadBookings();
  }, [loadBookings]);

  // Load data on mount
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return {
    // Data
    bookings,
    pendingBookings,
    bookingStats,
    
    // State
    loading,
    error,
    actionLoading,
    
    // Actions
    createBooking,
    updateBooking,
    approveBooking,
    rejectBooking,
    deleteBooking,
    refreshData,
    loadBookings,
  };
};