
import { apiService } from './apiService.ts';
import { API_ENDPOINTS } from '../config/api.ts';

export const studentService = {
  // Get all students
  async getStudents() {
    try {
      const result = await apiService.get(API_ENDPOINTS.STUDENTS.BASE);
      return result.items || []; // API returns { items, pagination }
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  // Alias for getStudents (used by dashboard)
  async getAllStudents() {
    return await this.getStudents();
  },

  // Get student by ID
  async getStudentById(id) {
    try {
      return await apiService.get(API_ENDPOINTS.STUDENTS.BY_ID(id));
    } catch (error) {
      console.error('Error fetching student by ID:', error);
      throw error;
    }
  },

  // Create new student (triggered by booking approval)
  async createStudent(studentData) {
    try {
      const newStudent = await apiService.post(API_ENDPOINTS.STUDENTS.BASE, studentData);
      
      // Send welcome notification via Kaha App
      const message = `Welcome to Kaha Hostel! Your profile has been created. Room ${newStudent.roomNumber} has been assigned to you.`;
      console.log(`📱 Kaha App Notification sent to ${newStudent.name}:`, message);
      
      console.log('New student created:', newStudent);
      return newStudent;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  // Update student information
  async updateStudent(id, updates) {
    try {
      return await apiService.put(API_ENDPOINTS.STUDENTS.BY_ID(id), updates);
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  // Get students with outstanding dues
  async getStudentsWithDues() {
    try {
      const result = await apiService.get(API_ENDPOINTS.STUDENTS.BASE);
      const allStudents = result.items || [];
      return allStudents.filter(s => s.currentBalance > 0);
    } catch (error) {
      console.error('Error fetching students with dues:', error);
      throw error;
    }
  },

  // Get student statistics
  async getStudentStats() {
    try {
      return await apiService.get(API_ENDPOINTS.STUDENTS.STATS);
    } catch (error) {
      console.error('Error fetching student stats:', error);
      throw error;
    }
  },

  // Search students
  async searchStudents(searchTerm) {
    try {
      const result = await apiService.get(API_ENDPOINTS.STUDENTS.BASE, { search: searchTerm });
      return result.items || [];
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  },

  // Process student checkout
  async processCheckout(studentId, checkoutDetails) {
    try {
      return await apiService.post(API_ENDPOINTS.STUDENTS.CHECKOUT(studentId), checkoutDetails);
    } catch (error) {
      console.error('Error processing student checkout:', error);
      throw error;
    }
  }
};
