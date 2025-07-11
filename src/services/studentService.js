
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

  // Create new student
  async createStudent(studentData) {
    return new Promise((resolve) => {
      const newStudent = {
        id: `STU${String(students.length + 1).padStart(3, '0')}`,
        ...studentData,
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        currentBalance: 0,
        advanceBalance: 0,
        totalPaid: 0,
        totalCharges: 0
      };
      students.push(newStudent);
      setTimeout(() => resolve(newStudent), 100);
    });
  },

  // Update student
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

  // Delete student
  async deleteStudent(id) {
    return new Promise((resolve) => {
      const index = students.findIndex(s => s.id === id);
      if (index !== -1) {
        const deletedStudent = students.splice(index, 1)[0];
        setTimeout(() => resolve(deletedStudent), 100);
      } else {
        setTimeout(() => resolve(null), 100);
      }
    });
  },

  // Search students
  async searchStudents(query) {
    return new Promise((resolve) => {
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.roomNumber.toLowerCase().includes(query.toLowerCase()) ||
        student.phone.includes(query)
      );
      setTimeout(() => resolve(filtered), 100);
    });
  },

  // Get students with outstanding dues
  async getStudentsWithDues() {
    return new Promise((resolve) => {
      const studentsWithDues = students.filter(s => s.currentBalance > 0);
      setTimeout(() => resolve(studentsWithDues), 100);
    });
  }
};
