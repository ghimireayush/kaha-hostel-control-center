
// Removed unused import: notificationService

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
    return data.data; // API returns data in { status, data } format
  } catch (error) {
    console.error('Student API Request Error:', error);
    throw error;
  }
}

export const studentService = {
  // Get all students
  async getStudents() {
    try {
      const result = await apiRequest('/students');
      return result.items || []; // API returns { items, pagination }
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  // Get student by ID
  async getStudentById(id) {
    try {
      return await apiRequest(`/students/${id}`);
    } catch (error) {
      console.error('Error fetching student by ID:', error);
      throw error;
    }
  },

  // Create new student (triggered by booking approval)
  async createStudent(studentData) {
    try {
      const newStudent = await apiRequest('/students', {
        method: 'POST',
        body: JSON.stringify(studentData),
      });
      
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
      return await apiRequest(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  // Get students with outstanding dues
  async getStudentsWithDues() {
    try {
      const result = await apiRequest('/students');
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
      return await apiRequest('/students/stats');
    } catch (error) {
      console.error('Error fetching student stats:', error);
      throw error;
    }
  },

  // Search students
  async searchStudents(searchTerm) {
    try {
      const result = await apiRequest(`/students?search=${encodeURIComponent(searchTerm)}`);
      return result.items || [];
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  },

  // Process student checkout
  async processCheckout(studentId, checkoutDetails) {
    try {
      return await apiRequest(`/students/${studentId}/checkout`, {
        method: 'POST',
        body: JSON.stringify(checkoutDetails),
      });
    } catch (error) {
      console.error('Error processing student checkout:', error);
      throw error;
    }
  }
};
