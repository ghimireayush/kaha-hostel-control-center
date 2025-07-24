const fs = require('fs').promises;
const path = require('path');

// Path to the booking requests data file
const dataFilePath = path.join(__dirname, '../data/bookingRequests.json');

// Helper function to read booking data from file
async function readBookingData() {
    try {
        const data = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading booking data:', error);
        throw new Error('Failed to read booking data');
    }
}

// Helper function to write booking data to file
async function writeBookingData(bookings) {
    try {
        await fs.writeFile(dataFilePath, JSON.stringify(bookings, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing booking data:', error);
        throw new Error('Failed to write booking data');
    }
}

/**
 * Get all booking requests with optional filtering and pagination
 * @param {Object} options - Filter and pagination options
 * @param {string} options.status - Filter by status ('all', 'Pending', 'Approved', 'Rejected')
 * @param {string} options.search - Search term for name or phone
 * @param {number} options.page - Page number for pagination
 * @param {number} options.limit - Number of items per page
 * @returns {Promise<Object>} Paginated booking requests and pagination info
 */
async function getAllBookingRequests({ status = 'all', search = '', page = 1, limit = 50 }) {
    const bookings = await readBookingData();
    let filteredBookings = [...bookings]; // Work on a copy

    // Apply status filter
    if (status !== 'all') {
        filteredBookings = filteredBookings.filter(b => b.status.toLowerCase() === status.toLowerCase());
    }

    // Apply search filter (name or phone)
    if (search) {
        const searchTerm = search.toLowerCase();
        filteredBookings = filteredBookings.filter(b =>
            b.name.toLowerCase().includes(searchTerm) ||
            b.phone.includes(searchTerm) // Phone might contain numbers/dashes
        );
    }

    // Apply pagination
    const totalItems = filteredBookings.length;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.max(1, Math.min(page, totalPages)); // Clamp page
    const startIndex = (currentPage - 1) * limit;
    const paginatedBookings = filteredBookings.slice(startIndex, startIndex + limit);

    return {
        items: paginatedBookings,
        pagination: {
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage: parseInt(limit, 10)
        }
    };
}

/**
 * Get statistics about booking requests
 * @returns {Promise<Object>} Booking statistics
 */
async function getBookingStats() {
    const bookings = await readBookingData();
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'Pending').length;
    const approved = bookings.filter(b => b.status === 'Approved').length;
    const rejected = bookings.filter(b => b.status === 'Rejected').length;

    return { total, pending, approved, rejected };
}

/**
 * Get a booking request by ID
 * @param {string} id - Booking request ID
 * @returns {Promise<Object|null>} Booking request or null if not found
 */
async function getBookingRequestById(id) {
    const bookings = await readBookingData();
    const booking = bookings.find(b => b.id === id);
    return booking || null;
}

/**
 * Approve a booking request
 * @param {string} id - Booking request ID
 * @param {string} roomAssignment - Room assigned to the student
 * @returns {Promise<Object>} Updated booking and student data
 */
async function approveBookingRequest(id, roomAssignment) {
    const bookings = await readBookingData();
    const bookingIndex = bookings.findIndex(b => b.id === id);

    if (bookingIndex === -1) {
        const error = new Error('Booking request not found');
        error.statusCode = 404;
        throw error;
    }

    const booking = bookings[bookingIndex];

    if (booking.status !== 'Pending') {
        const error = new Error(`Booking request has already been ${booking.status.toLowerCase()}`);
        error.statusCode = 422; // Unprocessable Entity
        throw error;
    }

    // Update booking status
    const updatedBooking = {
        ...booking,
        status: 'Approved',
        approvedDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };
    bookings[bookingIndex] = updatedBooking;

    // Save updated bookings
    await writeBookingData(bookings);

    // Mock student data based on the booking
    const mockStudent = {
        id: `STU${id.replace('BR', '')}`, // Derive student ID from booking ID
        name: booking.name,
        phone: booking.phone,
        email: booking.email,
        roomNumber: roomAssignment, // Use the assigned room
        guardianName: booking.guardianName,
        guardianPhone: booking.guardianPhone,
        address: booking.address,
        baseMonthlyFee: 15000, // Mock value
        laundryFee: 500,       // Mock value
        foodFee: 0,            // Mock value
        enrollmentDate: updatedBooking.approvedDate, // Use approved date
        status: "Active",
        currentBalance: 15500, // Mock value (base + laundry)
        advanceBalance: 0,
        emergencyContact: booking.emergencyContact,
        course: booking.course,
        institution: booking.institution,
        idProofType: booking.idProofType,
        idProofNumber: booking.idProofNumber,
        bookingRequestId: id // Link back to the booking request
    };

    return {
        booking: {
            id: updatedBooking.id,
            status: updatedBooking.status,
            approvedDate: updatedBooking.approvedDate,
            assignedRoom: roomAssignment
        },
        student: mockStudent // Return the mocked student data
    };
}

/**
 * Reject a booking request
 * @param {string} id - Booking request ID
 * @param {string} reason - Reason for rejection (optional)
 * @returns {Promise<Object>} Updated booking data
 */
async function rejectBookingRequest(id, reason) {
    const bookings = await readBookingData();
    const bookingIndex = bookings.findIndex(b => b.id === id);

    if (bookingIndex === -1) {
        const error = new Error('Booking request not found');
        error.statusCode = 404;
        throw error;
    }

    const booking = bookings[bookingIndex];

    if (booking.status !== 'Pending') {
        const error = new Error(`Booking request has already been ${booking.status.toLowerCase()}`);
        error.statusCode = 422; // Unprocessable Entity
        throw error;
    }

    // Update booking status
    const updatedBooking = {
        ...booking,
        status: 'Rejected',
        rejectedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        notes: reason || booking.notes // Update notes with reason if provided
    };
    bookings[bookingIndex] = updatedBooking;

    // Save updated bookings
    await writeBookingData(bookings);

    return {
        id: updatedBooking.id,
        status: updatedBooking.status,
        rejectedDate: updatedBooking.rejectedDate,
        notes: updatedBooking.notes
    };
}

module.exports = {
    getAllBookingRequests,
    getBookingStats,
    getBookingRequestById,
    approveBookingRequest,
    rejectBookingRequest
};