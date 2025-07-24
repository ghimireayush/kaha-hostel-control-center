const bookingService = require('../services/bookingService');

/**
 * Get all booking requests with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAllBookingRequests(req, res, next) {
    try {
        const { status = 'all', search = '', page = 1, limit = 50 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        
        // Validate pagination parameters
        if (isNaN(pageNum) || pageNum < 1) {
            const error = new Error('Invalid page number');
            error.statusCode = 422;
            error.details = { page: 'Page must be a positive integer' };
            throw error;
        }
        
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            const error = new Error('Invalid limit');
            error.statusCode = 422;
            error.details = { limit: 'Limit must be a positive integer between 1 and 100' };
            throw error;
        }

        const result = await bookingService.getAllBookingRequests({
            status,
            search,
            page: pageNum,
            limit: limitNum
        });

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get booking request statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getBookingStats(req, res, next) {
    try {
        const stats = await bookingService.getBookingStats();
        res.status(200).json({
            status: 200,
            data: stats
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get a booking request by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getBookingRequestById(req, res, next) {
    try {
        const { id } = req.params;
        const booking = await bookingService.getBookingRequestById(id);

        if (!booking) {
            const error = new Error('Booking request not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            status: 200,
            data: booking
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Approve a booking request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function approveBookingRequest(req, res, next) {
    try {
        const { id } = req.params;
        const { roomAssignment } = req.body;

        if (!roomAssignment || typeof roomAssignment !== 'string') {
            const error = new Error('Room assignment is required and must be a string');
            error.statusCode = 422;
            error.details = { roomAssignment: 'Room assignment is required and must be a string' };
            throw error;
        }

        const result = await bookingService.approveBookingRequest(id, roomAssignment);

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Reject a booking request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function rejectBookingRequest(req, res, next) {
    try {
        const { id } = req.params;
        const { reason } = req.body; // Reason is optional

        const result = await bookingService.rejectBookingRequest(id, reason);

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Create a new booking request (placeholder)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function createBookingRequest(req, res, next) {
    try {
        // For now, just return a placeholder response matching the blueprint
        const newBookingData = req.body;
        // Generate a mock ID for demonstration
        const mockId = `BR${Math.floor(1000 + Math.random() * 9000)}`;
        const currentDate = new Date().toISOString().split('T')[0];

        const newBooking = {
            id: mockId,
            ...newBookingData,
            requestDate: currentDate,
            status: "Pending"
        };

        res.status(201).json({
            status: 201,
            data: newBooking
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllBookingRequests,
    getBookingStats,
    getBookingRequestById,
    approveBookingRequest,
    rejectBookingRequest,
    createBookingRequest
};