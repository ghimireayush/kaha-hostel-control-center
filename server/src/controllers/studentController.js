const studentService = require('../services/studentService');

/**
 * Get all students with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAllStudents(req, res, next) {
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

        const result = await studentService.getAllStudents({
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
 * Get student statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getStudentStats(req, res, next) {
    try {
        const stats = await studentService.getStudentStats();
        res.status(200).json({
            status: 200,
            data: stats
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get a student by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getStudentById(req, res, next) {
    try {
        const { id } = req.params;
        const student = await studentService.getStudentById(id);

        if (!student) {
            const error = new Error('Student not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            status: 200,
            data: student
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Process student checkout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function processCheckout(req, res, next) {
    try {
        const { id } = req.params;
        const checkoutDetails = req.body;

        // Basic validation for required fields
        if (!checkoutDetails.checkoutDate) {
            const error = new Error('Checkout date is required');
            error.statusCode = 422;
            error.details = { checkoutDate: 'Checkout date is required' };
            throw error;
        }

        const result = await studentService.processCheckout(id, checkoutDetails);

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllStudents,
    getStudentStats,
    getStudentById,
    processCheckout
};