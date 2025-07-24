const fs = require('fs').promises;
const path = require('path');

// Path to the students data file
const dataFilePath = path.join(__dirname, '../data/students.json');

// Helper function to read student data from file
async function readStudentData() {
    try {
        const data = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading student data:', error);
        throw new Error('Failed to read student data');
    }
}

// Helper function to write student data to file
async function writeStudentData(students) {
    try {
        await fs.writeFile(dataFilePath, JSON.stringify(students, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing student data:', error);
        throw new Error('Failed to write student data');
    }
}

/**
 * Get all students with optional filtering and pagination
 * @param {Object} options - Filter and pagination options
 * @param {string} options.status - Filter by status ('all', 'Active', 'Inactive')
 * @param {string} options.search - Search term for name, room number, or phone
 * @param {number} options.page - Page number for pagination
 * @param {number} options.limit - Number of items per page
 * @returns {Promise<Object>} Paginated students and pagination info
 */
async function getAllStudents({ status = 'all', search = '', page = 1, limit = 50 }) {
    const students = await readStudentData();
    let filteredStudents = [...students]; // Work on a copy

    // Apply status filter
    if (status !== 'all') {
        const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        filteredStudents = filteredStudents.filter(s => s.status === normalizedStatus);
    }

    // Apply search filter (name, room number, or phone)
    if (search) {
        const searchTerm = search.toLowerCase();
        filteredStudents = filteredStudents.filter(s =>
            s.name.toLowerCase().includes(searchTerm) ||
            (s.roomNumber && s.roomNumber.toLowerCase().includes(searchTerm)) ||
            s.phone.includes(searchTerm)
        );
    }

    // Apply pagination
    const totalItems = filteredStudents.length;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.max(1, Math.min(page, totalPages)); // Clamp page
    const startIndex = (currentPage - 1) * limit;
    const paginatedStudents = filteredStudents.slice(startIndex, startIndex + limit);

    return {
        items: paginatedStudents,
        pagination: {
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage: parseInt(limit, 10)
        }
    };
}

/**
 * Get statistics about students
 * @returns {Promise<Object>} Student statistics
 */
async function getStudentStats() {
    const students = await readStudentData();
    const total = students.length;
    const active = students.filter(s => s.status === 'Active').length;
    const inactive = students.filter(s => s.status === 'Inactive').length;
    
    // Calculate financial stats based on Active students
    const activeStudents = students.filter(s => s.status === 'Active');
    const totalOutstanding = activeStudents.reduce((sum, student) => sum + (student.currentBalance || 0), 0);
    const totalAdvances = students.reduce((sum, student) => sum + (student.advanceBalance || 0), 0);

    return { total, active, inactive, totalOutstanding, totalAdvances };
}

/**
 * Get a student by ID
 * @param {string} id - Student ID
 * @returns {Promise<Object|null>} Student or null if not found
 */
async function getStudentById(id) {
    const students = await readStudentData();
    const student = students.find(s => s.id === id);
    return student || null;
}

/**
 * Process student checkout
 * @param {string} id - Student ID
 * @param {Object} checkoutDetails - Checkout details
 * @param {string} checkoutDetails.checkoutDate - Date of checkout
 * @param {string} checkoutDetails.reason - Reason for checkout (optional)
 * @param {number} checkoutDetails.refundAmount - Amount to refund (optional)
 * @param {string} checkoutDetails.refundMethod - Method of refund (optional)
 * @param {string} checkoutDetails.refundReference - Reference for refund (optional)
 * @param {string} checkoutDetails.notes - Additional notes (optional)
 * @param {boolean} checkoutDetails.finalBillSettled - Whether final bill is settled
 * @param {string} checkoutDetails.roomCondition - Condition of room at checkout (optional)
 * @returns {Promise<Object>} Checkout result
 */
async function processCheckout(id, checkoutDetails) {
    const students = await readStudentData();
    const studentIndex = students.findIndex(s => s.id === id);

    if (studentIndex === -1) {
        const error = new Error('Student not found');
        error.statusCode = 404;
        throw error;
    }

    const student = students[studentIndex];

    if (student.status !== 'Active') {
        const error = new Error('Student is not currently active');
        error.statusCode = 422; // Unprocessable Entity
        throw error;
    }

    const { checkoutDate, reason, refundAmount = 0, refundMethod, refundReference, notes, finalBillSettled, roomCondition } = checkoutDetails;

    // Basic validation for required fields
    if (!checkoutDate) {
        const error = new Error('Checkout date is required');
        error.statusCode = 422;
        error.details = { checkoutDate: 'Checkout date is required' };
        throw error;
    }

    // Update student status
    const updatedStudent = {
        ...student,
        status: 'Inactive',
        checkoutDate: checkoutDate,
        checkoutReason: reason || '',
        checkoutNotes: notes || student.notes || '',
        roomConditionAtCheckout: roomCondition || 'Good'
    };
    students[studentIndex] = updatedStudent;

    // Save updated students
    await writeStudentData(students);

    // Calculate final balance
    const finalBalance = (student.currentBalance || 0) - (refundAmount || 0);

    return {
        studentId: updatedStudent.id,
        studentName: updatedStudent.name,
        roomNumber: updatedStudent.roomNumber,
        checkoutDate: checkoutDate,
        refundAmount: refundAmount || 0,
        refundReference: refundReference || null,
        finalBalance: finalBalance,
        roomStatus: "Available", // Mock room status update
        message: "Student checkout processed successfully"
    };
}

module.exports = {
    getAllStudents,
    getStudentStats,
    getStudentById,
    processCheckout
};