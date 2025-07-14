
import studentsData from '../data/students.json';

let students = [...studentsData];

export const studentService = {
  // Get all students
  async getStudents() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...students]), 100);
    });
  },

  // Get student by ID
  async getStudentById(id) {
    return new Promise((resolve) => {
      const student = students.find(s => s.id === id);
      setTimeout(() => resolve(student), 100);
    });
  },

  // Create new student (triggered by booking approval)
  async createStudent(studentData) {
    return new Promise((resolve) => {
      const newStudent = {
        id: `STU${String(students.length + 1).padStart(3, '0')}`,
        ...studentData,
        enrollmentDate: new Date().toISOString().split('T')[0],
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        currentBalance: 0,
        advanceBalance: 0,
        totalPaid: 0,
        totalCharges: 0,
        parentOccupation: 'Not specified',
        bloodGroup: 'Not specified',
        medicalConditions: 'None'
      };
      
      students.push(newStudent);
      console.log('New student created:', newStudent);
      setTimeout(() => resolve(newStudent), 100);
    });
  },

  // Update student information
  async updateStudent(id, updates) {
    return new Promise((resolve) => {
      const index = students.findIndex(s => s.id === id);
      if (index !== -1) {
        students[index] = { ...students[index], ...updates };
        setTimeout(() => resolve(students[index]), 100);
      } else {
        setTimeout(() => resolve(null), 100);
      }
    });
  },

  // Get students with outstanding dues
  async getStudentsWithDues() {
    return new Promise((resolve) => {
      const studentsWithDues = students.filter(s => s.currentBalance > 0);
      setTimeout(() => resolve(studentsWithDues), 100);
    });
  },

  // Get student statistics
  async getStudentStats() {
    return new Promise((resolve) => {
      const stats = {
        total: students.length,
        active: students.filter(s => s.status === 'Active').length,
        inactive: students.filter(s => s.status === 'Inactive').length,
        totalDues: students.reduce((sum, s) => sum + (s.currentBalance || 0), 0),
        totalAdvances: students.reduce((sum, s) => sum + (s.advanceBalance || 0), 0)
      };
      setTimeout(() => resolve(stats), 100);
    });
  },

  // Search students
  async searchStudents(searchTerm) {
    return new Promise((resolve) => {
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm) ||
        student.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setTimeout(() => resolve(filtered), 100);
    });
  }
};
